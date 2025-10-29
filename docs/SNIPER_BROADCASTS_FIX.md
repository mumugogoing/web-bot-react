# Fix for Sniper Broadcasts 404 Error

## Problem
The application was continuously requesting the endpoint `/api/v1/sniper/broadcasts`, which did not exist in the backend, resulting in continuous 404 (Not Found) errors.

## Root Cause
The endpoint was referenced somewhere in the application (possibly from a browser extension, cached code, or planned feature) but was never implemented in the backend Go server.

## Solution
Implemented a minimal stub endpoint that:
- Accepts GET requests to `/api/v1/sniper/broadcasts`
- Returns a proper JSON response with code 201 and an empty broadcasts array
- Follows the same response pattern as other bot endpoints (autoswap, makergun, etc.)
- Can be expanded in the future with actual sniper bot functionality

## Files Changed
1. `backend/api/v1/bot_sniper.go` - New handler for sniper broadcasts endpoint
2. `backend/router/sniper.go` - New router configuration for sniper routes
3. `backend/router/router.go` - Updated to register sniper routes
4. `backend/main.go` - Updated endpoint documentation

## Testing
- ✅ Backend builds successfully
- ✅ All existing Go tests pass
- ✅ Manual testing confirms endpoint returns 200 OK
- ✅ Response format matches other endpoints
- ✅ No linter warnings
- ✅ No security vulnerabilities detected

## Response Format
```json
{
  "code": 201,
  "data": [],
  "msg": "No sniper broadcasts available"
}
```

## Future Enhancements
This stub endpoint can be expanded to include:
- Real-time sniper bot status updates
- Trading signals or alerts
- Token launch monitoring broadcasts
- WebSocket support for live updates
