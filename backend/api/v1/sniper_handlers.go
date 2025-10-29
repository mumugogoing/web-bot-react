package v1

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// SniperStartRequest represents the request to start sniper monitoring
type SniperStartRequest struct {
	TargetAddress  string `json:"targetAddress" binding:"required"`
	SerializedData string `json:"serializedData" binding:"required"`
}

// SniperCheckRequest represents a quick check request
type SniperCheckRequest struct {
	TargetAddress  string `json:"targetAddress" binding:"required"`
	SerializedData string `json:"serializedData" binding:"required"`
	TimeoutMs      int    `json:"timeoutMs"` // Optional, default 1000ms
}

// StartContinuousSniper starts continuous monitoring
func StartContinuousSniper(c *gin.Context) {
	var req SniperStartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	service := GetSniperService()
	if err := service.Start(req.TargetAddress, req.SerializedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sniper monitoring started",
		"data": gin.H{
			"targetAddress": req.TargetAddress,
			"checkInterval": "500ms",
		},
	})
}

// StopContinuousSniper stops continuous monitoring
func StopContinuousSniper(c *gin.Context) {
	service := GetSniperService()
	if err := service.Stop(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Sniper monitoring stopped",
	})
}

// GetSniperStatus returns the current status
func GetSniperStatus(c *gin.Context) {
	service := GetSniperService()
	status := service.GetStatus()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    status,
	})
}

// QuickCheckSniper performs a quick one-time check
func QuickCheckSniper(c *gin.Context) {
	var req SniperCheckRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	// Default timeout to 1 second if not specified
	timeoutMs := req.TimeoutMs
	if timeoutMs <= 0 {
		timeoutMs = 1000
	}

	startTime := time.Now()
	service := GetSniperService()
	
	detected, txIDs, err := service.QuickCheck(
		req.TargetAddress,
		req.SerializedData,
		time.Duration(timeoutMs)*time.Millisecond,
	)

	responseTime := time.Since(startTime).Milliseconds()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":        false,
			"detected":       false,
			"message":        err.Error(),
			"responseTimeMs": responseTime,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"detected":       detected,
		"detectedTxIDs":  txIDs,
		"responseTimeMs": responseTime,
	})
}

// GetBroadcastResults returns the broadcast results
func GetBroadcastResults(c *gin.Context) {
	service := GetSniperService()
	results := service.GetBroadcastResults()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    results,
	})
}

// ClearBroadcastResults clears the results
func ClearBroadcastResults(c *gin.Context) {
	service := GetSniperService()
	service.ClearResults()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Results cleared",
	})
}

// SnipeOnce performs immediate snipe with 1 second timeout
func SnipeOnce(c *gin.Context) {
	var req SniperStartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request: " + err.Error(),
		})
		return
	}

	startTime := time.Now()
	service := GetSniperService()
	
	detected, txIDs, err := service.QuickCheck(
		req.TargetAddress,
		req.SerializedData,
		1*time.Second,
	)

	responseTime := time.Since(startTime).Milliseconds()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success":        false,
			"detected":       false,
			"message":        err.Error(),
			"responseTimeMs": responseTime,
		})
		return
	}

	// Get broadcast results
	broadcasts := service.GetBroadcastResults()
	broadcastTxIDs := []string{}
	for _, b := range broadcasts {
		if b.Success && b.TxID != "" {
			broadcastTxIDs = append(broadcastTxIDs, b.TxID)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":         true,
		"detected":        detected,
		"targetTxIDs":     txIDs,
		"broadcastTxIDs":  broadcastTxIDs,
		"responseTimeMs":  responseTime,
		"broadcastCount":  len(broadcasts),
	})
}
