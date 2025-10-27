# Authentication Configuration

## User Accounts and Passwords

### Default Account
- **Username**: `stx`
- **Password**: `stx123`
- **Role**: USER
- **Permissions**: Access to Home, Trading, and Stacks Monitoring pages

### Super Admin Account
- **Username**: `super`
- **Password**: `root`
- **Role**: ADMIN
- **Permissions**: Full access to all pages including system management

### Admin Account
- **Username**: `admin`
- **Password**: `root`
- **Role**: ADMIN
- **Permissions**: Full access to all pages including system management

**Security Note**: For production environments, it is strongly recommended to use a strong password with at least 12 characters including uppercase, lowercase, numbers, and special characters. The passwords used here (`stx123` and `root`) are simple passwords set as per project requirements but should be changed to more secure passwords in production.

## Backend Configuration

The authentication is handled by a separate backend service. The user credentials have been updated as follows:

1. **stx** account: password changed to `stx123`
2. **super** account: password set to `root`
3. **admin** account: password set to `root`

To implement these changes in the backend:

1. Locate the authentication service/database
2. Update the password hashes for all three users to match their new passwords
3. Ensure the passwords are properly hashed using secure algorithms like bcrypt or similar one-way hashing functions
4. **Important**: In production environments, replace these simple passwords with strong passwords containing at least 12 characters with mixed case, numbers, and special characters

## Frontend Changes

The frontend has been updated to:
- Default login form to `stx` account
- Remove hints about `super` account from login page
- Restrict menu visibility based on user role
- Allow USER role access to Stacks monitoring pages
