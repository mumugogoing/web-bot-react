package router

import (
	"github.com/gin-gonic/gin"
	v1 "github.com/mumugogoing/web-bot-react/backend/api/v1"
)

// InitAutoSwapRouter initializes autoswap routes
func InitAutoSwapRouter(r *gin.Engine) {
	autoswap := r.Group("/api/v1/autoswap")
	{
		// Combined endpoints
		autoswap.GET("/status", v1.GetCombinedStatus)
		autoswap.GET("/prices", v1.GetPrices)

		// AeUSDC endpoints
		aeusdc := autoswap.Group("/aeusdc")
		{
			aeusdc.POST("/start", v1.StartAeUSDC)
			aeusdc.POST("/stop", v1.StopAeUSDC)
			aeusdc.GET("/status", v1.GetAeUSDCStatus)
			aeusdc.GET("/ws", v1.AeUSDCWebSocket)
		}

		// XykSBTC endpoints
		xyksbtc := autoswap.Group("/xyksbtc")
		{
			xyksbtc.POST("/start", v1.StartXykSBTC)
			xyksbtc.POST("/stop", v1.StopXykSBTC)
			xyksbtc.GET("/status", v1.GetXykSBTCStatus)
			xyksbtc.GET("/ws", v1.XykSBTCWebSocket)
		}
	}
}
