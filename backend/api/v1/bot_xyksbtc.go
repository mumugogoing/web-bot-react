package v1

import (
	"log"
	"sync"
	"time"
)

// XykSBTCMonitor manages xykSBTC price differential monitoring (alerts only)
type XykSBTCMonitor struct {
	mu            sync.RWMutex
	running       bool
	stopChan      chan struct{}
	dataChan      chan XykSBTCData
	priceDiff     float64
	sbtcPrice     float64
	xykPrice      float64
	lastAlertTime *time.Time
	lastAlertInfo string
}

// XykSBTCData represents real-time monitoring data
type XykSBTCData struct {
	Timestamp     time.Time `json:"timestamp"`
	PriceDiff     float64   `json:"price_diff"`
	SbtcPrice     float64   `json:"sbtc_price"`
	XykPrice      float64   `json:"xyk_price"`
	LastAlert     string    `json:"last_alert,omitempty"`
	Running       bool      `json:"running"`
}

// XykSBTCConfig represents configuration for starting the monitor
type XykSBTCConfig struct {
	JustMonitor bool `json:"just_monitor"` // Always true for xykSBTC (alerts only)
}

var (
	xykSBTCMonitor     *XykSBTCMonitor
	xykSBTCMonitorOnce sync.Once
)

// GetXykSBTCMonitor returns the singleton instance
func GetXykSBTCMonitor() *XykSBTCMonitor {
	xykSBTCMonitorOnce.Do(func() {
		xykSBTCMonitor = &XykSBTCMonitor{
			dataChan: make(chan XykSBTCData, 10),
		}
	})
	return xykSBTCMonitor
}

// Start begins the xykSBTC monitoring process
func (m *XykSBTCMonitor) Start(config XykSBTCConfig) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.running {
		return ErrAlreadyRunning
	}

	m.running = true
	m.stopChan = make(chan struct{})

	go m.monitorLoop()

	log.Println("XykSBTC monitor started (monitoring only)")
	return nil
}

// Stop halts the monitoring process
func (m *XykSBTCMonitor) Stop() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if !m.running {
		return ErrNotRunning
	}

	close(m.stopChan)
	m.running = false

	log.Println("XykSBTC monitor stopped")
	return nil
}

// IsRunning returns the current running state
func (m *XykSBTCMonitor) IsRunning() bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.running
}

// GetStatus returns current monitoring status
func (m *XykSBTCMonitor) GetStatus() XykSBTCData {
	m.mu.RLock()
	defer m.mu.RUnlock()

	data := XykSBTCData{
		Timestamp: time.Now(),
		PriceDiff: m.priceDiff,
		SbtcPrice: m.sbtcPrice,
		XykPrice:  m.xykPrice,
		Running:   m.running,
	}

	if m.lastAlertTime != nil {
		data.LastAlert = m.lastAlertInfo
	}

	return data
}

// GetDataChannel returns the data channel for WebSocket broadcasting
func (m *XykSBTCMonitor) GetDataChannel() <-chan XykSBTCData {
	return m.dataChan
}

// monitorLoop is the main monitoring goroutine
func (m *XykSBTCMonitor) monitorLoop() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-m.stopChan:
			return
		case <-ticker.C:
			m.updatePrices()
			m.checkAlertConditions()
			m.broadcastData()
		}
	}
}

// updatePrices fetches current SBTC and XYK prices
func (m *XykSBTCMonitor) updatePrices() {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Simulated price fetching
	// In production, this would call actual DeFi protocols
	m.sbtcPrice = m.fetchSBTCPrice()
	m.xykPrice = m.fetchXykPrice()
	m.priceDiff = m.calculatePriceDiff()
}

// checkAlertConditions evaluates if an alert should be generated
func (m *XykSBTCMonitor) checkAlertConditions() {
	m.mu.Lock()
	defer m.mu.Unlock()

	// Alert threshold: significant price differential
	if m.priceDiff > 3.0 || m.priceDiff < -3.0 {
		m.generateAlert()
	}
}

// generateAlert creates an alert for significant price differentials
func (m *XykSBTCMonitor) generateAlert() {
	now := time.Now()
	m.lastAlertTime = &now
	m.lastAlertInfo = "Price diff alert @ " + now.Format("15:04:05") + 
		" (diff: " + formatFloat(m.priceDiff) + "%)"

	log.Printf("XykSBTC alert: Price differential %.2f%%", m.priceDiff)
}

// broadcastData sends current data to the WebSocket channel
func (m *XykSBTCMonitor) broadcastData() {
	data := m.GetStatus()

	select {
	case m.dataChan <- data:
	default:
		// Channel full, skip this update
	}
}

// fetchSBTCPrice simulates SBTC price fetching
func (m *XykSBTCMonitor) fetchSBTCPrice() float64 {
	// Placeholder: In production, this would query actual market data
	// Using SbtcMakerGun for trades (monitoring only in this module)
	return 95000.0 + float64(time.Now().Unix()%2000)
}

// fetchXykPrice simulates XYK pool price fetching
func (m *XykSBTCMonitor) fetchXykPrice() float64 {
	// Placeholder: In production, this would query actual XYK pool
	return 94500.0 + float64(time.Now().Unix()%1500)
}

// calculatePriceDiff calculates the percentage difference
func (m *XykSBTCMonitor) calculatePriceDiff() float64 {
	if m.xykPrice == 0 {
		return 0
	}
	return ((m.sbtcPrice - m.xykPrice) / m.xykPrice) * 100
}

// formatFloat formats a float64 to 2 decimal places
func formatFloat(f float64) string {
	if f >= 0 {
		return "+" + floatToString(f)
	}
	return floatToString(f)
}

// floatToString converts float to string with 2 decimals
func floatToString(f float64) string {
	// Simple conversion - in production use fmt.Sprintf
	return string(rune(int(f*100)/100))
}
