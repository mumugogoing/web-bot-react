# SBTC MakerGun Frontend Integration

This document describes the frontend implementation for the SBTC MakerGun trading bot.

## Overview

The SBTC MakerGun is an automated market making bot that operates between Binance (CEX) and Bitflow Finance (DEX) for the SBTC/STX trading pair. The frontend provides a complete control panel for managing the bot and submitting manual orders.

## Features

### 1. Bot Control
- **Start/Stop Controls**: Single-click start and stop functionality
- **Real-time Status**: Live status display showing whether bot is running or stopped
- **Configuration Form**: Full configuration interface with validation
- **Loading States**: Visual feedback during operations

### 2. Configuration Management
- **Trading Amounts**: Set sell amount (SBTC) and buy amount (STX)
- **Profit Margins**: Configure profit margins for both directions (up/down %)
- **Trading Fees**: Set fees for sell and buy operations
- **Trading Modes**:
  - Mode 0: Normal operation
  - Mode 1: DeFi Priority (submit 1 tick early)
  - Mode 2: DeFi Priority (submit 2 ticks early)
  - Mode 3: CEX Priority (place CEX orders first)
- **Strategy Switches**: Enable/disable sell and buy strategies independently
- **Balance Check**: Toggle balance verification before trading

### 3. Real-time Updates
- **WebSocket Integration**: Automatic status updates via WebSocket
- **Auto-reconnection**: Handles disconnections with automatic reconnection
- **Status Broadcasting**: All connected clients receive updates simultaneously

### 4. Manual Order Submission
- **Quick Trade Panel**: Submit manual SBTC/STX swaps
- **Position Selection**: Choose between Sell SBTC (position 0) or Buy SBTC (position 1)
- **Amount Input**: Flexible amount entry with validation

### 5. User Interface
- **Ant Design Components**: Professional, consistent UI
- **Responsive Layout**: Works on different screen sizes
- **Visual Feedback**: Loading states, success/error messages
- **Status Tags**: Color-coded status indicators

## File Structure

```
src/
├── api/
│   └── makergun/
│       └── sbtc.ts                 # API functions for SBTC MakerGun
├── hooks/
│   └── useSbtcMakerGun.ts         # Custom React hook for bot control
└── views/
    └── makergun/
        └── SbtcMakerGun.tsx        # Main control panel component
```

## API Endpoints

### 1. Start Bot
**Endpoint**: `POST /api/v1/xyk/sbtc-makergun/start`

**Request Body**:
```json
{
  "sellamount": 0.01,
  "buyamount": 100,
  "up": 0.5,
  "down": 0.5,
  "sellswitch": true,
  "buyswitch": true,
  "sellfee": 0.1,
  "buyfee": 0.1,
  "model": 3,
  "check_balance": true
}
```

### 2. Stop Bot
**Endpoint**: `POST /api/v1/xyk/sbtc-makergun/stop`

### 3. Get Status
**Endpoint**: `GET /api/v1/xyk/sbtc-makergun/status`

**Response**:
```json
{
  "code": 201,
  "data": {
    "running": true,
    "config": { /* current configuration */ },
    "data": { /* current state */ }
  },
  "msg": "success"
}
```

### 4. WebSocket
**Endpoint**: `WS /api/v1/xyk/sbtc-makergun/ws`

**Message Format**:
```json
{
  "type": "status",
  "timestamp": 1697123456,
  "running": true,
  "config": { /* configuration */ },
  "data": { /* current state */ }
}
```

### 5. Manual Order
**Endpoint**: `POST /api/v1/xyk/sbtc-stx/order`

**Request Body**:
```json
{
  "amount": 0.01,
  "position": 0  // 0 = sell SBTC, 1 = buy SBTC
}
```

## Usage

### Basic Usage

1. **Navigate to the SBTC MakerGun page**:
   - Click "SBTC MakerGun" in the navigation menu
   - Or navigate to `/makergun/sbtc`

2. **Configure the bot**:
   - Set your desired trading amounts
   - Configure profit margins and fees
   - Select trading mode
   - Enable/disable strategies as needed

3. **Start the bot**:
   - Click "Start Bot" button
   - Bot will begin automated trading

4. **Monitor status**:
   - Check the status card for current configuration
   - WebSocket provides real-time updates

5. **Stop the bot**:
   - Click "Stop Bot" button when needed

### Manual Trading

1. **Submit manual orders**:
   - Enter amount in the manual order panel
   - Click "Sell SBTC" or "Buy SBTC"
   - Order will be submitted immediately

## Component Usage

### useSbtcMakerGun Hook

```typescript
import { useSbtcMakerGun } from '@/hooks/useSbtcMakerGun';

function MyComponent() {
  const { status, loading, error, start, stop, refresh } = useSbtcMakerGun();
  
  // Start bot with configuration
  const handleStart = async () => {
    await start({
      sellamount: 0.01,
      buyamount: 100,
      up: 0.5,
      down: 0.5,
      sellswitch: true,
      buyswitch: true,
      sellfee: 0.1,
      buyfee: 0.1,
      model: 3,
      check_balance: true
    });
  };
  
  // Stop bot
  const handleStop = async () => {
    await stop();
  };
  
  return (
    <div>
      <p>Status: {status.running ? 'Running' : 'Stopped'}</p>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Direct API Usage

```typescript
import {
  startSbtcMakerGun,
  stopSbtcMakerGun,
  getSbtcMakerGunStatus,
  submitSbtcStxOrder
} from '@/api/makergun/sbtc';

// Start bot
const response = await startSbtcMakerGun(config);

// Stop bot
await stopSbtcMakerGun();

// Get status
const status = await getSbtcMakerGunStatus();

// Submit manual order
await submitSbtcStxOrder({ amount: 0.01, position: 0 });
```

## Configuration Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| sellamount | number | Amount of SBTC to sell per trade | 0.01 |
| buyamount | number | Amount of STX to use for buying SBTC | 100 |
| up | number | Sell profit margin (%) | 0.5 |
| down | number | Buy profit margin (%) | 0.5 |
| sellswitch | boolean | Enable sell strategy | true |
| buyswitch | boolean | Enable buy strategy | true |
| sellfee | number | Sell trading fee (%) | 0.1 |
| buyfee | number | Buy trading fee (%) | 0.1 |
| model | number | Trading mode (0-3) | 3 |
| check_balance | boolean | Enable balance checking | true |

## Trading Modes

- **Mode 0 (Normal)**: Standard operation, submits trades at optimal timing
- **Mode 1 (DeFi Priority -1)**: Submit DEX transactions 1 tick early
- **Mode 2 (DeFi Priority -2)**: Submit DEX transactions 2 ticks early
- **Mode 3 (CEX Priority)**: Place CEX orders first, execute DEX when filling

## Error Handling

The implementation includes comprehensive error handling:

1. **API Errors**: All API calls have try-catch blocks with user-friendly error messages
2. **WebSocket Errors**: Automatic reconnection on connection failures
3. **Validation Errors**: Form validation prevents invalid configurations
4. **Loading States**: Visual feedback during operations

## Security Considerations

1. **Authentication**: All API endpoints require authentication (handled by request interceptor)
2. **Authorization**: User must have USER role or higher
3. **Validation**: Form validation ensures only valid configurations are submitted
4. **Error Messages**: Errors don't expose sensitive information

## Integration with Backend

The frontend expects the backend API to be running at the URL specified in `.env`:

```
VITE_BASE_API=http://127.0.0.1:10000/api/v1
```

For production, update this to your production backend URL.

## Navigation

The SBTC MakerGun page is accessible via:
- Navigation menu: "SBTC MakerGun"
- Direct URL: `/makergun/sbtc`
- Requires USER role or higher

## Future Enhancements

Potential improvements:
- [ ] Trade history display
- [ ] Performance analytics and charts
- [ ] Multiple bot instances
- [ ] Strategy backtesting
- [ ] Advanced configuration presets
- [ ] Export/import configuration
- [ ] Notification settings

## Troubleshooting

### WebSocket Connection Issues
- Check that backend WebSocket endpoint is available
- Verify firewall settings allow WebSocket connections
- Check browser console for WebSocket errors

### Bot Not Starting
- Verify all required fields are filled
- Check backend logs for errors
- Ensure sufficient balance if balance check is enabled

### Status Not Updating
- Check WebSocket connection in browser dev tools
- Refresh the page to reconnect WebSocket
- Verify backend is broadcasting status updates

## Support

For issues or questions:
1. Check backend logs for API errors
2. Check browser console for frontend errors
3. Verify WebSocket connection status
4. Test API endpoints directly using tools like Postman

## License

This component is part of the web-bot-react project and follows the same license.
