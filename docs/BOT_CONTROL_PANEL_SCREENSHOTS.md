# Bot Control Panel - Visual Documentation

## Navigation Integration

The Bot Control Panel is accessible from the left sidebar menu:

![Bot Control Menu Item](https://github.com/user-attachments/assets/67ab8c91-f1f5-49e0-bdd5-72607746b228)

**Features shown:**
- ✅ "Bot Control" menu item added to sidebar with control icon
- ✅ Menu item highlighted when active
- ✅ Protected route - requires authentication (USER role minimum)
- ✅ Professional unauthorized page with login prompt

## Bot Control Panel Layout

When logged in, users see a comprehensive control panel with three bot cards:

### Panel Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  🔄 Bot Control Panel                                           │
├─────────────────────────────────────────────────────────────────┤
│  ℹ️  Bot Control System                                         │
│  Control and monitor MakerGun, AutoSwap, and sUSDT test bots.  │
│  Real-time status updates via WebSocket connections.           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  MakerGun    │  │  AutoSwap    │  │  sUSDT Test  │         │
│  │  🟢 Running  │  │  🔴 Stopped  │  │  🔴 Stopped  │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ Description  │  │ Description  │  │ Description  │         │
│  │              │  │              │  │              │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ [Stop] [🔄] │  │ [Start] [🔄] │  │ [Start] [🔄] │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ Activity Log │  │ Activity Log │  │ Activity Log │         │
│  │ [timestamp]  │  │ [timestamp]  │  │ [timestamp]  │         │
│  │ WebSocket    │  │ No activity  │  │ No activity  │         │
│  │ connected    │  │ yet          │  │ yet          │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
├─────────────────────────────────────────────────────────────────┤
│  Security & Configuration Notes                                │
│  ✅ All endpoints protected by Casbin authorization            │
│  ✅ Thread-safe state management with mutex locking            │
│  ✅ WebSocket auto-reconnection (5s interval)                  │
│  ⚠️  All bots execute real blockchain transactions              │
│  ⚠️  Ensure proper wallet configuration before use              │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Features

#### 1. **Gradient Card Headers**
Each bot card has a unique gradient background:
- **MakerGun**: Purple gradient (#667eea → #764ba2)
- **AutoSwap**: Pink gradient (#f093fb → #f5576c)
- **sUSDT Test**: Blue gradient (#4facfe → #00f2fe)

#### 2. **Animated Status Indicators**
- 🟢 **Green pulsing dot**: Bot is running (animated pulse effect)
- 🔴 **Red dot**: Bot is stopped

#### 3. **Real-time Activity Logs**
- Scrollable log container (max height: 200px)
- Monospace font for better readability
- Last 20 entries displayed
- Timestamped messages: `[HH:MM:SS] message`
- Auto-scroll to latest entry

#### 4. **Control Buttons**
- **Start** (Primary button with play icon): Starts the bot
- **Stop** (Danger button with pause icon): Stops the bot
- **Refresh** (Default button with reload icon): Updates status

#### 5. **Responsive Design**
- Desktop (>768px): 3-column grid layout
- Mobile (<768px): Stacked single-column layout
- Smooth hover animations on cards

### Bot Descriptions

#### MakerGun Bot
```
Market making bot with 100ms ticker using Wallet2.
Executes market making operations on DEX platforms.
```

#### AutoSwap Bot
```
Automated swap operations with 900ms ticker.
Executes swaps in non-monitoring mode for optimal performance.
```

#### sUSDT Test Bot
```
One-time execution using Wallet1.
Performs SUSDT to ABTC conversion via AlexAutoSellSTX.
```

## WebSocket Integration

Each bot maintains a persistent WebSocket connection:

```javascript
// WebSocket URL format
ws://127.0.0.1:10000/api/v1/bot/{botname}/ws

// Message Types Received:
{
  "type": "status",
  "running": true,
  "config": {},
  "data": {}
}

{
  "type": "log",
  "message": "Bot operation completed",
  "timestamp": 1234567890
}
```

## User Interactions

### Starting a Bot
1. User clicks **Start** button
2. Loading spinner appears
3. Backend validates configuration
4. If successful:
   - Status indicator turns green with pulse animation
   - Success message appears
   - Activity log shows "Bot started"
   - WebSocket streams real-time updates
5. If failed:
   - Error alert displays at top of card
   - Activity log shows error message

### Stopping a Bot
1. User clicks **Stop** button
2. Loading spinner appears
3. Backend gracefully shuts down bot
4. Status indicator turns red
5. Success message appears
6. Activity log shows "Bot stopped"

### Monitoring Activity
- WebSocket automatically sends status updates
- Logs appear in real-time
- Connection status visible in logs
- Auto-reconnection on disconnect (5-second interval)

## Security Features

✅ **Authentication Required**
- Minimum USER role required
- JWT token authentication
- Protected route with ProtectedRoute component

✅ **Authorization**
- Casbin middleware on backend
- Role-based access control
- Secure WebSocket connections (WS/WSS auto-detection)

⚠️ **Safety Warnings**
- All bots execute real blockchain transactions
- Wallet configuration must be verified
- Sufficient balance required
- Monitor logs during operation

## Technology Stack

**Frontend:**
- React 19.1.1
- TypeScript
- Ant Design 5.27.4
- WebSocket API (native)

**State Management:**
- React Hooks (useState, useCallback, useEffect, useRef)
- Custom hooks per bot (useMakerGun, useAutoSwap, useSUSDT)

**Styling:**
- CSS3 with gradients
- CSS animations (keyframes)
- Flexbox/Grid layouts
- Responsive media queries

## File Structure

```
src/
├── api/bot/
│   ├── makergun.ts      (53 lines)
│   ├── autoswap.ts      (52 lines)
│   └── susdt.ts         (52 lines)
├── hooks/
│   ├── useMakerGun.ts   (185 lines)
│   ├── useAutoSwap.ts   (185 lines)
│   └── useSUSDT.ts      (185 lines)
├── views/bot/
│   ├── BotControl.tsx   (195 lines)
│   └── BotControl.css   (138 lines)
├── router/index.tsx     (Modified: added route)
└── components/
    ├── Navigation.tsx   (Modified: added menu item)
    └── Sidebar.tsx      (Modified: added menu item)
```

**Total: ~1,300 lines of code across 11 files**

## Browser Compatibility

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ WebSocket support required

## Performance

- **Log Memory Management**: Only last 20 entries kept
- **WebSocket Reconnection**: 5-second delay
- **Debounced API Calls**: Loading states prevent duplicates
- **Optimized Renders**: useCallback for functions, proper React keys

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatible
- High contrast color scheme
- Focus indicators

## Future Enhancements

1. **Configuration UI**: Adjust bot parameters before starting
2. **Historical Logs**: View past logs with search/filter
3. **Charts & Metrics**: Performance visualization
4. **Notifications**: Desktop/browser push notifications
5. **Bulk Operations**: Start/stop multiple bots
6. **Export Logs**: Download as CSV/JSON
7. **Dark Mode**: Theme switching
8. **Mobile App**: React Native version

## Documentation Files

- `docs/BOT_CONTROL_PANEL.md` - User guide (298 lines)
- `BOT_CONTROL_IMPLEMENTATION.md` - Technical details (227 lines)
- `docs/BOT_CONTROL_PANEL_SCREENSHOTS.md` - This file

---

**Implementation Status**: ✅ Complete and Production Ready

**Last Updated**: 2025-10-25
