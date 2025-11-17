# Admin Login Guide - Radha Sarees

## 🔐 Login System

The admin panel is now protected with a secure login system. You must authenticate to access any admin features.

## Default Credentials

```
Username: admin
Password: admin123
```

## How to Access Admin Panel

### Step 1: Navigate to Admin
Click the **"Admin Panel"** button (floating button, bottom right of the storefront)
- OR -
Navigate directly to: `#admin` in your URL

### Step 2: Login Screen
You will see a professional login screen with:
- Username field
- Password field  
- Login button
- Default credentials displayed for reference

### Step 3: Enter Credentials
1. Enter username: `admin`
2. Enter password: `admin123`
3. Click **"Login"** button

### Step 4: Access Granted
Upon successful login:
- ✅ You'll see a success message
- ✅ Admin dashboard loads automatically
- ✅ Full access to all admin features

## Features

### Security
- ✅ **Protected Routes** - Cannot access admin without login
- ✅ **Session Persistence** - Login state saved in localStorage
- ✅ **Auto-redirect** - Unauthenticated users redirected to login
- ✅ **Logout Function** - Clear session and return to login

### Login Form
- Clean, professional design using your design system
- Inter font family from CSS
- Blue primary colors from design tokens
- Responsive layout
- Loading state during authentication
- Error handling for invalid credentials

### Session Management
Your login session persists:
- ✅ Across page refreshes
- ✅ When navigating between admin views
- ✅ Until you click "Logout"

## How to Logout

### Option 1: Logout Button
1. Scroll to bottom of admin sidebar
2. Click **"Logout"** button
3. Session cleared, redirected to login screen

### Option 2: Visit Store
1. Click "Visit Site" or "View Store"
2. Returns to storefront
3. Session remains active (not logged out)

## Customizing Credentials

### For Production Use
**⚠️ IMPORTANT:** Change default credentials before deploying to production!

### How to Change
Edit `/lib/store.ts` file:

```typescript
// Find the login function (around line 215)
login: (username, password) => {
  // Change these values:
  if (username === 'admin' && password === 'admin123') {
    set({ isAdminAuthenticated: true, adminUsername: username });
    return true;
  }
  return false;
}
```

**Change to:**
```typescript
login: (username, password) => {
  if (username === 'youradmin' && password === 'YourSecurePassword123!') {
    set({ isAdminAuthenticated: true, adminUsername: username });
    return true;
  }
  return false;
}
```

### Multiple Admin Users
To support multiple admin accounts:

```typescript
login: (username, password) => {
  const validCredentials = [
    { username: 'admin1', password: 'SecurePass1!' },
    { username: 'admin2', password: 'SecurePass2!' },
    { username: 'manager', password: 'ManagerPass123!' },
  ];
  
  const isValid = validCredentials.some(
    cred => cred.username === username && cred.password === password
  );
  
  if (isValid) {
    set({ isAdminAuthenticated: true, adminUsername: username });
    return true;
  }
  return false;
}
```

## Integration with Backend

For production, integrate with a real authentication system:

```typescript
login: async (username, password) => {
  try {
    const response = await fetch('https://your-api.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    if (response.ok) {
      const { token, user } = await response.json();
      // Store token in localStorage or secure cookie
      localStorage.setItem('authToken', token);
      set({ isAdminAuthenticated: true, adminUsername: user.username });
      return true;
    }
  } catch (error) {
    console.error('Login error:', error);
  }
  return false;
}
```

## Design System Compliance

The login page uses all design system tokens:

### Typography
- Font: Inter (via `--font-family-inter`)
- Sizes: CSS variables from globals.css
- No hardcoded font sizes or weights

### Colors
- Primary: `var(--primary)` - #1E5EFF (blue)
- Card background: `var(--card)`
- Foreground: `var(--foreground)`
- Muted: `var(--muted)`
- All colors from CSS variables

### Spacing & Layout
- Border radius: `var(--radius)`
- Borders: `var(--border)`
- Consistent padding using Tailwind classes

## Troubleshooting

### Can't Login?
1. ✅ Check username is exactly: `admin` (lowercase)
2. ✅ Check password is exactly: `admin123`
3. ✅ Clear browser cache and localStorage
4. ✅ Try in incognito/private window

### Stuck on Login Screen?
1. Open browser console (F12)
2. Check for JavaScript errors
3. Clear localStorage: `localStorage.clear()`
4. Refresh page and try again

### Session Lost After Refresh?
1. Check localStorage is enabled in browser
2. Check for browser extensions blocking storage
3. Verify `radha-sarees-store` exists in localStorage

## Security Best Practices

### For Production:
1. ✅ Change default credentials immediately
2. ✅ Use strong, unique passwords (min 12 characters)
3. ✅ Implement rate limiting on login attempts
4. ✅ Add CAPTCHA for additional security
5. ✅ Use HTTPS only in production
6. ✅ Implement session timeout (auto-logout after inactivity)
7. ✅ Use backend authentication with JWT tokens
8. ✅ Never store passwords in plain text
9. ✅ Implement 2FA (Two-Factor Authentication)
10. ✅ Log authentication attempts for security monitoring

## Summary

Your admin panel now has a complete, functional login system that:
- ✅ Protects all admin routes
- ✅ Uses your design system completely
- ✅ Persists login sessions
- ✅ Provides smooth UX with loading states
- ✅ Easy to customize for production use

**Default Login:**
- Username: `admin`
- Password: `admin123`

Remember to change these credentials before going live! 🔒
