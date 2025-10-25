package tests

import (
	"testing"
	"time"

	v1 "github.com/mumugogoing/web-bot-react/backend/api/v1"
)

func TestAeUSDCMonitorStartStop(t *testing.T) {
	monitor := v1.GetAeUSDCMonitor()

	// Ensure monitor is stopped initially
	if monitor.IsRunning() {
		_ = monitor.Stop()
		time.Sleep(100 * time.Millisecond)
	}

	// Test start
	config := v1.AeUSDCConfig{JustMonitor: true}
	err := monitor.Start(config)
	if err != nil {
		t.Fatalf("Failed to start monitor: %v", err)
	}

	if !monitor.IsRunning() {
		t.Error("Monitor should be running after start")
	}

	// Test duplicate start protection
	err = monitor.Start(config)
	if err != v1.ErrAlreadyRunning {
		t.Error("Should return ErrAlreadyRunning when starting already running monitor")
	}

	// Test stop
	err = monitor.Stop()
	if err != nil {
		t.Fatalf("Failed to stop monitor: %v", err)
	}

	if monitor.IsRunning() {
		t.Error("Monitor should not be running after stop")
	}

	// Test stop when not running
	err = monitor.Stop()
	if err != v1.ErrNotRunning {
		t.Error("Should return ErrNotRunning when stopping non-running monitor")
	}
}

func TestXykSBTCMonitorStartStop(t *testing.T) {
	monitor := v1.GetXykSBTCMonitor()

	// Ensure monitor is stopped initially
	if monitor.IsRunning() {
		_ = monitor.Stop()
		time.Sleep(100 * time.Millisecond)
	}

	// Test start
	config := v1.XykSBTCConfig{JustMonitor: true}
	err := monitor.Start(config)
	if err != nil {
		t.Fatalf("Failed to start monitor: %v", err)
	}

	if !monitor.IsRunning() {
		t.Error("Monitor should be running after start")
	}

	// Test duplicate start protection
	err = monitor.Start(config)
	if err != v1.ErrAlreadyRunning {
		t.Error("Should return ErrAlreadyRunning when starting already running monitor")
	}

	// Test stop
	err = monitor.Stop()
	if err != nil {
		t.Fatalf("Failed to stop monitor: %v", err)
	}

	if monitor.IsRunning() {
		t.Error("Monitor should not be running after stop")
	}

	// Test stop when not running
	err = monitor.Stop()
	if err != v1.ErrNotRunning {
		t.Error("Should return ErrNotRunning when stopping non-running monitor")
	}
}

func TestAeUSDCConcurrentOperation(t *testing.T) {
	monitor := v1.GetAeUSDCMonitor()

	// Ensure monitor is stopped
	if monitor.IsRunning() {
		_ = monitor.Stop()
		time.Sleep(100 * time.Millisecond)
	}

	// Start monitor
	config := v1.AeUSDCConfig{JustMonitor: false}
	err := monitor.Start(config)
	if err != nil {
		t.Fatalf("Failed to start monitor: %v", err)
	}
	defer monitor.Stop()

	// Test concurrent status reads
	done := make(chan bool, 10)
	for i := 0; i < 10; i++ {
		go func() {
			for j := 0; j < 100; j++ {
				_ = monitor.GetStatus()
			}
			done <- true
		}()
	}

	// Wait for all goroutines
	for i := 0; i < 10; i++ {
		<-done
	}
}

func TestXykSBTCConcurrentOperation(t *testing.T) {
	monitor := v1.GetXykSBTCMonitor()

	// Ensure monitor is stopped
	if monitor.IsRunning() {
		_ = monitor.Stop()
		time.Sleep(100 * time.Millisecond)
	}

	// Start monitor
	config := v1.XykSBTCConfig{JustMonitor: true}
	err := monitor.Start(config)
	if err != nil {
		t.Fatalf("Failed to start monitor: %v", err)
	}
	defer monitor.Stop()

	// Test concurrent status reads
	done := make(chan bool, 10)
	for i := 0; i < 10; i++ {
		go func() {
			for j := 0; j < 100; j++ {
				_ = monitor.GetStatus()
			}
			done <- true
		}()
	}

	// Wait for all goroutines
	for i := 0; i < 10; i++ {
		<-done
	}
}

func TestAeUSDCDataChannel(t *testing.T) {
	monitor := v1.GetAeUSDCMonitor()

	// Ensure monitor is stopped
	if monitor.IsRunning() {
		_ = monitor.Stop()
		time.Sleep(100 * time.Millisecond)
	}

	// Start monitor
	config := v1.AeUSDCConfig{JustMonitor: true}
	err := monitor.Start(config)
	if err != nil {
		t.Fatalf("Failed to start monitor: %v", err)
	}
	defer monitor.Stop()

	// Wait for data
	dataChan := monitor.GetDataChannel()
	select {
	case data := <-dataChan:
		if data.Timestamp.IsZero() {
			t.Error("Data timestamp should not be zero")
		}
		if !data.Running {
			t.Error("Data should indicate monitor is running")
		}
	case <-time.After(3 * time.Second):
		t.Error("Timeout waiting for data from channel")
	}
}

func TestXykSBTCDataChannel(t *testing.T) {
	monitor := v1.GetXykSBTCMonitor()

	// Ensure monitor is stopped
	if monitor.IsRunning() {
		_ = monitor.Stop()
		time.Sleep(100 * time.Millisecond)
	}

	// Start monitor
	config := v1.XykSBTCConfig{JustMonitor: true}
	err := monitor.Start(config)
	if err != nil {
		t.Fatalf("Failed to start monitor: %v", err)
	}
	defer monitor.Stop()

	// Wait for data
	dataChan := monitor.GetDataChannel()
	select {
	case data := <-dataChan:
		if data.Timestamp.IsZero() {
			t.Error("Data timestamp should not be zero")
		}
		if !data.Running {
			t.Error("Data should indicate monitor is running")
		}
	case <-time.After(3 * time.Second):
		t.Error("Timeout waiting for data from channel")
	}
}
