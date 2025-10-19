# Order Pressing Feature (压单功能)

## Overview

The Order Pressing feature has been added to the SBTC MakerGun component to enable rapid, millisecond-level order submissions with built-in security measures.

## Key Features

### 1. Millisecond-Level Intervals
The feature supports the following interval options:
- **100ms** - Very Fast (High network/RPC load)
- **200ms** - Fast (Medium network/RPC load)
- **500ms** - Moderate (Default, recommended)
- **1000ms** - 1 second
- **2000ms** - 2 seconds

**Note:** Shorter intervals (100-200ms) can significantly increase network and RPC load. Use with caution.

### 2. Auto-Disable Security
**Critical Security Feature:** The order pressing automatically disables after **ONE successful order submission** to prevent mass trading attacks. This ensures:
- Protection against unintended large-scale trading
- Manual confirmation required for each pressing session
- Reduced risk of automated attack scenarios

### 3. Manual Enable Required
Users must **manually enable** the order pressing feature each time before use. This design choice:
- Prevents accidental activation
- Ensures user awareness of active pressing
- Adds an extra layer of security

## Configuration Options

### Amount
- Set the amount of SBTC to trade per order
- Minimum: 0.001 SBTC
- Step: 0.01 SBTC
- Default: 0.01 SBTC

### Interval
- Choose from 5 predefined millisecond intervals
- Minimum: 100ms (enforced to prevent excessive load)
- Default: 500ms

### Position
- **Position 0**: Sell SBTC (SBTC → STX)
- **Position 1**: Buy SBTC (STX → SBTC)

## User Interface

### Visual Indicators
1. **Active Tag**: Red "ACTIVE" tag appears in the panel title when pressing is running
2. **Status Alert**: Shows current configuration (interval, position) during active pressing
3. **Disabled Controls**: All configuration inputs are disabled while pressing is active
4. **Warning Message**: Persistent warning about security and network load

### Controls
- **Start Order Pressing Button**: Large, red button to initiate pressing
- **Stop Order Pressing Button**: Large button to manually stop pressing (also auto-stops on success)

## Usage Workflow

1. **Configure Settings**:
   - Set desired amount
   - Choose interval based on network tolerance
   - Select position (buy/sell)

2. **Review Warning**:
   - Read the security notice
   - Understand auto-disable behavior
   - Consider network/RPC load implications

3. **Start Pressing**:
   - Click "Start Order Pressing"
   - First order submits immediately
   - Subsequent orders submit at configured interval

4. **Automatic Shutdown**:
   - After first successful submission, pressing auto-disables
   - User receives notification about auto-disable
   - Must manually re-enable for next pressing session

5. **Manual Stop** (Optional):
   - Click "Stop Order Pressing" at any time to manually stop
   - Useful if you want to stop before a successful submission

## Security Considerations

### Why Auto-Disable?
The auto-disable feature protects against:
- **Mass Trading Attacks**: Prevents runaway order submissions
- **Accidental Over-Trading**: Stops after one success, requiring manual intervention
- **Resource Exhaustion**: Limits continuous API/RPC calls

### Best Practices
1. **Start with Longer Intervals**: Test with 1000ms or 2000ms first
2. **Monitor Network Impact**: Observe RPC/API performance
3. **Use Responsibly**: Only enable when actively monitoring
4. **Understand Costs**: Each order has network/gas costs

## Technical Implementation

### Files Modified
- `/src/views/makergun/SbtcMakerGun.tsx`: Main implementation

### State Management
```typescript
const [pressingEnabled, setPressingEnabled] = useState(false);
const [pressingInterval, setPressingInterval] = useState(500);
const [pressingAmount, setPressingAmount] = useState(0.01);
const [pressingPosition, setPressingPosition] = useState(0);
const pressingIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
```

### Key Functions
- `startOrderPressing()`: Validates inputs and starts interval-based submissions
- `stopOrderPressing()`: Clears interval and disables pressing
- `handlePressingOrder()`: Submits order and auto-disables on success

### Auto-Disable Logic
```typescript
if (response.code === 201) {
  message.success(`Order pressed successfully`);
  stopOrderPressing(); // Auto-disable
  message.info('Order pressing auto-disabled for security...');
}
```

## API Integration

The feature uses the existing API endpoint:
- **POST** `/xyk/sbtc-stx/order`
- Parameters: `{ amount: number, position: number }`

## Limitations

1. **Minimum Interval**: 100ms enforced to prevent excessive load
2. **Single Submission**: Auto-disables after one success
3. **No Persistence**: Settings don't persist across page reloads
4. **Network Dependent**: Performance varies with network conditions

## Future Enhancements

Potential improvements:
- [ ] Add submission counter/statistics
- [ ] Configurable auto-disable threshold (e.g., after N submissions)
- [ ] Success/failure rate tracking
- [ ] Network load estimation
- [ ] Save preset configurations

## Troubleshooting

### Order Pressing Won't Start
- Check amount is greater than 0
- Ensure interval is at least 100ms
- Verify not already running

### Auto-Disabled Too Quickly
- This is expected behavior
- Feature disables after ONE successful submission
- Re-enable manually for next pressing session

### Network/RPC Errors
- Increase interval (e.g., 1000ms or 2000ms)
- Check backend API status
- Verify network connectivity

## Support

For issues or questions:
1. Check this documentation first
2. Review warning messages in UI
3. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-19  
**Status**: Production Ready
