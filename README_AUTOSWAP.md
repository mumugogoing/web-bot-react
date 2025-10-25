# AutoSwap API - Quick Start

Standalone monitoring and trading modules for aeUSDC and xykSBTC, extracted from bot_autoswap.go without modifying the original code.

## Overview

This module provides REST and WebSocket APIs for:
- **aeUSDC Monitor**: Automatic arbitrage trading between STX and USDC
- **xykSBTC Monitor**: Price differential monitoring with alerts (monitoring only)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
go mod download
```

### 2. Run the Server

```bash
go run main.go
```

Server starts on http://localhost:10000

### 3. Test with curl

#### Start aeUSDC in Trade Mode
```bash
curl -X POST http://localhost:10000/api/v1/autoswap/aeusdc/start \
  -H "Content-Type: application/json" \
  -d '{"just_monitor": false}'
```

#### Start aeUSDC in Monitor-Only Mode
```bash
curl -X POST http://localhost:10000/api/v1/autoswap/aeusdc/start \
  -H "Content-Type: application/json" \
  -d '{"just_monitor": true}'
```

#### Get aeUSDC Status
```bash
curl http://localhost:10000/api/v1/autoswap/aeusdc/status
```

#### Stop aeUSDC
```bash
curl -X POST http://localhost:10000/api/v1/autoswap/aeusdc/stop
```

#### Start xykSBTC Monitor
```bash
curl -X POST http://localhost:10000/api/v1/autoswap/xyksbtc/start \
  -H "Content-Type: application/json" \
  -d '{"just_monitor": true}'
```

#### Get Combined Status
```bash
curl http://localhost:10000/api/v1/autoswap/status
```

#### Get DeFi Prices
```bash
curl http://localhost:10000/api/v1/autoswap/prices
```

### 4. WebSocket Connection (JavaScript)

```javascript
// AeUSDC real-time updates
const ws = new WebSocket('ws://localhost:10000/api/v1/autoswap/aeusdc/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('AeUSDC Update:', data);
  // { timestamp, xyk_diff, aeusdc_balance, stx_balance, last_trade, running }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

## API Endpoints

### AeUSDC Monitor
- `POST /api/v1/autoswap/aeusdc/start` - Start monitor
- `POST /api/v1/autoswap/aeusdc/stop` - Stop monitor
- `GET /api/v1/autoswap/aeusdc/status` - Get status
- `GET /api/v1/autoswap/aeusdc/ws` - WebSocket updates (1Hz)

### XykSBTC Monitor
- `POST /api/v1/autoswap/xyksbtc/start` - Start monitor
- `POST /api/v1/autoswap/xyksbtc/stop` - Stop monitor
- `GET /api/v1/autoswap/xyksbtc/status` - Get status
- `GET /api/v1/autoswap/xyksbtc/ws` - WebSocket updates (1Hz)

### Combined Endpoints
- `GET /api/v1/autoswap/status` - Combined status of both monitors
- `GET /api/v1/autoswap/prices` - DeFi price aggregation

## Response Format

All REST endpoints return:
```json
{
  "code": 201,
  "data": { /* ... */ },
  "msg": "success"
}
```

## WebSocket Data Format

### AeUSDC Data
```json
{
  "timestamp": "2025-10-25T06:00:00Z",
  "xyk_diff": 1.5,
  "aeusdc_balance": 10000.0,
  "stx_balance": 5000.0,
  "last_trade": "STX -> USDC @ 06:00:00",
  "running": true
}
```

### XykSBTC Data
```json
{
  "timestamp": "2025-10-25T06:00:00Z",
  "price_diff": -2.5,
  "sbtc_price": 95000.0,
  "xyk_price": 94500.0,
  "last_alert": "Price diff alert @ 06:00:00 (diff: -2.5%)",
  "running": true
}
```

## Trading Logic

### AeUSDC (from AutoSwap11)
- **Buy Signal**: XYK diff < -2.0% → Execute USDC → STX
- **Sell Signal**: XYK diff > 2.0% → Execute STX → USDC
- **Mode**: `just_monitor: false` enables trading, `true` for monitoring only

### XykSBTC
- **Alerts Only**: Generates alerts when price differential > ±3.0%
- **Trading**: Use existing SbtcMakerGun for actual trades
- **Mode**: Always monitoring only (no automatic trading)

## Testing

```bash
cd backend
go test ./tests/... -v
```

Tests cover:
- Start/stop functionality
- Duplicate start protection
- Concurrent operations
- Data channel broadcasting

## Documentation

- [AUTOSWAP_API.md](docs/AUTOSWAP_API.md) - Complete API reference
- [FRONTEND_INTEGRATION.md](docs/FRONTEND_INTEGRATION.md) - React integration guide
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture

## Notes

- Original `bot_autoswap.go` remains untouched and fully functional
- Each module runs in dedicated goroutine with mutex-protected state
- Data channels buffer 10 items for WebSocket broadcasting
- WebSocket sends updates at 1Hz (1 second intervals)
- CORS enabled for frontend integration
