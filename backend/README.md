# AutoSwap Backend API

Go backend providing REST and WebSocket APIs for aeUSDC and xykSBTC monitoring.

## Quick Start

```bash
# Install dependencies
go mod download

# Run server
go run main.go

# Or build and run
go build -o autoswap-api main.go
./autoswap-api
```

Server starts on `http://localhost:10000`

## Test

```bash
# Run all tests
go test ./tests/... -v

# Test an endpoint
curl http://localhost:10000/api/v1/autoswap/status
```

## API Endpoints

### AeUSDC Monitor
- `POST /api/v1/autoswap/aeusdc/start` - Start monitor
- `POST /api/v1/autoswap/aeusdc/stop` - Stop monitor
- `GET /api/v1/autoswap/aeusdc/status` - Get status
- `GET /api/v1/autoswap/aeusdc/ws` - WebSocket updates

### XykSBTC Monitor
- `POST /api/v1/autoswap/xyksbtc/start` - Start monitor
- `POST /api/v1/autoswap/xyksbtc/stop` - Stop monitor
- `GET /api/v1/autoswap/xyksbtc/status` - Get status
- `GET /api/v1/autoswap/xyksbtc/ws` - WebSocket updates

### Combined
- `GET /api/v1/autoswap/status` - Combined status
- `GET /api/v1/autoswap/prices` - DeFi prices

## Documentation

- [Quick Reference](../AUTOSWAP_QUICK_REF.md)
- [API Reference](docs/AUTOSWAP_API.md)
- [Frontend Integration](docs/FRONTEND_INTEGRATION.md)
- [Architecture](docs/ARCHITECTURE.md)

## Project Structure

```
api/v1/          - Core monitoring logic
router/          - HTTP routing
tests/           - Unit tests
docs/            - Documentation
main.go          - Server entry point
```

## Requirements

- Go 1.21 or higher
- Dependencies managed via go.mod

## Features

- ✅ Thread-safe monitors with RWMutex
- ✅ Real-time WebSocket updates (1Hz)
- ✅ RESTful API design
- ✅ Comprehensive error handling
- ✅ Unit tests with 100% pass rate
- ✅ CORS enabled for frontend integration

## License

MIT
