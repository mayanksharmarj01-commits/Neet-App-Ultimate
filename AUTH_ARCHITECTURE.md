# Authentication Architecture

## Overview

This application uses a **hybrid authentication approach** that combines Firebase Authentication for Google OAuth and a custom PostgreSQL backend for email/password authentication.

## Architecture Details

### Email/Password Authentication (PostgreSQL)

**How it works:**
- Users register/login via `/api/v1/auth/signup` and `/api/v1/auth/login`
- Backend stores user credentials in PostgreSQL `users` table
- Passwords are hashed using bcrypt before storage
- JWT tokens are issued by the backend for session management
- User data (name, email, role, XP, etc.) stored in PostgreSQL

**Key Files:**
- Backend Controller: [`backend/src/controllers/authController.js`](file:///c:/Users/Mayank/Documents/Neet%20app/backend/src/controllers/authController.js)
- Frontend Store: [`frontend/src/store/useAuthStore.js`](file:///c:/Users/Mayank/Documents/Neet%20app/frontend/src/store/useAuthStore.js)
- Database Schema: [`database/migrations/002_grand_hierarchy_schema.sql`](file:///c:/Users/Mayank/Documents/Neet%20app/database/migrations/002_grand_hierarchy_schema.sql)

**Important:** Email/password users will **NOT** appear in the Firebase Console. They exist only in your PostgreSQL database.

---

### Google OAuth Authentication (Firebase)

**How it works:**
1. Frontend initiates Google sign-in using Firebase SDK
2. User completes Google OAuth flow in popup
3. Firebase returns user data and ID token
4. Frontend sends Firebase ID token to backend at `/api/v1/auth/google-signin`
5. Backend creates/updates user in PostgreSQL database
6. Backend issues JWT token for API access
7. User's Google profile picture stored in PostgreSQL (if available)

**Key Files:**
- Firebase Config: [`frontend/src/config/firebase.js`](file:///c:/Users/Mayank/Documents/Neet%20app/frontend/src/config/firebase.js)
- Backend Controller: [`backend/src/controllers/authController.js`](file:///c:/Users/Mayank/Documents/Neet%20app/backend/src/controllers/authController.js) (googleSignIn method)
- Frontend Store: [`frontend/src/store/useAuthStore.js`](file:///c:/Users/Mayank/Documents/Neet%20app/frontend/src/store/useAuthStore.js) (googleSignIn method)

---

## Why This Hybrid Approach?

### Advantages:
1. **Easy OAuth Integration**: Firebase provides pre-built UI and secure OAuth flows
2. **Flexible Data Model**: PostgreSQL allows complex user data and relationships (XP tracking, chat history, progress tracking)
3. **Single Source of Truth**: All user data lives in PostgreSQL, regardless of auth method
4. **Cost Effective**: No need for Firebase Realtime Database or Firestore
5. **Custom Business Logic**: Full control over authentication rules and user management

### Trade-offs:
- Email/password users don't appear in Firebase Console
- Requires maintaining both Firebase and backend authentication code
- Firebase Admin SDK verification recommended for production (currently trusting frontend tokens)

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,  -- 'google-oauth' for Google users
    role user_role DEFAULT 'student',
    subscription_type subscription_type DEFAULT 'free',
    xp INTEGER DEFAULT 0,
    profile_picture TEXT,  -- Google profile pic URL
    target_year INTEGER,
    profile_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## Authentication Flow Diagrams

### Email/Password Registration
```
User (Frontend) → /api/v1/auth/signup → Backend
                                          ↓
                                    Validate input
                                          ↓
                                    Hash password (bcrypt)
                                          ↓
                                    INSERT INTO users (PostgreSQL)
                                          ↓
                                    Generate JWT token
                                          ↓
User (Frontend) ← {token, user} ← Backend
```

### Google OAuth Sign-In
```
User (Frontend) → Firebase SDK → Google OAuth Popup
                                          ↓
                                    User approves
                                          ↓
User (Frontend) ← Firebase ID Token ← Firebase
       ↓
    Send to backend (/api/v1/auth/google-signin)
       ↓
    Backend verifies token (trust mode) and creates/updates user
       ↓
User (Frontend) ← {token, user} ← Backend (PostgreSQL)
```

---

## Security Considerations

### Current Implementation:
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for API authentication
- ✅ HTTPS recommended for production
- ⚠️ Firebase tokens trusted without verification (for development)

### Production Recommendations:
1. **Verify Firebase Tokens**: Use Firebase Admin SDK to verify ID tokens server-side
2. **Environment Variables**: Store JWT_SECRET and Firebase config securely
3. **Rate Limiting**: Already implemented via express-rate-limit
4. **HTTPS Only**: Enforce HTTPS in production
5. **Token Expiration**: JWT tokens expire after 30 days (configurable)

---

## Migration Considerations

If you want to migrate email/password authentication to Firebase:

**Pros:**
- All users visible in Firebase Console
- Unified authentication management
- Built-in password reset flows
- Email verification built-in

**Cons:**
- Requires frontend code changes
- Existing email/password users need migration
- Less control over auth flow
- Additional Firebase Authentication costs at scale

**Migration Steps:**
1. Enable Email/Password provider in Firebase Console
2. Update frontend to use `createUserWithEmailAndPassword` and `signInWithEmailAndPassword`
3. Migrate existing users to Firebase Authentication
4. Update backend to verify Firebase ID tokens for all users
5. Remove custom email/password endpoints
