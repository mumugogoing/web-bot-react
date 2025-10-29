package main

import (
	"log"

	"github.com/mumugogoing/web-bot-react/backend/router"
)

func main() {
	r := router.SetupRouter()

	log.Println("AutoSwap API server starting on :10000")
	log.Println("Endpoints available:")
	log.Println("  POST   /api/v1/autoswap/aeusdc/start")
	log.Println("  POST   /api/v1/autoswap/aeusdc/stop")
	log.Println("  GET    /api/v1/autoswap/aeusdc/status")
	log.Println("  GET    /api/v1/autoswap/aeusdc/ws")
	log.Println("  POST   /api/v1/autoswap/xyksbtc/start")
	log.Println("  POST   /api/v1/autoswap/xyksbtc/stop")
	log.Println("  GET    /api/v1/autoswap/xyksbtc/status")
	log.Println("  GET    /api/v1/autoswap/xyksbtc/ws")
	log.Println("  GET    /api/v1/autoswap/status")
	log.Println("  GET    /api/v1/autoswap/prices")
	log.Println("  GET    /api/v1/sniper/broadcasts")

	if err := r.Run(":10000"); err != nil {
		log.Fatal("Failed to start server: ", err)
	}
}
