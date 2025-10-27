# Authentication Configuration

## User Accounts and Passwords

### Default Account
- **Username**: `stx`
- **Password**: `123456`
- **Role**: USER
- **Permissions**: Access to Home, Trading, and Stacks Monitoring pages

### Super Admin Account
- **Username**: `super`
- **Password**: `root` (changed from `123456`)
- **Role**: ADMIN
- **Permissions**: Full access to all pages including system management

## Backend Configuration

The authentication is handled by a separate backend service. To update the super account password:

1. Locate the authentication service/database
2. Update the password hash for the `super` user to match the new password `root`
3. Ensure the password is properly encrypted using the same encryption method as other passwords

## Frontend Changes

The frontend has been updated to:
- Default login form to `stx` account
- Remove hints about `super` account from login page
- Restrict menu visibility based on user role
- Allow USER role access to Stacks monitoring pages
