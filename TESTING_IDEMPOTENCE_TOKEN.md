# Testing Plan for Idempotence Token Integration

## Overview
This document provides a testing plan to verify the automatic idempotence token management implementation.

## Prerequisites
- Backend server running at `http://127.0.0.1:10000/api/v1`
- Backend must be updated with the idempotence token changes (gin-web-dev PR #1)
- Backend should return `api-idempotence-token` header in responses

## Test Cases

### 1. Initial Token Acquisition
**Objective**: Verify frontend receives initial idempotence token from backend

**Steps**:
1. Clear localStorage: `localStorage.clear()`
2. Make first API request (e.g., login)
3. Check browser DevTools → Network tab → Response Headers
4. Verify `api-idempotence-token` header is present
5. Check localStorage: `localStorage.getItem('api-idempotence-token')`
6. Verify token is stored

**Expected Result**: Token is received and stored in localStorage

### 2. Token Sent in Subsequent Requests
**Objective**: Verify stored token is sent in next request

**Steps**:
1. After initial token acquisition (from Test 1)
2. Make another API request (e.g., get user info)
3. Check browser DevTools → Network tab → Request Headers
4. Verify `api-idempotence-token` header is present with stored value

**Expected Result**: Previously stored token is sent in request header

### 3. Token Rotation
**Objective**: Verify token is updated with each response

**Steps**:
1. Note current token value: `localStorage.getItem('api-idempotence-token')`
2. Make an API request
3. Check response headers for new `api-idempotence-token`
4. Verify localStorage is updated with new token
5. Make another request
6. Verify the new token was sent in request headers

**Expected Result**: Token rotates with each request/response cycle

### 4. Login Flow
**Objective**: Verify complete login flow works with automatic token management

**Steps**:
1. Clear localStorage
2. Navigate to login page
3. Enter credentials (super/123456)
4. Submit login form
5. Check Network tab for login request
6. Verify login response contains `api-idempotence-token` header
7. Verify token is stored in localStorage
8. Verify redirect to dashboard works
9. Check that subsequent requests include the token

**Expected Result**: Login succeeds and token is automatically managed

### 5. Multiple Sequential Requests
**Objective**: Verify token management works across multiple requests

**Steps**:
1. Login to application
2. Navigate to different pages (Users, Roles, Menus, etc.)
3. Each page makes API requests
4. Monitor Network tab to verify:
   - Each response includes new token
   - Each request includes previous token
   - LocalStorage is updated after each response

**Expected Result**: Token rotates properly through all requests

### 6. Error Handling
**Objective**: Verify token management doesn't break on errors

**Steps**:
1. Login to application
2. Trigger an API error (e.g., invalid request)
3. Verify token is still present in localStorage
4. Make a valid request
5. Verify token is still being sent and received

**Expected Result**: Error doesn't break token management

## Manual Testing Checklist

- [ ] Test 1: Initial Token Acquisition
- [ ] Test 2: Token Sent in Subsequent Requests  
- [ ] Test 3: Token Rotation
- [ ] Test 4: Login Flow
- [ ] Test 5: Multiple Sequential Requests
- [ ] Test 6: Error Handling

## Automated Testing (Future)

For automated testing, consider:
1. Mock axios interceptors
2. Test token extraction from headers
3. Test token storage in localStorage
4. Test token inclusion in requests
5. Test error scenarios

## Debugging Tips

### Check Token in Browser DevTools
```javascript
// Check current token
localStorage.getItem('api-idempotence-token')

// Clear token for testing
localStorage.removeItem('api-idempotence-token')

// Monitor token changes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key === 'api-idempotence-token') {
    console.log('Token updated:', value);
  }
  originalSetItem.apply(this, arguments);
};
```

### Check Network Requests
1. Open DevTools → Network tab
2. Filter by XHR/Fetch
3. Click on any request
4. Check Headers tab
5. Look for:
   - Request Headers: `api-idempotence-token`
   - Response Headers: `api-idempotence-token`

### Enable Verbose Logging
Add console logs to `src/utils/request.ts`:

```typescript
// In response interceptor
const newIdempotenceToken = response.headers['api-idempotence-token'];
if (newIdempotenceToken) {
  console.log('Received new idempotence token:', newIdempotenceToken);
  setIdempotenceToken(newIdempotenceToken);
}

// In request interceptor
const idempotenceToken = getIdempotenceToken();
if (idempotenceToken) {
  console.log('Sending idempotence token:', idempotenceToken);
  config.headers['api-idempotence-token'] = idempotenceToken;
}
```

## Known Limitations

1. **First Request**: First API request won't have a token (normal behavior)
2. **Browser Storage**: Tokens are stored in localStorage (cleared on logout/browser clear)
3. **Cross-Tab**: Token may not sync across browser tabs in real-time

## Success Criteria

✅ All test cases pass
✅ No console errors related to token management
✅ Build succeeds without TypeScript errors
✅ Application functions normally with automatic token management
✅ No manual token refresh needed

## Rollback Plan

If issues occur:
1. Revert to previous commit: `git revert HEAD`
2. Restore manual token management
3. Re-test backend compatibility
