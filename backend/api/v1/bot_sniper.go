package v1

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// SniperBroadcast represents a sniper broadcast message
type SniperBroadcast struct {
	Type      string `json:"type"`
	Timestamp int64  `json:"timestamp"`
	Message   string `json:"message"`
}

// GetSniperBroadcasts handles GET /api/v1/sniper/broadcasts
// Returns an empty list of broadcasts to prevent 404 errors
// This endpoint is a stub and can be expanded with actual sniper bot functionality
func GetSniperBroadcasts(c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code: 201,
		Data: []SniperBroadcast{},
		Msg:  "No sniper broadcasts available",
	})
}
