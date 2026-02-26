# OnboardAI - AI-Powered Personalized Onboarding POC

A full-stack proof-of-concept SaaS application that uses AI to create personalized onboarding experiences for different user types. When users sign up, they answer a few questions about their role and goals, and an AI system recommends the best onboarding path with a customized checklist.

## 🎯 What This Does

1. **Signup/Login**: Users create an account with email + password authentication
2. **Profile Questionnaire**: New users answer 3 questions (role, team size, goal)
3. **AI Scoring**: OpenAI evaluates responses and assigns the user to one of 5 onboarding paths
4. **Personalized Checklist**: User sees a customized checklist based on their path
5. **Admin Dashboard**: View all users and their assigned paths

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)
- **Database**: SQLite (self-contained, no setup needed)
- **Auth**: JWT with bcrypt password hashing
- **AI**: OpenAI API for user classification
- **Structure**:
  - `/src/controllers` - Request handlers
  - `/src/services` - Business logic (AI scoring)
  - `/src/models` - Database operations
  - `/src/middleware` - Auth, error handling
  - `/src/routes` - API endpoint definitions

### Frontend (React + TypeScript + Vite)
- **Routing**: React Router for page navigation
- **State**: React Context for authentication
- **API**: Axios for backend communication
- **Structure**:
  - `/src/pages` - Full page components
  - `/src/components` - Reusable UI components
  - `/src/services` - API client
  - `/src/context` - Global state
  - `/src/styles` - CSS modules

## 📦 Tech Stack

**Backend:**
- Express 4.x
- TypeScript 5.x
- SQLite3
- OpenAI SDK
- JWT (jsonwebtoken)
- Bcryptjs

**Frontend:**
- React 18.x
- TypeScript 5.x
- React Router 6.x
- Axios
- Vite (bundler)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- OpenAI API key (free tier works for testing)

### 1. Clone & Setup

```bash
cd OnboardAI

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env and add your OpenAI API key

# Frontend setup (in new terminal)
cd ../frontend
npm install
cp .env.example .env
```

### 2. Start Backend (runs on http://localhost:5000)

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database ready
🚀 Server running at http://localhost:5000
```

### 3. Start Frontend (runs on http://localhost:3000)

```bash
cd frontend
npm run dev
```

Then open http://localhost:3000 in your browser.

## 📋 User Journeys

### New User Flow
1. Land on signup page → `/signup`
2. Create account with email/password
3. Redirected to onboarding → `/onboarding`
4. Answer 3 questions (role, team size, goal)
5. AI assigns path (Operations Manager, Sales Lead, Founder, etc.)
6. See personalized checklist → `/dashboard`

### Existing User
1. Log in → `/login`
2. Go straight to dashboard with their path
3. Can see checklist and mark items complete

### Admin
1. Visit `/admin` to see all users and their path assignments
2. Track which user type was assigned to each person

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires token)

### User Profile
- `PUT /api/users/profile` - Update profile & get assigned path
- `GET /api/users/profile` - Get user profile
- `GET /api/users` - Get all users (admin)

### Health
- `GET /api/health` - Check server status

All endpoints (except signup/login) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## 🧠 How AI Assignment Works

1. User submits: role, team_size, goal
2. Backend prompts OpenAI with user data + list of path options
3. OpenAI returns the best-fit path name
4. Backend:
   - Stores assignment in database
   - Generates a personalized welcome message
   - Returns path details + checklist items

**Fallback**: If API fails, assigns "Operations Manager" path

## 📊 User Types / Onboarding Paths

The system includes 5 default paths:

1. **Operations Manager** - Workflow automation, process efficiency, team management
2. **Sales Lead** - Pipeline management, team targets, forecasting
3. **Founder** - Complete setup, team organization, permissions, analytics
4. **Support Manager** - Help desk, SLAs, knowledge base, ticket management
5. **Marketing Manager** - Campaign planning, email templates, analytics

You can add more paths by editing [OnboardingPath.ts](backend/src/models/OnboardingPath.ts) and updating the `DEFAULT_PATHS` array.

## 🗄️ Database Schema

### users table
```sql
id TEXT PRIMARY KEY
email TEXT UNIQUE
password_hash TEXT
role TEXT                 -- User's role (from questionnaire)
team_size TEXT           -- Team size (from questionnaire)
goal TEXT                -- User's goal (from questionnaire)
assigned_path TEXT       -- Foreign key to onboarding_paths.id
created_at DATETIME
updated_at DATETIME
```

### onboarding_paths table
```sql
id TEXT PRIMARY KEY
name TEXT                -- Path name
description TEXT         -- Path description
user_type TEXT          -- Role this path targets
checklist_items TEXT    -- JSON array of checklist items
created_at DATETIME
```

### user_checklists table
```sql
id TEXT PRIMARY KEY
user_id TEXT            -- Foreign key to users.id
path_id TEXT            -- Foreign key to onboarding_paths.id
item_index INTEGER      -- Which checklist item
completed BOOLEAN       -- Is it done?
completed_at DATETIME   -- When was it completed?
created_at DATETIME
```

## 🔐 Security Notes

For production, you **must**:
- [ ] Change `JWT_SECRET` in .env to a strong random value
- [ ] Add proper admin role checks (currently all authenticated users can access `/admin`)
- [ ] Use HTTPS
- [ ] Add rate limiting on auth endpoints
- [ ] Store secrets in environment (don't commit .env)
- [ ] Add CORS restrictions
- [ ] Add input validation on all endpoints

## 🛠️ Development

### Build Backend
```bash
cd backend
npm run build       # Compile TypeScript
npm run start       # Run compiled code
```

### Build Frontend
```bash
cd frontend
npm run build       # Create production bundle
npm run preview     # Preview build
```

### Type Checking
```bash
# Backend
cd backend && npm run typecheck

# Frontend
cd frontend && npm run type-check
```

## 📝 Code Comments & Structure

The codebase is heavily commented for easy handoff:

- **Error Handling**: Centralized error middleware catches all errors
- **Async/Await**: All async operations use proper error handling
- **Type Safety**: Full TypeScript with no `any` types
- **Validation**: Express-validator for input validation
- **Middleware**: Separates concerns (auth, errors, logging)

## 🎨 Frontend Styling

- Pure CSS (no framework dependencies)
- CSS variables for theming
- Mobile-responsive design
- Utility classes for common patterns

## 🐛 Troubleshooting

### "Cannot find module 'openai'"
Make sure you ran `npm install` in the backend directory.

### Frontend won't connect to backend
- Check backend is running: `curl http://localhost:5000/api/health`
- Check CORS_ORIGIN in backend .env matches frontend URL
- Check frontend .env has correct API_URL

### Database locked error
Stop the backend server. SQLite will maintain locks if not properly closed.

### AI returns wrong path
Try:
1. Check OpenAI API key is valid
2. Look at server logs for actual API response
3. Test with different user inputs
4. Adjust the prompt in [aiService.ts](backend/src/services/aiService.ts)

## 📚 Next Steps for Production

### Phase 2: Enhanced Features
- [ ] Remember checklist completion state (store in DB)
- [ ] Email verification for signup
- [ ] Password reset flow
- [ ] Team invitations
- [ ] Feature tour/walkthrough UI
- [ ] Settings page for users
- [ ] Export user data

### Phase 3: Admin Features
- [ ] User activity analytics
- [ ] Path effectiveness tracking
- [ ] Custom path creation UI
- [ ] Bulk operations
- [ ] Audit logs

### Phase 4: Scaling
- [ ] Replace SQLite with PostgreSQL
- [ ] Add Redis for caching/sessions
- [ ] API rate limiting
- [ ] Stripe billing integration
- [ ] AWS/GCP deployment

## 📄 License

This POC is provided as-is for internal use.

## 👤 Support

For questions or issues:
1. Check the comments in the code (heavily documented)
2. Review the API endpoint documentation above
3. Check error logs in browser console (frontend) or terminal (backend)

---

**Built with ❤️ for fast validation cycles**
