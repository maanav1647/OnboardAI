# OnboardAI Implementation Notes - Developer Handoff

## Overview
This document explains the complete architecture, code structure, and design decisions for the OnboardAI POC. Use this to understand how the system works and where to make changes.

## Quick Facts
- **Frontend**: React 18 + TypeScript + Vite + React Router
- **Backend**: Node.js + Express + TypeScript + SQLite
- **Database**: SQLite (self-contained, no external DB needed)
- **AI**: OpenAI API for user classification
- **Auth**: JWT + Bcrypt password hashing
- **Time to setup**: ~5 minutes with OpenAI key

---

## Architecture Overview

```
User's Browser (Port 3000)
         ↓
   React Frontend
         ↓
  HTTP/JSON (Axios)
         ↓
Express Server (Port 5000)
         ↓
   SQLite Database
   + OpenAI API
```

### Data Flow Example: User Signup → Onboarding → Dashboard

1. **Frontend** (React)
   - User fills signup form
   - Calls `POST /api/auth/signup`
   
2. **Backend** (Express)
   - Validates email + password
   - Hashes password with bcryptjs
   - Saves user to SQLite
   - Returns JWT token
   
3. **Frontend** (React)
   - Saves token to localStorage
   - Redirects to `/onboarding`
   
4. **Frontend** (React)
   - User answers profile questions
   - Calls `PUT /api/users/profile` with answers
   
5. **Backend** (Express)
   - Receives user profile data
   - Calls **OpenAI API** with prompt
   - OpenAI returns best-fit user type
   - Updates database with assignment
   - Generates welcome message
   - Returns path + checklist
   
6. **Frontend** (React)
   - Shows welcome message + checklist
   - Redirects to `/dashboard`

---

## Backend Structure Deep Dive

### Directory Layout
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts       # SQLite initialization & schema
│   │   └── env.ts            # Environment variables & validation
│   ├── controllers/
│   │   ├── authController.ts # signup, login, getCurrentUser
│   │   └── userController.ts # updateProfile, getProfile, getAllUsers
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification, token generation
│   │   └── errorHandler.ts   # Centralized error catching
│   ├── models/
│   │   ├── User.ts           # Database operations for users
│   │   └── OnboardingPath.ts # Paths & checklist management
│   ├── routes/
│   │   ├── authRoutes.ts     # /api/auth/* endpoints
│   │   └── userRoutes.ts     # /api/users/* endpoints
│   ├── services/
│   │   └── aiService.ts      # OpenAI integration for classification
│   └── index.ts              # App initialization & server startup
├── .env                        # Configuration (don't commit!)
├── .env.example               # Template for .env
├── .gitignore                 # Node/build files to ignore
├── package.json               # Dependencies & scripts
└── tsconfig.json              # TypeScript configuration
```

### Key Files Explained

#### `src/index.ts` - Entry Point
- Initializes Express app
- Sets up middleware (CORS, helmet, JSON parser)
- Calls `initializeDatabase()` to create tables
- Seeds default onboarding paths
- Starts server on port 5000

**Key insight**: This is where the app starts. If you need to add new routes, import them here.

#### `src/config/database.ts` - Database Setup
- Creates SQLite connection
- Defines all table schemas (users, onboarding_paths, user_checklists)
- Initializes tables with CREATE TABLE IF NOT EXISTS

**Schema Overview**:
- **users**: Stores user account + profile data
- **onboarding_paths**: Pre-defined paths (Operations Manager, Sales Lead, etc.)
- **user_checklists**: Tracks which checklist items are completed

**Key insight**: To add new fields to a user, modify this schema and run migrations (not handled in POC yet).

#### `src/config/env.ts` - Configuration
- Loads `.env` file with environment variables
- Validates required variables in production
- Exports config object for use throughout app

**Variables**:
```
PORT              # Server port (5000)
NODE_ENV          # development or production
DB_PATH           # Database file location
JWT_SECRET        # Secret key for signing tokens (change in production!)
OPENAI_API_KEY    # Your OpenAI API key
CORS_ORIGIN       # Frontend URL (http://localhost:3000)
```

#### `src/middleware/errorHandler.ts` - Global Error Handling
All endpoints are wrapped to catch errors and send consistent responses.

```typescript
// Without errorHandler:
app.get('/api/health', (req, res) => {
  throw new Error('Oops!'); // Crashes server
});

// With errorHandler:
app.get('/api/health', errorHandler((req, res) => {
  throw new Error('Oops!'); // Returns 500 JSON response
}));
```

#### `src/middleware/auth.ts` - JWT Management
Two key exports:
- `authenticateToken()` - Middleware that verifies JWT in Authorization header
- `generateToken()` - Creates JWT with user ID + email

**How it works**:
1. User logs in → `generateToken()` creates JWT
2. Frontend stores JWT in localStorage
3. Frontend sends token in every request: `Authorization: Bearer <token>`
4. Middleware verifies token, extracts user info
5. `req.user` is now available in controllers

#### `src/models/User.ts` - Database Operations
All database queries for users live here. Example:

```typescript
// Create new user
const user = await User.create('test@example.com', 'password123');

// Find by email
const user = await User.findByEmail('test@example.com');

// Update profile
await User.updateProfile(userId, { role: 'Founder', assigned_path: pathId });

// Get all users (admin)
const allUsers = await User.getAllUsers();
```

#### `src/models/OnboardingPath.ts` - Path Management
Manages the different onboarding journeys. Key features:
- **Default paths** - 5 predefined paths (see DEFAULT_PATHS array)
- **Checklists** - Each path has a checklist of steps in JSON format
- **Seeding** - `seedDefaultPaths()` creates default paths on startup

To add a new path:
```typescript
const DEFAULT_PATHS = [
  // ...existing paths
  {
    user_type: 'New Role',
    name: 'New Role Path',
    description: 'Description here',
    checklist: [
      { title: 'Step 1', description: 'Do this first' },
      { title: 'Step 2', description: 'Then this' },
    ],
  },
];
```

#### `src/services/aiService.ts` - AI User Classification
Uses OpenAI to classify users. Two key functions:

1. **`scoreAndAssignPath()`**
   - Takes: role, team_size, goal
   - Sends to OpenAI with list of available paths
   - OpenAI returns which path best fits
   - Fallback: uses user's role if available

2. **`generateWelcomeMessage()`**
   - Takes: user name, path name
   - Generates personalized welcome message
   - Fallback: generic message if API fails

**Key insight**: If OpenAI API is down, the system still works (uses fallbacks).

#### `src/controllers/authController.ts` - Auth Endpoints
Three main functions:

1. **`signup()`**
   - Validates email + password
   - Checks if email already exists
   - Hashes password with bcryptjs
   - Creates user in database
   - Returns JWT token

2. **`login()`**
   - Finds user by email
   - Compares provided password with hash
   - Returns JWT token if valid

3. **`getCurrentUser()`**
   - Uses JWT middleware to extract user
   - Returns user data (without password hash)

#### `src/controllers/userController.ts` - User Endpoints
Three main functions:

1. **`updateProfile()`**
   - Receives: role, team_size, goal
   - Calls `scoreAndAssignPath()` from AI service
   - Updates user in database
   - Calls `generateWelcomeMessage()`
   - Returns: user data + assigned path + checklist

2. **`getUserProfile()`**
   - Returns user data + their assigned path details

3. **`getAllUsers()`**
   - Returns all users with their paths (admin endpoint)
   - Currently has NO admin check - fix this in production!

---

## Frontend Structure Deep Dive

### Directory Layout
```
frontend/
├── src/
│   ├── components/
│   │   ├── Button.tsx         # Reusable button with loading state
│   │   ├── Card.tsx           # Reusable card container
│   │   └── FormInput.tsx       # Reusable form input field
│   ├── context/
│   │   └── AuthContext.tsx     # Global auth state management
│   ├── pages/
│   │   ├── LoginPage.tsx       # /login
│   │   ├── SignupPage.tsx      # /signup
│   │   ├── OnboardingPage.tsx  # /onboarding (profile questions)
│   │   ├── DashboardPage.tsx   # /dashboard (user's path)
│   │   └── AdminDashboardPage.tsx # /admin (all users)
│   ├── services/
│   │   └── api.ts             # Axios client + API functions
│   ├── styles/
│   │   ├── globals.css         # Global CSS variables + utilities
│   │   ├── Button.css          # Button styles
│   │   ├── FormInput.css       # Form input styles
│   │   ├── Card.css            # Card styles
│   │   └── layout.css          # Page layout styles
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # Entry point
│   └── vite-env.d.ts           # Vite type definitions
├── index.html                   # HTML template
├── vite.config.ts               # Vite bundler config
├── tsconfig.json                # TypeScript config
├── .env                         # Environment (already configured)
└── package.json                 # Dependencies & scripts
```

### Key Files Explained

#### `src/main.tsx` - Entry Point
Simply mounts React app to DOM element with id="root".

#### `src/App.tsx` - Routing & Protected Routes
- Defines all routes (signup, login, dashboard, etc.)
- Two types of routes:
  - **PublicRoute**: Redirects to dashboard if already logged in
  - **ProtectedRoute**: Redirects to login if not authenticated
- AuthProvider wraps entire app for auth state

#### `src/context/AuthContext.tsx` - Global Auth State
Manages:
- Current user object
- JWT token
- Login/logout functions
- isLoading state

**Usage in components**:
```typescript
const { user, token, login, logout, isAuthenticated } = useAuth();
```

#### `src/services/api.ts` - Backend Communication
Axios instance with:
- Base URL configuration
- Request interceptor to add JWT token to all requests
- Service objects for different API areas:
  - `authService`: signup, login, getCurrentUser, logout
  - `userService`: updateProfile, getProfile, getAllUsers

**Example usage**:
```typescript
const { user, token } = await authService.login(email, password);
const response = await userService.updateProfile(profile);
```

#### `src/types/index.ts` - TypeScript Definitions
Defines all data structures:
- `User` - User account object
- `OnboardingPath` - Single path with checklist
- `ChecklistItem` - Single checklist item
- `ProfileData` - Profile questionnaire data
- API response types

**Key insight**: All components use these types for strong typing.

#### `src/pages/` - Page Components
Each page is a complete screen.

**SignupPage.tsx**:
- Email + password form
- Validation (password length, confirmation match)
- Calls `authService.signup()`
- Redirects to `/onboarding` on success

**LoginPage.tsx**:
- Email + password form
- Calls `authService.login()`
- Redirects to `/onboarding` on success

**OnboardingPage.tsx** (Most Complex):
- Shows 3 questions: role, team_size, goal
- Shows success state with:
  - Welcome message (from AI)
  - Assigned path name
  - Personalized checklist
- Calls `userService.updateProfile()`

**DashboardPage.tsx**:
- Shows user's assigned path (if any)
- Displays full checklist
- Checkboxes for tracking progress (not saved yet)
- Logout button

**AdminDashboardPage.tsx**:
- Table of all users
- Shows email, role, team size, assigned path
- For monitoring user flow

#### `src/components/` - Reusable Components
Small, focused components:

**Button.tsx**:
- Variants: primary, secondary, danger
- Loading state with spinner text
- Disabled state

**Card.tsx**:
- Container with shadow + border
- Optional title + description
- Most pages use this for layout

**FormInput.tsx**:
- Input field with label
- Error message display
- Focus states

#### `src/styles/` - CSS Files
Pure CSS (no framework):
- CSS variables defined in `globals.css`
- Utility classes (mt-1, mb-2, text-center, etc.)
- Responsive design
- Accessible form styling

---

## Common Tasks & How To Do Them

### Add a New API Endpoint

1. **Create controller function** in `backend/src/controllers/`
   ```typescript
   export const myFunction = asyncHandler(async (req: Request, res: Response) => {
     res.json({ success: true, data: {...} });
   });
   ```

2. **Add route** in `backend/src/routes/`
   ```typescript
   router.get('/myroute', authenticateToken, myFunction);
   ```

3. **Test with curl**
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:5000/api/myroute
   ```

### Add a New User Type/Path

1. Open `backend/src/models/OnboardingPath.ts`
2. Add to `DEFAULT_PATHS` array:
   ```typescript
   {
     user_type: 'My New Role',
     name: 'My New Role Path',
     description: '...',
     checklist: [...],
   }
   ```
3. Restart backend (paths auto-seed on startup)

### Change the AI Scoring Logic

Edit `backend/src/services/aiService.ts`:
- Modify the prompt in `scoreAndAssignPath()`
- Change the model (currently `gpt-3.5-turbo`)
- Change fallback logic

Example: Make AI consider team_size more heavily:
```typescript
const prompt = `VERY IMPORTANT: Pay close attention to team size. 
${teamSize} is the most critical factor...`;
```

### Add Database Migrations

Currently, schema changes require:
1. Edit `backend/src/config/database.ts`
2. Delete `backend/data/onboard.db`
3. Restart backend (recreates database)

For production, implement:
- Migration framework (e.g., sql-bricks)
- Version tracking
- Up/down migrations

### Persist Checklist Completion

Currently, checkboxes are UI-only (not saved). To persist:

1. Create endpoint: `PATCH /api/users/checklist/:itemIndex`
2. Update `user_checklists` table in database
3. Frontend calls this on checkbox change
4. DashboardPage fetches completion state on load

### Change Authentication Method

Currently: Email + password

To add Google OAuth:
1. Install OAuth library: `npm install next-auth`
2. Create OAuth provider config
3. Update SignupPage and LoginPage
4. Remove password hashing

### Deploy to Production

1. **Environment**:
   - Set `NODE_ENV=production` in backend .env
   - Change `JWT_SECRET` to strong random value
   - Add admin role checks

2. **Database**:
   - Migrate to PostgreSQL
   - Set up database backups
   - Add indexes for performance

3. **Hosting**:
   - Backend: Railway.app, Render.com, or AWS EC2
   - Frontend: Vercel, Netlify
   - Both: Use environment variables, not hardcoded values

4. **Monitoring**:
   - Add logging (e.g., Winston, Pino)
   - Add error tracking (e.g., Sentry)
   - Monitor API response times

---

## Testing Checklist

- [ ] Signup creates new user
- [ ] Login works with correct credentials
- [ ] Login fails with wrong password
- [ ] Onboarding questions update user profile
- [ ] AI assigns correct path based on profile
- [ ] Dashboard shows personalized checklist
- [ ] Admin dashboard shows all users
- [ ] Logout clears auth token
- [ ] Protected routes redirect to login
- [ ] Error messages display correctly
- [ ] Database persists data across restarts

---

## Common Bugs & Fixes

### "jwt malformed"
- Token expired or corrupted
- Fix: Clear localStorage, login again

### "OPENAI_API_KEY not found"
- .env file not created or key not set
- Fix: Copy .env.example to .env and add real key

### "Cannot read property 'message' of null"
- API response structure unexpected
- Fix: Log response in browser console, check API service

### User can access /admin without being admin
- No admin check implemented
- Fix: Add role check in `getAllUsers()` controller

### Checklist changes don't persist
- Checkboxes aren't saved to database
- Fix: Follow "Persist Checklist Completion" section above

---

## Performance Considerations

1. **Database**: SQLite works for POC, use PostgreSQL for >1000 users
2. **API Calls**: Each profile update calls OpenAI (slow). Cache results.
3. **Frontend**: Uses React Router lazy loading. Add for large apps.
4. **Caching**: Add Redis for session storage, OpenAI response caching.

---

## Security Notes (IMPORTANT!)

### Current Issues
- [ ] `JWT_SECRET` is default - must change in production
- [ ] No admin role check - anyone logged in can see all users
- [ ] No rate limiting - OpenAI API could be abused
- [ ] Passwords sent over HTTP - needs HTTPS in production
- [ ] CORS allows all origins from env - restrict in production

### Must Fix Before Production
1. Change JWT_SECRET to cryptographically random value
2. Add admin role to users table and enforce checks
3. Add rate limiting on auth and profile endpoints
4. Use HTTPS only
5. Restrict CORS to specific domains
6. Add input validation/sanitization
7. Use helmet for security headers
8. Add CSRF protection
9. Add password complexity requirements
10. Implement account lockout after failed login

---

## Useful Commands

```bash
# Backend
npm run dev          # Start development server with auto-reload
npm run build        # Compile TypeScript
npm run start        # Run compiled version
npm run typecheck    # Check for TypeScript errors

# Frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Check TypeScript errors

# Database
# Backup:
cp backend/data/onboard.db backend/data/onboard.db.backup

# Reset:
rm backend/data/onboard.db    # Let backend recreate it
```

---

## File Change Summary

When handing off to another developer, note:
- **Configuration**: All in `.env` files
- **Database schema**: In `backend/src/config/database.ts`
- **Routes**: In `backend/src/routes/`
- **API logic**: In `backend/src/controllers/` and `backend/src/services/`
- **Frontend navigation**: In `frontend/src/App.tsx`
- **Styling**: In `frontend/src/styles/`

---

## Questions to Ask Next Developer

1. What features from the requirements are most important?
2. Should checklist completion persist?
3. Do we need real payment processing?
4. What's the user volume target?
5. Should we add email verification?
6. Need multi-team/workspace support?
7. Should old paths be updatable?

---

## Resources

- Express docs: https://expressjs.com
- React docs: https://react.dev
- SQLite docs: https://www.sqlite.org/docs.html
- OpenAI API: https://platform.openai.com/docs
- JWT: https://jwt.io/introduction
- BCrypt: https://github.com/kelektiv/node.bcrypt.js

---

**Last Updated**: Feb 26, 2025
**POC Status**: Ready for testing and iteration
