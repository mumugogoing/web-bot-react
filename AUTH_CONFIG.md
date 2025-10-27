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

**Security Note**: For production environments, it is strongly recommended to use a strong password with at least 12 characters including uppercase, lowercase, numbers, and special characters. The password `root` is used here as per project requirements but should be changed to a more secure password in production.

## Backend Configuration

The authentication is handled by a separate backend service. To update the super account password:

1. Locate the authentication service/database
2. Update the password hash for the `super` user to match the new password `root`
3. Ensure the password is properly hashed using secure algorithms like bcrypt or similar one-way hashing functions
4. **Important**: In production environments, replace `root` with a strong password containing at least 12 characters with mixed case, numbers, and special characters

## Frontend Changes

The frontend has been updated to:
- Default login form to `stx` account
- Remove hints about `super` account from login page
- Restrict menu visibility based on user role
- Allow USER role access to Stacks monitoring pages
