package router

import (
	"github.com/gin-gonic/gin"
	v1 "github.com/mumugogoing/web-bot-react/backend/api/v1"
)

// InitSniperRouter initializes sniper routes
func InitSniperRouter(r *gin.Engine) {
	sniper := r.Group("/api/v1/sniper")
	{
		// Continuous monitoring
		sniper.POST("/start-continuous", v1.StartContinuousSniper)
		sniper.POST("/stop-continuous", v1.StopContinuousSniper)
		sniper.GET("/status", v1.GetSniperStatus)
		
		// Quick operations
		sniper.POST("/snipe", v1.SnipeOnce)
		sniper.POST("/quick-check", v1.QuickCheckSniper)
		
		// Results management
		sniper.GET("/broadcasts", v1.GetBroadcastResults)
		sniper.POST("/broadcasts/clear", v1.ClearBroadcastResults)
	}
}
