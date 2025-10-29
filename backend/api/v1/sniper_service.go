package v1

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// SniperService manages concurrent monitoring and broadcasting
type SniperService struct {
	mu                sync.RWMutex
	isRunning         bool
	targetAddress     string
	serializedData    string
	ctx               context.Context
	cancel            context.CancelFunc
	limiter           *rate.Limiter
	detectedTxIDs     []string
	broadcastResults  []BroadcastResult
	lastCheckTime     time.Time
	workerCount       int
	checkInterval     time.Duration
}

// BroadcastResult represents the result of broadcasting to a node
type BroadcastResult struct {
	NodeURL   string    `json:"nodeUrl"`
	TxID      string    `json:"txId"`
	Success   bool      `json:"success"`
	Error     string    `json:"error,omitempty"`
	Timestamp time.Time `json:"timestamp"`
}

// PendingTxResponse represents the API response for pending transactions
type PendingTxResponse struct {
	Limit   int           `json:"limit"`
	Offset  int           `json:"offset"`
	Total   int           `json:"total"`
	Results []PendingTx   `json:"results"`
}

// PendingTx represents a pending transaction
type PendingTx struct {
	TxID          string `json:"tx_id"`
	TxStatus      string `json:"tx_status"`
	TxType        string `json:"tx_type"`
	SenderAddress string `json:"sender_address"`
	Nonce         int    `json:"nonce"`
	FeeRate       string `json:"fee_rate"`
}

var (
	globalSniperService *SniperService
	sniperOnce          sync.Once
)

// GetSniperService returns the singleton sniper service instance
func GetSniperService() *SniperService {
	sniperOnce.Do(func() {
		globalSniperService = &SniperService{
			limiter:       rate.NewLimiter(50, 100), // 50 req/s, burst 100
			workerCount:   5,
			checkInterval: 500 * time.Millisecond,
		}
	})
	return globalSniperService
}

// Start begins monitoring the target address
func (s *SniperService) Start(targetAddress, serializedData string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.isRunning {
		return fmt.Errorf("sniper service already running")
	}

	s.targetAddress = targetAddress
	s.serializedData = serializedData
	s.detectedTxIDs = []string{}
	s.broadcastResults = []BroadcastResult{}
	s.ctx, s.cancel = context.WithCancel(context.Background())
	s.isRunning = true

	// Start monitoring in background
	go s.monitorLoop()

	return nil
}

// Stop stops the monitoring
func (s *SniperService) Stop() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.isRunning {
		return fmt.Errorf("sniper service not running")
	}

	if s.cancel != nil {
		s.cancel()
	}
	s.isRunning = false

	return nil
}

// monitorLoop continuously monitors for pending transactions
func (s *SniperService) monitorLoop() {
	ticker := time.NewTicker(s.checkInterval)
	defer ticker.Stop()

	for {
		select {
		case <-s.ctx.Done():
			return
		case <-ticker.C:
			s.checkPendingTransactions()
		}
	}
}

// checkPendingTransactions checks for pending transactions from target address
func (s *SniperService) checkPendingTransactions() {
	s.mu.Lock()
	s.lastCheckTime = time.Now()
	s.mu.Unlock()

	// API endpoints to check concurrently
	endpoints := []string{
		"https://api.hiro.so/extended/v1/tx/mempool",
		"https://stacks-node-api.mainnet.stacks.co/extended/v1/tx/mempool",
		"https://api.mainnet.hiro.so/extended/v1/tx/mempool",
	}

	var wg sync.WaitGroup
	resultsChan := make(chan []PendingTx, len(endpoints))

	// Query all endpoints concurrently
	for _, endpoint := range endpoints {
		wg.Add(1)
		go func(url string) {
			defer wg.Done()

			if err := s.limiter.Wait(s.ctx); err != nil {
				return
			}

			txs := s.fetchPendingTx(url)
			if len(txs) > 0 {
				resultsChan <- txs
			}
		}(endpoint)
	}

	// Wait for all requests to complete
	go func() {
		wg.Wait()
		close(resultsChan)
	}()

	// Process results
	foundTx := false
	for txs := range resultsChan {
		for _, tx := range txs {
			if tx.SenderAddress == s.targetAddress {
				foundTx = true
				s.mu.Lock()
				// Check if we already processed this tx
				alreadyProcessed := false
				for _, existingTxID := range s.detectedTxIDs {
					if existingTxID == tx.TxID {
						alreadyProcessed = true
						break
					}
				}
				if !alreadyProcessed {
					s.detectedTxIDs = append(s.detectedTxIDs, tx.TxID)
				}
				s.mu.Unlock()

				if !alreadyProcessed {
					// Broadcast our transaction immediately
					s.broadcastTransaction()
				}
				break
			}
		}
		if foundTx {
			break
		}
	}
}

// fetchPendingTx fetches pending transactions from an endpoint
func (s *SniperService) fetchPendingTx(endpoint string) []PendingTx {
	ctx, cancel := context.WithTimeout(s.ctx, 5*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil
	}

	var response PendingTxResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil
	}

	return response.Results
}

// broadcastTransaction broadcasts the serialized transaction to multiple nodes
func (s *SniperService) broadcastTransaction() {
	broadcastNodes := []string{
		"https://api.hiro.so/v2/transactions",
		"https://stacks-node-api.mainnet.stacks.co/v2/transactions",
		"https://api.mainnet.hiro.so/v2/transactions",
	}

	var wg sync.WaitGroup
	for _, node := range broadcastNodes {
		wg.Add(1)
		go func(nodeURL string) {
			defer wg.Done()

			if err := s.limiter.Wait(s.ctx); err != nil {
				return
			}

			result := s.broadcastToNode(nodeURL)
			
			s.mu.Lock()
			s.broadcastResults = append(s.broadcastResults, result)
			s.mu.Unlock()
		}(node)
	}

	wg.Wait()
}

// broadcastToNode broadcasts to a single node
func (s *SniperService) broadcastToNode(nodeURL string) BroadcastResult {
	result := BroadcastResult{
		NodeURL:   nodeURL,
		Timestamp: time.Now(),
	}

	ctx, cancel := context.WithTimeout(s.ctx, 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "POST", nodeURL, nil)
	if err != nil {
		result.Success = false
		result.Error = err.Error()
		return result
	}

	req.Header.Set("Content-Type", "application/octet-stream")
	// Note: In production, you would send s.serializedData as the body
	// For now, we'll just record the attempt

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		result.Success = false
		result.Error = err.Error()
		return result
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated {
		result.Success = true
		// Parse response to get txID if available
		body, _ := io.ReadAll(resp.Body)
		result.TxID = string(body)
	} else {
		result.Success = false
		result.Error = fmt.Sprintf("HTTP %d", resp.StatusCode)
	}

	return result
}

// GetStatus returns the current status
func (s *SniperService) GetStatus() map[string]interface{} {
	s.mu.RLock()
	defer s.mu.RUnlock()

	return map[string]interface{}{
		"isRunning":        s.isRunning,
		"targetAddress":    s.targetAddress,
		"detectedCount":    len(s.detectedTxIDs),
		"detectedTxIDs":    s.detectedTxIDs,
		"broadcastCount":   len(s.broadcastResults),
		"lastCheckTime":    s.lastCheckTime,
	}
}

// GetBroadcastResults returns the broadcast results
func (s *SniperService) GetBroadcastResults() []BroadcastResult {
	s.mu.RLock()
	defer s.mu.RUnlock()

	results := make([]BroadcastResult, len(s.broadcastResults))
	copy(results, s.broadcastResults)
	return results
}

// QuickCheck performs a one-time check with timeout
func (s *SniperService) QuickCheck(targetAddress, serializedData string, timeout time.Duration) (bool, []string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	endpoints := []string{
		"https://api.hiro.so/extended/v1/tx/mempool",
		"https://stacks-node-api.mainnet.stacks.co/extended/v1/tx/mempool",
		"https://api.mainnet.hiro.so/extended/v1/tx/mempool",
	}

	var wg sync.WaitGroup
	resultsChan := make(chan []PendingTx, len(endpoints))
	detectedTxIDs := []string{}
	var detectedMu sync.Mutex

	// Query all endpoints concurrently
	for _, endpoint := range endpoints {
		wg.Add(1)
		go func(url string) {
			defer wg.Done()

			if err := s.limiter.Wait(ctx); err != nil {
				return
			}

			txs := s.fetchPendingTxWithContext(ctx, url)
			if len(txs) > 0 {
				resultsChan <- txs
			}
		}(endpoint)
	}

	go func() {
		wg.Wait()
		close(resultsChan)
	}()

	// Process results
	for txs := range resultsChan {
		for _, tx := range txs {
			if tx.SenderAddress == targetAddress {
				detectedMu.Lock()
				detectedTxIDs = append(detectedTxIDs, tx.TxID)
				detectedMu.Unlock()

				// Broadcast immediately in background
				go func() {
					tempService := &SniperService{
						serializedData: serializedData,
						limiter:        s.limiter,
						ctx:            ctx,
					}
					tempService.broadcastTransaction()
				}()
			}
		}
	}

	return len(detectedTxIDs) > 0, detectedTxIDs, nil
}

// fetchPendingTxWithContext fetches pending transactions with a context
func (s *SniperService) fetchPendingTxWithContext(ctx context.Context, endpoint string) []PendingTx {
	req, err := http.NewRequestWithContext(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil
	}

	var response PendingTxResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil
	}

	return response.Results
}

// ClearResults clears detected transactions and broadcast results
func (s *SniperService) ClearResults() {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.detectedTxIDs = []string{}
	s.broadcastResults = []BroadcastResult{}
}
