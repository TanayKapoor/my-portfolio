# Authentication Documentation

Complete guide to the authentication system implementation.

## Overview

The authentication system uses **Passport.js** with a **Local Strategy** for username/password authentication and **express-session** for session management.

## Architecture

```
┌─────────────────┐
│  Client Request │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Express Session │ ← PostgreSQL Session Store
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Passport.js   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Local Strategy  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Bcrypt Password │
│   Verification  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   User Object   │
└─────────────────┘
```

## Implementation Details

### File: `server/auth.ts`

#### Session Configuration

```typescript
{
  secret: process.env.SESSION_SECRET || "your-session-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,  // PostgreSQL session store
  cookie: {
    secure: false,              // Set to true in production with HTTPS
    httpOnly: true,             // Prevents XSS attacks
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}
```

**Important:**
- Set `SESSION_SECRET` environment variable in production
- Enable `secure: true` when using HTTPS
- Sessions are stored in PostgreSQL for persistence

---

## Password Security

### Password Hashing

Uses **bcrypt** with salt rounds of 10:

```typescript
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}
```

### Password Verification

```typescript
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return await bcrypt.compare(supplied, stored);
}
```

**Security Features:**
- Salted hashing prevents rainbow table attacks
- Automatic salt generation
- Computationally expensive (protects against brute force)
- Constant-time comparison

---

## Passport.js Strategy

### Local Strategy Configuration

```typescript
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false, { message: "Invalid username or password" });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);
```

**Flow:**
1. Receive username and password
2. Look up user in database
3. Compare provided password with stored hash
4. Return user object or authentication failure

### Session Serialization

```typescript
// Store only user ID in session
passport.serializeUser((user, done) => done(null, user.id));

// Retrieve full user object from ID
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});
```

---

## Authentication Endpoints

### Registration

**Endpoint:** `POST /api/register`

**Process:**
1. Validate input with Zod schema
2. Check for existing username
3. Check for existing email
4. Hash password with bcrypt
5. Create user in database
6. Auto-login user
7. Return user data (without password)

**Security Measures:**
- Duplicate username/email prevention
- Password strength validation (via Zod schema)
- Automatic password hashing
- Password never returned in response

---

### Login

**Endpoint:** `POST /api/login`

**Process:**
1. Validate input with Zod schema
2. Execute Passport Local Strategy
3. Create session on success
4. Return user data (without password)

**Security Measures:**
- Generic error messages (prevents user enumeration)
- Rate limiting recommended (not implemented)
- Session fixation prevention

---

### Logout

**Endpoint:** `POST /api/logout`

**Process:**
1. Destroy session
2. Clear session cookie
3. Return success message

---

### Get Current User

**Endpoint:** `GET /api/user`

**Process:**
1. Check if user is authenticated
2. Return user data (without password)

---

## Middleware Functions

### `requireAuth`

Ensures user is authenticated.

**Usage:**
```typescript
app.get("/api/protected", requireAuth, (req, res) => {
  // User is guaranteed to be authenticated
});
```

**Implementation:**
```typescript
export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}
```

---

### `requireAdmin`

Ensures user is authenticated AND has admin privileges.

**Usage:**
```typescript
app.post("/api/admin/action", requireAdmin, (req, res) => {
  // User is admin
});
```

**Implementation:**
```typescript
export function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin privileges required" });
  }

  next();
}
```

---

## User Roles

### Admin Users

Admin users have elevated privileges:
- Create/update/delete projects
- Create/update/delete work experiences
- Create/update/delete commands
- Upload files
- View all newsletter subscriptions
- View all contact emails

**Setting Admin Status:**

Admin status is set in the database:
```typescript
isAdmin: boolean  // Set to true for admin users
```

**First Admin:** Create manually in database or via seed script.

---

## Session Storage

### PostgreSQL Session Store

Uses `connect-pg-simple` for session persistence:

```typescript
sessionStore: new PostgresSessionStore({
  pool,                      // Database connection pool
  createTableIfMissing: true // Auto-create session table
})
```

**Benefits:**
- Sessions persist across server restarts
- Horizontal scaling support
- Automatic session cleanup
- Production-ready

**Session Table:**
- Auto-created by `connect-pg-simple`
- Stores session data and expiration
- Automatic garbage collection

---

## Security Best Practices

### Implemented

✅ Password hashing with bcrypt
✅ HTTP-only cookies (XSS protection)
✅ Session-based authentication
✅ Role-based access control
✅ Generic error messages
✅ Session persistence in database
✅ Password never in responses
✅ Input validation with Zod

### Recommended for Production

⚠️ Enable HTTPS and set `secure: true` on cookies
⚠️ Set strong `SESSION_SECRET` environment variable
⚠️ Implement rate limiting on auth endpoints
⚠️ Add CSRF protection
⚠️ Implement account lockout after failed attempts
⚠️ Add password complexity requirements
⚠️ Implement email verification
⚠️ Add two-factor authentication (2FA)
⚠️ Set up session timeout warnings
⚠️ Implement refresh tokens for long-lived sessions

---

## Type Definitions

### Express User Extension

```typescript
declare global {
  namespace Express {
    interface User extends DbUser {}
  }
}
```

Extends Express Request object to include typed user:

```typescript
req.user // Typed as DbUser
```

---

## Error Handling

### Authentication Errors

**401 Unauthorized:**
- User not authenticated
- Invalid credentials
- Session expired

**403 Forbidden:**
- User authenticated but lacks permissions
- Non-admin accessing admin route

### Example Error Response

```json
{
  "message": "Authentication required"
}
```

```json
{
  "message": "Admin privileges required"
}
```

---

## Testing Authentication

### Manual Testing

1. **Register:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123"
  }' \
  -c cookies.txt
```

3. **Access Protected Route:**
```bash
curl http://localhost:5000/api/user \
  -b cookies.txt
```

4. **Logout:**
```bash
curl -X POST http://localhost:5000/api/logout \
  -b cookies.txt
```

---

## Environment Variables

```bash
# Required for production
SESSION_SECRET=your-secure-random-string-here

# Database connection (required)
DATABASE_URL=postgresql://user:password@host/database
```

**Generating Secure Session Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Common Issues

### Sessions Not Persisting

**Problem:** Sessions are lost after server restart

**Solution:** Ensure PostgreSQL session store is configured correctly

---

### Cookie Not Set

**Problem:** Login successful but session not maintained

**Solutions:**
- Check `trust proxy` setting for proxied deployments
- Verify `httpOnly` and `secure` cookie settings
- Check CORS configuration for cross-origin requests

---

### Admin Routes Return 403

**Problem:** User authenticated but gets "Admin privileges required"

**Solution:** Set `isAdmin: true` in database for the user

```sql
UPDATE users SET "isAdmin" = true WHERE username = 'admin';
```

---

## Future Enhancements

- OAuth2 integration (Google, GitHub)
- Email verification
- Password reset functionality
- Two-factor authentication
- Remember me functionality
- Session activity logging
- Passwordless authentication (magic links)
