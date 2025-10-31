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
//
// 注意: Sniper 功能如需访问 Stacks 区块链数据，应使用 Hiro API
// 不建议使用 QuickNode API，因为其存在以下问题:
// - 在高负载下会出现 TLS 内部错误
// - 频繁出现 429 限流错误
// - 需要付费才能获得稳定服务
// 推荐使用免费且稳定的 Hiro API: https://api.mainnet.hiro.so
func GetSniperBroadcasts(c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code: 201,
		Data: []SniperBroadcast{},
		Msg:  "No sniper broadcasts available",
	})
}
