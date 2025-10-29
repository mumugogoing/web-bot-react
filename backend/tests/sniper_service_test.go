package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	v1 "github.com/mumugogoing/web-bot-react/backend/api/v1"
	"github.com/mumugogoing/web-bot-react/backend/router"
)

func TestSniperServiceIntegration(t *testing.T) {
	// Setup router
	r := router.SetupRouter()

	// Test 1: Check initial status
	t.Run("Get Initial Status", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/sniper/status", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		
		if response["success"] != true {
			t.Error("Expected success to be true")
		}

		data := response["data"].(map[string]interface{})
		if data["isRunning"] != false {
			t.Error("Expected isRunning to be false initially")
		}
	})

	// Test 2: Start continuous sniper
	t.Run("Start Continuous Sniper", func(t *testing.T) {
		payload := map[string]string{
			"targetAddress":  "SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR",
			"serializedData": "0x123456789",
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/api/v1/sniper/start-continuous", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		
		if response["success"] != true {
			t.Error("Expected success to be true")
		}
		if response["message"] != "Sniper monitoring started" {
			t.Errorf("Unexpected message: %v", response["message"])
		}
	})

	// Test 3: Verify status after start
	t.Run("Verify Running Status", func(t *testing.T) {
		time.Sleep(1 * time.Second) // Wait for monitoring to start
		
		req, _ := http.NewRequest("GET", "/api/v1/sniper/status", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		
		data := response["data"].(map[string]interface{})
		if data["isRunning"] != true {
			t.Error("Expected isRunning to be true after start")
		}
		if data["targetAddress"] != "SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR" {
			t.Errorf("Unexpected target address: %v", data["targetAddress"])
		}
	})

	// Test 4: Stop continuous sniper
	t.Run("Stop Continuous Sniper", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/api/v1/sniper/stop-continuous", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		
		if response["success"] != true {
			t.Error("Expected success to be true")
		}
	})

	// Test 5: Quick check
	t.Run("Quick Check", func(t *testing.T) {
		payload := map[string]interface{}{
			"targetAddress":  "SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR",
			"serializedData": "0x123456789",
			"timeoutMs":      1000,
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/api/v1/sniper/quick-check", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		
		if response["success"] != true {
			t.Error("Expected success to be true")
		}
		// Note: detected will likely be false in test environment
		// since we're not actually hitting real APIs
	})

	// Test 6: Get broadcasts
	t.Run("Get Broadcasts", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/v1/sniper/broadcasts", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		
		if response["success"] != true {
			t.Error("Expected success to be true")
		}
	})

	// Test 7: Clear broadcasts
	t.Run("Clear Broadcasts", func(t *testing.T) {
		req, _ := http.NewRequest("POST", "/api/v1/sniper/broadcasts/clear", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status 200, got %d", w.Code)
		}

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		
		if response["success"] != true {
			t.Error("Expected success to be true")
		}
	})
}

func TestSniperServiceValidation(t *testing.T) {
	r := router.SetupRouter()

	// Test invalid request (missing fields)
	t.Run("Start Without Required Fields", func(t *testing.T) {
		payload := map[string]string{
			"targetAddress": "SPMWCPXZJRDW3RP3NVQYAJHM71V2FMV9CMKR6GBR",
			// Missing serializedData
		}
		body, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", "/api/v1/sniper/start-continuous", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status 400, got %d", w.Code)
		}
	})

	// Test stopping when not running
	t.Run("Stop When Not Running", func(t *testing.T) {
		// First make sure it's stopped
		service := v1.GetSniperService()
		service.Stop()

		req, _ := http.NewRequest("POST", "/api/v1/sniper/stop-continuous", nil)
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status 400, got %d", w.Code)
		}
	})
}
