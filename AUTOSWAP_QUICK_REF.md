# AutoSwap Quick Reference

## Start the Server

```bash
cd backend
go run main.go
```

Server runs on `http://localhost:10000`

## Quick Test Commands

### Start aeUSDC (Trade Mode)
```bash
curl -X POST http://localhost:10000/api/v1/autoswap/aeusdc/start \
  -H "Content-Type: application/json" \
  -d '{"just_monitor": false}'
```

### Start aeUSDC (Monitor Only)
```bash
curl -X POST http://localhost:10000/api/v1/autoswap/aeusdc/start \
  -H "Content-Type: application/json" \
  -d '{"just_monitor": true}'
```

### Get Status
```bash
curl http://localhost:10000/api/v1/autoswap/aeusdc/status
```

### Stop Monitor
```bash
curl -X POST http://localhost:10000/api/v1/autoswap/aeusdc/stop
```

### Start xykSBTC
```bash
curl -X POST http://localhost:10000/api/v1/autoswap/xyksbtc/start \
  -H "Content-Type: application/json" \
  -d '{"just_monitor": true}'
```

### Get Combined Status
```bash
curl http://localhost:10000/api/v1/autoswap/status
```

### Get Prices
```bash
curl http://localhost:10000/api/v1/autoswap/prices
```

## WebSocket Test (JavaScript)

```javascript
const ws = new WebSocket('ws://localhost:10000/api/v1/autoswap/aeusdc/ws');

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);
  console.log('Update:', data);
};
```

## Build and Test

### Build
```bash
cd backend
go build -o autoswap-api main.go
```

### Run Tests
```bash
cd backend
go test ./tests/... -v
```

### Run with Pretty JSON
```bash
curl http://localhost:10000/api/v1/autoswap/status | jq '.'
```

## Response Format

All endpoints return:
```json
{
  "code": 201,
  "data": { /* ... */ },
  "msg": "success"
}
```

## Error Codes

- `201` - Success
- `400` - Bad Request
- `409` - Already running / Not running
- `500` - Internal error

## Trading Thresholds

### aeUSDC
- **Buy**: xyk_diff < -2.0% → USDC → STX
- **Sell**: xyk_diff > 2.0% → STX → USDC

### xykSBTC
- **Alert**: price_diff > ±3.0%

## Files

- `backend/api/v1/bot_aeusdc.go` - aeUSDC monitor
- `backend/api/v1/bot_xyksbtc.go` - xykSBTC monitor
- `backend/api/v1/bot_autoswap_handlers.go` - HTTP/WS handlers
- `backend/router/autoswap.go` - Routes
- `backend/tests/autoswap_monitor_test.go` - Tests

## Documentation

- [README_AUTOSWAP.md](README_AUTOSWAP.md) - Quick start
- [docs/AUTOSWAP_API.md](backend/docs/AUTOSWAP_API.md) - API reference
- [docs/FRONTEND_INTEGRATION.md](backend/docs/FRONTEND_INTEGRATION.md) - React guide
- [docs/ARCHITECTURE.md](backend/docs/ARCHITECTURE.md) - Architecture

## Dependencies

- Go 1.21+
- github.com/gin-gonic/gin
- github.com/gorilla/websocket
