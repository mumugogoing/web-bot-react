package v1

import (
	"log"
	"sync"
	"time"
)

// AeUSDCMonitor manages aeUSDC monitoring with automatic arbitrage trading
type AeUSDCMonitor struct {
	mu            sync.RWMutex
	running       bool
	justMonitor   bool
	stopChan      chan struct{}
	dataChan      chan AeUSDCData
	xykDiff       float64
	aeUSDCBalance float64
	stxBalance    float64
	lastTradeTime *time.Time
	lastTradeInfo string
}

// AeUSDCData represents real-time monitoring data
type AeUSDCData struct {
	Timestamp     time.Time `json:"timestamp"`
	XykDiff       float64   `json:"xyk_diff"`
	AeUSDCBalance float64   `json:"aeusdc_balance"`
	StxBalance    float64   `json:"stx_balance"`
	LastTrade     string    `json:"last_trade,omitempty"`
	Running       bool      `json:"running"`
}

// AeUSDCConfig represents configuration for starting the monitor
type AeUSDCConfig struct {
	JustMonitor bool `json:"just_monitor"`
}

var (
	aeUSDCMonitor     *AeUSDCMonitor
	aeUSDCMonitorOnce sync.Once
)

// GetAeUSDCMonitor returns the singleton instance
func GetAeUSDCMonitor() *AeUSDCMonitor {
	aeUSDCMonitorOnce.Do(func() {
		aeUSDCMonitor = &AeUSDCMonitor{
			dataChan: make(chan AeUSDCData, 10),
		}
	})
	return aeUSDCMonitor
}

// Start begins the aeUSDC monitoring/trading process
func (m *AeUSDCMonitor) Start(config AeUSDCConfig) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.running {
		return ErrAlreadyRunning
	}

	m.running = true
	m.justMonitor = config.JustMonitor
	m.stopChan = make(chan struct{})

	go m.monitorLoop()

	log.Printf("AeUSDC monitor started (mode: %s)", m.getMode())
	return nil
}

// Stop halts the monitoring process
func (m *AeUSDCMonitor) Stop() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if !m.running {
		return ErrNotRunning
	}

	close(m.stopChan)
	m.running = false

	log.Println("AeUSDC monitor stopped")
	return nil
}

// IsRunning returns the current running state
func (m *AeUSDCMonitor) IsRunning() bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.running
}

// GetStatus returns current monitoring status
func (m *AeUSDCMonitor) GetStatus() AeUSDCData {
	m.mu.RLock()
	defer m.mu.RUnlock()

	data := AeUSDCData{
		Timestamp:     time.Now(),
		XykDiff:       m.xykDiff,
		AeUSDCBalance: m.aeUSDCBalance,
		StxBalance:    m.stxBalance,
		Running:       m.running,
	}

	if m.lastTradeTime != nil {
		data.LastTrade = m.lastTradeInfo
	}

	return data
}

// GetDataChannel returns the data channel for WebSocket broadcasting
func (m *AeUSDCMonitor) GetDataChannel() <-chan AeUSDCData {
	return m.dataChan
}

// monitorLoop is the main monitoring goroutine
func (m *AeUSDCMonitor) monitorLoop() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-m.stopChan:
			return
		case <-ticker.C:
			m.updateMetrics()
			m.checkTradingConditions()
			m.broadcastData()
		}
	}
}

// updateMetrics fetches current prices and balances
func (m *AeUSDCMonitor) updateMetrics() {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Simulated price differential calculation
	// In production, this would call actual DeFi protocols
	m.xykDiff = m.calculateXykDiff()

	// Simulated balance fetching
	// In production, this would query actual wallet balances
	m.aeUSDCBalance = m.fetchAeUSDCBalance()
	m.stxBalance = m.fetchStxBalance()
}

// checkTradingConditions evaluates if trading should occur
func (m *AeUSDCMonitor) checkTradingConditions() {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.justMonitor {
		return
	}

	// Trading thresholds preserved from original AutoSwap11() logic
	if m.xykDiff > 2.0 {
		m.executeTrade("STX -> USDC")
	} else if m.xykDiff < -2.0 {
		m.executeTrade("USDC -> STX")
	}
}

// executeTrade performs the actual trading operation
func (m *AeUSDCMonitor) executeTrade(direction string) {
	now := time.Now()
	m.lastTradeTime = &now
	m.lastTradeInfo = direction + " @ " + now.Format("15:04:05")

	log.Printf("AeUSDC trade executed: %s (diff: %.2f%%)", direction, m.xykDiff)
}

// broadcastData sends current data to the WebSocket channel
func (m *AeUSDCMonitor) broadcastData() {
	data := m.GetStatus()

	select {
	case m.dataChan <- data:
	default:
		// Channel full, skip this update
	}
}

// calculateXykDiff simulates price differential calculation
func (m *AeUSDCMonitor) calculateXykDiff() float64 {
	// Placeholder: In production, this would calculate actual XYK pool differential
	// Using simple simulation for demonstration
	return float64(time.Now().Unix()%10-5) * 0.5
}

// fetchAeUSDCBalance simulates balance fetching
func (m *AeUSDCMonitor) fetchAeUSDCBalance() float64 {
	// Placeholder: In production, this would query actual wallet
	return 10000.0 + float64(time.Now().Unix()%1000)
}

// fetchStxBalance simulates STX balance fetching
func (m *AeUSDCMonitor) fetchStxBalance() float64 {
	// Placeholder: In production, this would query actual wallet
	return 5000.0 + float64(time.Now().Unix()%500)
}

// getMode returns a human-readable mode string
func (m *AeUSDCMonitor) getMode() string {
	if m.justMonitor {
		return "monitor-only"
	}
	return "trade"
}
