# AutoSwap API Reference

Complete API documentation for aeUSDC and xykSBTC monitoring modules.

## Base URL

```
http://localhost:10000
```

## Authentication

No authentication required in current version.

## API Endpoints

### AeUSDC Monitor

#### Start AeUSDC Monitor

Start the aeUSDC monitoring/trading process.

**Endpoint:** `POST /api/v1/autoswap/aeusdc/start`

**Request Body:**
```json
{
  "just_monitor": false
}
```

**Parameters:**
- `just_monitor` (boolean): If `true`, monitor only without trading. If `false`, enable automatic arbitrage trading.

**Response (Success):**
```json
{
  "code": 201,
  "data": {
    "timestamp": "2025-10-25T06:00:00Z",
    "xyk_diff": 1.5,
    "aeusdc_balance": 10000.0,
    "stx_balance": 5000.0,
    "last_trade": "",
    "running": true
  },
  "msg": "AeUSDC monitor started successfully"
}
```

**Response (Error - Already Running):**
```json
{
  "code": 409,
  "msg": "monitor is already running"
}
```

---

#### Stop AeUSDC Monitor

Stop the aeUSDC monitor.

**Endpoint:** `POST /api/v1/autoswap/aeusdc/stop`

**Request Body:** None

**Response (Success):**
```json
{
  "code": 201,
  "data": {
    "timestamp": "2025-10-25T06:00:00Z",
    "xyk_diff": 1.5,
    "aeusdc_balance": 10000.0,
    "stx_balance": 5000.0,
    "last_trade": "STX -> USDC @ 06:00:00",
    "running": false
  },
  "msg": "AeUSDC monitor stopped successfully"
}
```

**Response (Error - Not Running):**
```json
{
  "code": 409,
  "msg": "monitor is not running"
}
```

---

#### Get AeUSDC Status

Get current status and balances.

**Endpoint:** `GET /api/v1/autoswap/aeusdc/status`

**Response:**
```json
{
  "code": 201,
  "data": {
    "timestamp": "2025-10-25T06:00:00Z",
    "xyk_diff": 1.5,
    "aeusdc_balance": 10000.0,
    "stx_balance": 5000.0,
    "last_trade": "STX -> USDC @ 06:00:00",
    "running": true
  },
  "msg": "success"
}
```

**Data Fields:**
- `timestamp`: Current timestamp
- `xyk_diff`: XYK pool price differential in percentage
- `aeusdc_balance`: Current aeUSDC balance
- `stx_balance`: Current STX balance
- `last_trade`: Last trade information (if any)
- `running`: Monitor running state

---

#### AeUSDC WebSocket

Real-time updates at 1Hz.

**Endpoint:** `GET /api/v1/autoswap/aeusdc/ws` (WebSocket)

**Message Format:**
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

**Update Frequency:** 1 message per second

---

### XykSBTC Monitor

#### Start XykSBTC Monitor

Start the xykSBTC price monitoring process.

**Endpoint:** `POST /api/v1/autoswap/xyksbtc/start`

**Request Body:**
```json
{
  "just_monitor": true
}
```

**Parameters:**
- `just_monitor` (boolean): Always `true` for xykSBTC (alerts only, no trading)

**Response (Success):**
```json
{
  "code": 201,
  "data": {
    "timestamp": "2025-10-25T06:00:00Z",
    "price_diff": -2.5,
    "sbtc_price": 95000.0,
    "xyk_price": 94500.0,
    "last_alert": "",
    "running": true
  },
  "msg": "XykSBTC monitor started successfully"
}
```

**Response (Error - Already Running):**
```json
{
  "code": 409,
  "msg": "monitor is already running"
}
```

---

#### Stop XykSBTC Monitor

Stop the xykSBTC monitor.

**Endpoint:** `POST /api/v1/autoswap/xyksbtc/stop`

**Request Body:** None

**Response (Success):**
```json
{
  "code": 201,
  "data": {
    "timestamp": "2025-10-25T06:00:00Z",
    "price_diff": -2.5,
    "sbtc_price": 95000.0,
    "xyk_price": 94500.0,
    "last_alert": "Price diff alert @ 06:00:00 (diff: -2.5%)",
    "running": false
  },
  "msg": "XykSBTC monitor stopped successfully"
}
```

**Response (Error - Not Running):**
```json
{
  "code": 409,
  "msg": "monitor is not running"
}
```

---

#### Get XykSBTC Status

Get current price differential and alerts.

**Endpoint:** `GET /api/v1/autoswap/xyksbtc/status`

**Response:**
```json
{
  "code": 201,
  "data": {
    "timestamp": "2025-10-25T06:00:00Z",
    "price_diff": -2.5,
    "sbtc_price": 95000.0,
    "xyk_price": 94500.0,
    "last_alert": "Price diff alert @ 06:00:00 (diff: -2.5%)",
    "running": true
  },
  "msg": "success"
}
```

**Data Fields:**
- `timestamp`: Current timestamp
- `price_diff`: Percentage difference between SBTC and XYK prices
- `sbtc_price`: Current SBTC market price
- `xyk_price`: Current XYK pool price
- `last_alert`: Last alert information (if any)
- `running`: Monitor running state

---

#### XykSBTC WebSocket

Real-time updates at 1Hz.

**Endpoint:** `GET /api/v1/autoswap/xyksbtc/ws` (WebSocket)

**Message Format:**
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

**Update Frequency:** 1 message per second

---

### Combined Endpoints

#### Get Combined Status

Get status of both monitors in a single call.

**Endpoint:** `GET /api/v1/autoswap/status`

**Response:**
```json
{
  "code": 201,
  "data": {
    "aeusdc": {
      "timestamp": "2025-10-25T06:00:00Z",
      "xyk_diff": 1.5,
      "aeusdc_balance": 10000.0,
      "stx_balance": 5000.0,
      "last_trade": "STX -> USDC @ 06:00:00",
      "running": true
    },
    "xyksbtc": {
      "timestamp": "2025-10-25T06:00:00Z",
      "price_diff": -2.5,
      "sbtc_price": 95000.0,
      "xyk_price": 94500.0,
      "last_alert": "Price diff alert @ 06:00:00 (diff: -2.5%)",
      "running": false
    }
  },
  "msg": "success"
}
```

---

#### Get DeFi Prices

Get aggregated DeFi price data.

**Endpoint:** `GET /api/v1/autoswap/prices`

**Response:**
```json
{
  "code": 201,
  "data": {
    "timestamp": "2025-10-25T06:00:00Z",
    "aeusdc_price": 1.0,
    "sbtc_price": 95000.0,
    "stx_price": 2.5,
    "pools": {
      "aeusdc_stx": 2.5,
      "sbtc_stx": 38000.0
    }
  },
  "msg": "success"
}
```

**Data Fields:**
- `timestamp`: Current timestamp
- `aeusdc_price`: aeUSDC price in USD
- `sbtc_price`: sBTC price in USD
- `stx_price`: STX price in USD
- `pools`: Object containing pool-specific prices

---

## Error Codes

| Code | Description |
|------|-------------|
| 201  | Success |
| 400  | Bad Request (invalid configuration) |
| 409  | Conflict (already running / not running) |
| 500  | Internal Server Error |

## Trading Logic

### AeUSDC Trading Thresholds

Preserved from original `AutoSwap11()` logic:

- **Buy Signal**: `xyk_diff < -2.0%`
  - Action: Execute USDC → STX swap
  - Condition: Only when `just_monitor = false`

- **Sell Signal**: `xyk_diff > 2.0%`
  - Action: Execute STX → USDC swap
  - Condition: Only when `just_monitor = false`

- **Monitor Only**: `just_monitor = true`
  - No trades executed
  - Monitoring data still broadcast

### XykSBTC Alert Thresholds

- **Alert Trigger**: `price_diff > ±3.0%`
  - Generates alert in `last_alert` field
  - No automatic trading (use SbtcMakerGun for trades)

## WebSocket Connection Example

### JavaScript
```javascript
const ws = new WebSocket('ws://localhost:10000/api/v1/autoswap/aeusdc/ws');

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
  
  // Update UI with new data
  document.getElementById('xyk-diff').textContent = data.xyk_diff.toFixed(2) + '%';
  document.getElementById('aeusdc-balance').textContent = data.aeusdc_balance.toFixed(2);
  document.getElementById('stx-balance').textContent = data.stx_balance.toFixed(2);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket disconnected');
  // Implement reconnection logic
};
```

### Python
```python
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    print(f"XYK Diff: {data['xyk_diff']}%")
    print(f"aeUSDC Balance: {data['aeusdc_balance']}")
    print(f"STX Balance: {data['stx_balance']}")

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("WebSocket closed")

def on_open(ws):
    print("WebSocket connected")

ws = websocket.WebSocketApp(
    "ws://localhost:10000/api/v1/autoswap/aeusdc/ws",
    on_message=on_message,
    on_error=on_error,
    on_close=on_close,
    on_open=on_open
)

ws.run_forever()
```

## Rate Limiting

No rate limiting in current version. WebSocket updates sent at fixed 1Hz interval.

## CORS

CORS enabled for all origins in development. Configure appropriately for production.

## Version

API Version: 1.0.0
