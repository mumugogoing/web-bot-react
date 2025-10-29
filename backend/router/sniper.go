package router

import (
	"github.com/gin-gonic/gin"
	v1 "github.com/mumugogoing/web-bot-react/backend/api/v1"
)

// InitSniperRouter initializes sniper routes
func InitSniperRouter(r *gin.Engine) {
	sniper := r.Group("/api/v1/sniper")
	{
		// Broadcasts endpoint
		sniper.GET("/broadcasts", v1.GetSniperBroadcasts)
	}
}
