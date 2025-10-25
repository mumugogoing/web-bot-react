package v1

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins in development
	},
}

// Response represents the standard API response format
type Response struct {
	Code int         `json:"code"`
	Data interface{} `json:"data"`
	Msg  string      `json:"msg"`
}

// CombinedStatus represents combined status of both monitors
type CombinedStatus struct {
	AeUSDC  AeUSDCData  `json:"aeusdc"`
	XykSBTC XykSBTCData `json:"xyksbtc"`
}

// PriceData represents DeFi price aggregation
type PriceData struct {
	Timestamp   time.Time          `json:"timestamp"`
	AeUSDCPrice float64            `json:"aeusdc_price"`
	SBTCPrice   float64            `json:"sbtc_price"`
	STXPrice    float64            `json:"stx_price"`
	Pools       map[string]float64 `json:"pools"`
}

// StartAeUSDC handles POST /api/v1/autoswap/aeusdc/start
func StartAeUSDC(c *gin.Context) {
	var config AeUSDCConfig
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Code: http.StatusBadRequest,
			Msg:  "Invalid configuration: " + err.Error(),
		})
		return
	}

	monitor := GetAeUSDCMonitor()
	if err := monitor.Start(config); err != nil {
		c.JSON(http.StatusConflict, Response{
			Code: http.StatusConflict,
			Msg:  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code: 201,
		Data: monitor.GetStatus(),
		Msg:  "AeUSDC monitor started successfully",
	})
}

// StopAeUSDC handles POST /api/v1/autoswap/aeusdc/stop
func StopAeUSDC(c *gin.Context) {
	monitor := GetAeUSDCMonitor()
	if err := monitor.Stop(); err != nil {
		c.JSON(http.StatusConflict, Response{
			Code: http.StatusConflict,
			Msg:  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code: 201,
		Data: monitor.GetStatus(),
		Msg:  "AeUSDC monitor stopped successfully",
	})
}

// GetAeUSDCStatus handles GET /api/v1/autoswap/aeusdc/status
func GetAeUSDCStatus(c *gin.Context) {
	monitor := GetAeUSDCMonitor()
	c.JSON(http.StatusOK, Response{
		Code: 201,
		Data: monitor.GetStatus(),
		Msg:  "success",
	})
}

// AeUSDCWebSocket handles GET /api/v1/autoswap/aeusdc/ws
func AeUSDCWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	monitor := GetAeUSDCMonitor()
	dataChan := monitor.GetDataChannel()

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case data := <-dataChan:
			if err := conn.WriteJSON(data); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		case <-ticker.C:
			// Send current status even if no new data
			status := monitor.GetStatus()
			if err := conn.WriteJSON(status); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		}
	}
}

// StartXykSBTC handles POST /api/v1/autoswap/xyksbtc/start
func StartXykSBTC(c *gin.Context) {
	var config XykSBTCConfig
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, Response{
			Code: http.StatusBadRequest,
			Msg:  "Invalid configuration: " + err.Error(),
		})
		return
	}

	monitor := GetXykSBTCMonitor()
	if err := monitor.Start(config); err != nil {
		c.JSON(http.StatusConflict, Response{
			Code: http.StatusConflict,
			Msg:  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code: 201,
		Data: monitor.GetStatus(),
		Msg:  "XykSBTC monitor started successfully",
	})
}

// StopXykSBTC handles POST /api/v1/autoswap/xyksbtc/stop
func StopXykSBTC(c *gin.Context) {
	monitor := GetXykSBTCMonitor()
	if err := monitor.Stop(); err != nil {
		c.JSON(http.StatusConflict, Response{
			Code: http.StatusConflict,
			Msg:  err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, Response{
		Code: 201,
		Data: monitor.GetStatus(),
		Msg:  "XykSBTC monitor stopped successfully",
	})
}

// GetXykSBTCStatus handles GET /api/v1/autoswap/xyksbtc/status
func GetXykSBTCStatus(c *gin.Context) {
	monitor := GetXykSBTCMonitor()
	c.JSON(http.StatusOK, Response{
		Code: 201,
		Data: monitor.GetStatus(),
		Msg:  "success",
	})
}

// XykSBTCWebSocket handles GET /api/v1/autoswap/xyksbtc/ws
func XykSBTCWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	monitor := GetXykSBTCMonitor()
	dataChan := monitor.GetDataChannel()

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case data := <-dataChan:
			if err := conn.WriteJSON(data); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		case <-ticker.C:
			// Send current status even if no new data
			status := monitor.GetStatus()
			if err := conn.WriteJSON(status); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		}
	}
}

// GetCombinedStatus handles GET /api/v1/autoswap/status
func GetCombinedStatus(c *gin.Context) {
	aeUSDCMonitor := GetAeUSDCMonitor()
	xykSBTCMonitor := GetXykSBTCMonitor()

	combined := CombinedStatus{
		AeUSDC:  aeUSDCMonitor.GetStatus(),
		XykSBTC: xykSBTCMonitor.GetStatus(),
	}

	c.JSON(http.StatusOK, Response{
		Code: 201,
		Data: combined,
		Msg:  "success",
	})
}

// GetPrices handles GET /api/v1/autoswap/prices
func GetPrices(c *gin.Context) {
	prices := PriceData{
		Timestamp:   time.Now(),
		AeUSDCPrice: 1.0,  // Simulated USDC price
		SBTCPrice:   95000.0, // Simulated BTC price
		STXPrice:    2.5,  // Simulated STX price
		Pools: map[string]float64{
			"aeusdc_stx": 2.5,
			"sbtc_stx":   38000.0,
		},
	}

	c.JSON(http.StatusOK, Response{
		Code: 201,
		Data: prices,
		Msg:  "success",
	})
}
