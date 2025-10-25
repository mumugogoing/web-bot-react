# Bot Control Panel Documentation

## Overview

The Bot Control Panel is a modern web-based interface for managing and monitoring three automated bot operations:

1. **MakerGun** - Market making bot with 100ms ticker
2. **AutoSwap** - Automated swap operations with 900ms ticker
3. **sUSDT Test** - One-time SUSDT to ABTC conversion

## Features

### Real-time Monitoring
- **WebSocket Connections**: Live status updates from backend via WebSocket
- **Animated Status Indicators**: Visual feedback with pulsing green (running) or red (stopped) dots
- **Activity Logs**: Scrolling log display showing the last 20 entries for each bot
- **Automatic Reconnection**: WebSocket auto-reconnects every 5 seconds if disconnected

### Control Operations
- **Start/Stop Buttons**: Simple one-click controls for each bot
- **Loading States**: Visual feedback during operations
- **Error Handling**: Comprehensive error messages and retry capability
- **Status Refresh**: Manual refresh button to update current status

### Modern UI Design
- **Responsive Grid Layout**: Three bot cards in a responsive grid (adapts to mobile)
- **Gradient Styling**: Beautiful gradient backgrounds for each card
- **Smooth Animations**: Hover effects and transitions for better UX
- **Ant Design Components**: Professional UI components from Ant Design library

## Access

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the bot control panel:
   ```
   http://localhost:5173/bot/control
   ```

3. **Login Required**: Users must be authenticated with at least USER role to access the panel.

## Usage Guide

### Starting a Bot

1. Click the **Start** button on the desired bot card
2. The bot will begin execution in the backend
3. Watch the status indicator change to green (running)
4. Monitor activity in the live log display

### Stopping a Bot

1. Click the **Stop** button on the running bot card
2. The bot will gracefully shut down
3. Status indicator changes to red (stopped)
4. Final log entries show shutdown confirmation

### Monitoring Activity

- **Status Indicator**: 
  - Green pulsing dot = Bot is running
  - Red dot = Bot is stopped
  
- **Activity Log**:
  - Displays last 20 log entries
  - Timestamped messages
  - Auto-scrolls to latest entry
  - Shows connection status, operations, and errors

### Refreshing Status

Click the **Refresh** button to:
- Update current bot status
- Verify backend connection
- Clear any stale state

## API Endpoints

The frontend communicates with the following backend endpoints:

### MakerGun Bot
- `POST /api/v1/bot/makergun/start` - Start the bot
- `POST /api/v1/bot/makergun/stop` - Stop the bot
- `GET /api/v1/bot/makergun/status` - Get current status
- `WS /api/v1/bot/makergun/ws` - WebSocket for real-time updates

### AutoSwap Bot
- `POST /api/v1/bot/autoswap/start` - Start the bot
- `POST /api/v1/bot/autoswap/stop` - Stop the bot
- `GET /api/v1/bot/autoswap/status` - Get current status
- `WS /api/v1/bot/autoswap/ws` - WebSocket for real-time updates

### sUSDT Test Bot
- `POST /api/v1/bot/susdt/start` - Start the bot
- `POST /api/v1/bot/susdt/stop` - Stop the bot
- `GET /api/v1/bot/susdt/status` - Get current status
- `WS /api/v1/bot/susdt/ws` - WebSocket for real-time updates

## Backend Integration

The frontend expects the following response format:

### Status Response
```json
{
  "code": 201,
  "data": {
    "running": true,
    "config": {},
    "data": {}
  },
  "msg": "success"
}
```

### WebSocket Messages
```json
{
  "type": "status",
  "timestamp": 1234567890,
  "running": true,
  "config": {},
  "data": {}
}
```

Or for log messages:
```json
{
  "type": "log",
  "message": "Bot operation completed",
  "timestamp": 1234567890
}
```

## Security Considerations

✅ **Authorization**: All endpoints are protected by Casbin middleware (backend)  
✅ **Authentication**: JWT token required for all requests  
✅ **Role-Based Access**: Minimum USER role required  
✅ **WebSocket Security**: Automatic protocol detection (WS/WSS based on HTTP/HTTPS)  
✅ **Error Handling**: Safe error messages, no sensitive data exposure  

⚠️ **Important Warnings**:
- All bots execute real blockchain transactions
- Ensure proper wallet configuration before starting bots
- Verify sufficient balance in wallets
- Monitor logs carefully during operation
- Stop bots immediately if unexpected behavior occurs

## Troubleshooting

### WebSocket Connection Issues

**Problem**: "WebSocket connection error" message

**Solutions**:
1. Check that backend server is running
2. Verify VITE_BASE_API environment variable is correct
3. Check browser console for detailed error messages
4. Ensure backend WebSocket endpoints are accessible

### Bot Won't Start

**Problem**: Error message when clicking Start

**Solutions**:
1. Check backend logs for detailed error information
2. Verify wallet configuration in backend
3. Ensure sufficient balance in wallets
4. Check that bot is not already running
5. Verify backend API endpoints are responding

### Status Not Updating

**Problem**: Status stuck or not refreshing

**Solutions**:
1. Click the Refresh button manually
2. Check WebSocket connection status in browser console
3. Verify network connectivity
4. Try closing and reopening the page

### Logs Not Appearing

**Problem**: Activity log is empty

**Solutions**:
1. Verify WebSocket is connected (check console)
2. Ensure backend is sending log messages
3. Check that log message format matches expected structure
4. Try starting the bot to trigger log events

## Development

### Project Structure

```
src/
├── api/bot/
│   ├── makergun.ts       # MakerGun API client
│   ├── autoswap.ts       # AutoSwap API client
│   └── susdt.ts          # sUSDT API client
├── hooks/
│   ├── useMakerGun.ts    # MakerGun React hook
│   ├── useAutoSwap.ts    # AutoSwap React hook
│   └── useSUSDT.ts       # sUSDT React hook
└── views/bot/
    ├── BotControl.tsx    # Main control panel component
    └── BotControl.css    # Styling
```

### Adding New Bots

To add a new bot to the control panel:

1. **Create API Client** (`src/api/bot/newbot.ts`):
   ```typescript
   export interface NewBotConfig { /* ... */ }
   export interface NewBotStatus { /* ... */ }
   export const startNewBot = (config: NewBotConfig) => { /* ... */ }
   export const stopNewBot = () => { /* ... */ }
   export const getNewBotStatus = () => { /* ... */ }
   ```

2. **Create React Hook** (`src/hooks/useNewBot.ts`):
   - Follow pattern from existing hooks
   - Include WebSocket connection
   - Add status management and logging

3. **Update BotControl Component**:
   - Import the new hook
   - Add a new `Col` with `renderBotCard` for the new bot

4. **Update Routes** (if creating separate page):
   - Add route in `src/router/index.tsx`
   - Add navigation item in `src/components/Navigation.tsx`

### Environment Variables

Configure backend API URL in `.env`:

```
VITE_BASE_API=http://localhost:10000
```

For production:
```
VITE_BASE_API=https://your-production-api.com
```

## Technical Details

### WebSocket Protocol

- **Connection**: Automatic on component mount
- **Reconnection**: 5-second delay after disconnect
- **Cleanup**: Proper cleanup on component unmount
- **Messages**: JSON formatted status and log messages

### State Management

- **React Hooks**: useState for local state
- **useCallback**: Optimized function callbacks
- **useEffect**: Lifecycle management and cleanup
- **useRef**: WebSocket reference and timeout management

### Performance

- **Log Limiting**: Only last 20 entries kept in memory
- **Automatic Cleanup**: Old logs removed to prevent memory leaks
- **Debounced Operations**: Loading states prevent multiple simultaneous requests

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **WebSocket Support**: Required (available in all modern browsers)
- **ES6+ Features**: Used throughout the codebase

## Future Enhancements

Potential improvements for future releases:

1. **Configurable Parameters**: UI for adjusting bot configuration
2. **Historical Logs**: Persistent log storage and search
3. **Performance Metrics**: Charts and statistics dashboard
4. **Notifications**: Desktop/push notifications for events
5. **Multi-bot Operations**: Bulk start/stop controls
6. **Export Functionality**: Download logs as files
7. **Dark Mode**: Theme switching support

## License

Same as the main project (check project root for license file).
