# AutoSwap System Architecture

Complete architecture overview of the aeUSDC and xykSBTC monitoring modules.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  AutoSwap    │  │  WebSocket   │  │  API Client  │             │
│  │  Components  │◄─┤  Hooks       │◄─┤  (Axios)     │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                              │ HTTP/WS
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Backend (Go/Gin)                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                        Router Layer                           │  │
│  │  ┌────────────────┐  ┌────────────────┐                      │  │
│  │  │  HTTP Routes   │  │  WS Routes     │                      │  │
│  │  └────────────────┘  └────────────────┘                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Handler Layer                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                    │  │
│  │  │  HTTP Handlers  │  │  WS Handlers    │                    │  │
│  │  └─────────────────┘  └─────────────────┘                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Monitor Layer                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐                    │  │
│  │  │  AeUSDCMonitor  │  │  XykSBTCMonitor │                    │  │
│  │  │  (Singleton)    │  │  (Singleton)    │                    │  │
│  │  └─────────────────┘  └─────────────────┘                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    External Services                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  XYK Pools   │  │  Price APIs  │  │  Blockchain  │             │
│  │  (Stacks)    │  │  (DeFi)      │  │  Nodes       │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Components

#### 1. AutoSwap Components
- **Purpose**: User interface for monitor control
- **Responsibilities**:
  - Display real-time data
  - Control buttons (start/stop)
  - Configuration settings
  - Status visualization

#### 2. WebSocket Hooks
- **Purpose**: Manage WebSocket connections
- **Responsibilities**:
  - Connection lifecycle
  - Message parsing
  - Error handling
  - Reconnection logic

#### 3. API Client
- **Purpose**: HTTP communication with backend
- **Responsibilities**:
  - REST API calls
  - Request/response handling
  - Error handling

### Backend Components

#### 1. Router Layer (`router/`)

**autoswap.go**
```
Responsibilities:
- Route registration
- Endpoint mapping
- Group organization
```

**router.go**
```
Responsibilities:
- Gin engine setup
- CORS configuration
- Middleware registration
```

#### 2. Handler Layer (`api/v1/bot_autoswap_handlers.go`)

**HTTP Handlers**
```
StartAeUSDC()     - POST /api/v1/autoswap/aeusdc/start
StopAeUSDC()      - POST /api/v1/autoswap/aeusdc/stop
GetAeUSDCStatus() - GET  /api/v1/autoswap/aeusdc/status
StartXykSBTC()    - POST /api/v1/autoswap/xyksbtc/start
StopXykSBTC()     - POST /api/v1/autoswap/xyksbtc/stop
GetXykSBTCStatus()- GET  /api/v1/autoswap/xyksbtc/status
GetCombinedStatus()- GET  /api/v1/autoswap/status
GetPrices()       - GET  /api/v1/autoswap/prices
```

**WebSocket Handlers**
```
AeUSDCWebSocket() - GET  /api/v1/autoswap/aeusdc/ws
XykSBTCWebSocket()- GET  /api/v1/autoswap/xyksbtc/ws
```

#### 3. Monitor Layer

**AeUSDCMonitor** (`api/v1/bot_aeusdc.go`)
```
Pattern: Singleton
Concurrency: Goroutine + Mutex
Update Rate: 1Hz (1 second)

State:
- running (bool)
- justMonitor (bool)
- xykDiff (float64)
- aeUSDCBalance (float64)
- stxBalance (float64)
- lastTradeTime (*time.Time)
- lastTradeInfo (string)

Channels:
- stopChan (control)
- dataChan (broadcast)
```

**XykSBTCMonitor** (`api/v1/bot_xyksbtc.go`)
```
Pattern: Singleton
Concurrency: Goroutine + Mutex
Update Rate: 1Hz (1 second)

State:
- running (bool)
- priceDiff (float64)
- sbtcPrice (float64)
- xykPrice (float64)
- lastAlertTime (*time.Time)
- lastAlertInfo (string)

Channels:
- stopChan (control)
- dataChan (broadcast)
```

## Data Flow

### Start Monitor Flow

```
User Action (Frontend)
    │
    ▼
POST /api/v1/autoswap/aeusdc/start
    │
    ▼
StartAeUSDC Handler
    │
    ├─► Validate Config
    │
    ├─► GetAeUSDCMonitor() [Singleton]
    │
    ├─► monitor.Start(config)
    │   │
    │   ├─► Check not already running
    │   │
    │   ├─► Set running = true
    │   │
    │   └─► Launch goroutine: monitorLoop()
    │       │
    │       └─► Ticker (1s interval)
    │           │
    │           ├─► updateMetrics()
    │           │   ├─► calculateXykDiff()
    │           │   ├─► fetchAeUSDCBalance()
    │           │   └─► fetchStxBalance()
    │           │
    │           ├─► checkTradingConditions()
    │           │   └─► executeTrade() [if threshold met]
    │           │
    │           └─► broadcastData()
    │               └─► dataChan <- AeUSDCData
    │
    └─► Return Response (status 201)
```

### WebSocket Data Flow

```
Client WebSocket Connection
    │
    ▼
GET /api/v1/autoswap/aeusdc/ws
    │
    ▼
AeUSDCWebSocket Handler
    │
    ├─► Upgrade HTTP → WebSocket
    │
    ├─► Get monitor.GetDataChannel()
    │
    └─► Loop:
        │
        ├─► select {
        │   │
        │   ├─► case data := <-dataChan:
        │   │   └─► conn.WriteJSON(data)
        │   │
        │   └─► case <-ticker.C: [1s]
        │       └─► conn.WriteJSON(monitor.GetStatus())
        │   }
        │
        └─► [On error/close] → Exit
```

## Concurrency Model

### Thread Safety

```
AeUSDCMonitor
    │
    ├─► Main Goroutine
    │   └─► HTTP Request Handlers
    │       ├─► Start() [mutex lock]
    │       ├─► Stop() [mutex lock]
    │       └─► GetStatus() [mutex read lock]
    │
    ├─► Monitor Goroutine
    │   └─► monitorLoop()
    │       ├─► updateMetrics() [mutex lock]
    │       ├─► checkTradingConditions() [mutex lock]
    │       └─► broadcastData() [mutex read lock]
    │
    └─► WebSocket Goroutines (multiple)
        └─► Read from dataChan
            └─► Write to client
```

### Synchronization Primitives

1. **sync.RWMutex**
   - Protects monitor state
   - Allows concurrent reads
   - Exclusive writes

2. **Channels**
   - `stopChan`: Signal monitor to stop
   - `dataChan`: Broadcast updates (buffered, size 10)

3. **sync.Once**
   - Ensures single instance creation
   - Thread-safe initialization

## Error Handling

### Error Types

```go
var (
    ErrAlreadyRunning = errors.New("monitor is already running")
    ErrNotRunning     = errors.New("monitor is not running")
)
```

### Error Flow

```
Client Request
    │
    ▼
Handler
    │
    ├─► Validation Error (400 Bad Request)
    │   └─► Invalid JSON, missing fields
    │
    ├─► Business Logic Error (409 Conflict)
    │   ├─► ErrAlreadyRunning
    │   └─► ErrNotRunning
    │
    └─► Success (200 OK, code: 201)
        └─► Return data
```

## State Machine

### AeUSDC Monitor States

```
┌─────────┐
│ STOPPED │◄────────────────┐
└─────────┘                 │
     │                      │
     │ Start(config)        │
     │                      │ Stop()
     ▼                      │
┌─────────┐                 │
│ RUNNING │─────────────────┘
└─────────┘
     │
     ├─► MONITORING (just_monitor: true)
     │   └─► Update metrics only
     │
     └─► TRADING (just_monitor: false)
         ├─► Update metrics
         └─► Execute trades (if threshold met)
```

## Data Structures

### Request/Response Models

```go
// Config
type AeUSDCConfig struct {
    JustMonitor bool `json:"just_monitor"`
}

// Data
type AeUSDCData struct {
    Timestamp     time.Time `json:"timestamp"`
    XykDiff       float64   `json:"xyk_diff"`
    AeUSDCBalance float64   `json:"aeusdc_balance"`
    StxBalance    float64   `json:"stx_balance"`
    LastTrade     string    `json:"last_trade,omitempty"`
    Running       bool      `json:"running"`
}

// Response wrapper
type Response struct {
    Code int         `json:"code"`
    Data interface{} `json:"data"`
    Msg  string      `json:"msg"`
}
```

## Performance Characteristics

### Scalability

| Component | Concurrent Clients | Memory per Client | CPU per Client |
|-----------|-------------------|-------------------|----------------|
| HTTP API  | Unlimited         | ~1 KB             | Negligible     |
| WebSocket | 100s              | ~4 KB             | 1% @ 1Hz       |

### Latency

| Operation | Latency |
|-----------|---------|
| HTTP Request | < 1ms |
| WebSocket Update | 1s (by design) |
| Start/Stop | < 10ms |

### Resource Usage

```
Memory:
- Base: ~5 MB
- Per Monitor: ~100 KB
- Per WebSocket: ~4 KB

CPU:
- Idle: < 0.1%
- 1 Monitor: < 1%
- 10 WebSockets: < 2%

Network:
- Per WebSocket: ~500 bytes/sec
- HTTP: Negligible
```

## Security Considerations

### Current Implementation

```
✓ CORS enabled (development)
✓ Input validation
✓ Thread-safe operations
✓ Resource limits (channel buffers)
```

### Production Recommendations

```
☐ Add authentication (JWT)
☐ Add rate limiting
☐ Restrict CORS origins
☐ Add request logging
☐ Add metrics/monitoring
☐ Add circuit breakers
☐ Encrypt WebSocket (WSS)
```

## Deployment Architecture

### Development

```
┌─────────────────┐         ┌─────────────────┐
│  React Dev      │  :5173  │  Go Backend     │
│  (Vite)         ├────────►│  (Gin)          │
│                 │         │  :10000         │
└─────────────────┘         └─────────────────┘
```

### Production

```
┌─────────┐   HTTPS   ┌──────────┐   HTTP   ┌────────────┐
│ Browser ├──────────►│  Nginx   ├─────────►│  Go API    │
└─────────┘           │  Reverse │          │  :10000    │
                      │  Proxy   │          └────────────┘
                      └──────────┘
                           │
                           │ Static Files
                           ▼
                      ┌──────────┐
                      │  React   │
                      │  Build   │
                      └──────────┘
```

## Module Isolation

### Original Code Preservation

```
bot_autoswap.go [UNTOUCHED]
    │
    │ Logic extracted (not removed)
    ▼
api/v1/bot_aeusdc.go [NEW]
api/v1/bot_xyksbtc.go [NEW]
    │
    │ Standalone modules
    │ No dependencies on original
    ▼
Works independently
Can coexist with original
```

### Integration Points

```
┌─────────────────────────────────────┐
│      Original bot_autoswap.go       │
│  (Continues to work unchanged)      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│      New AutoSwap API Modules       │
│  - Independent operation            │
│  - Shared trading thresholds        │
│  - Uses same DeFi protocols         │
└─────────────────────────────────────┘
```

## Future Enhancements

### Planned Features

1. **Database Integration**
   - Trade history persistence
   - Performance metrics
   - Alert history

2. **Advanced Trading**
   - Configurable thresholds
   - Multiple trading strategies
   - Backtesting support

3. **Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - Alert notifications

4. **High Availability**
   - Multi-instance support
   - Leader election
   - State synchronization

## References

- [Gin Web Framework](https://gin-gonic.com/)
- [Gorilla WebSocket](https://github.com/gorilla/websocket)
- [Go Concurrency Patterns](https://go.dev/blog/pipelines)
