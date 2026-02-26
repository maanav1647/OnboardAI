# START HERE 👋

Welcome to OnboardAI! This is a proof-of-concept (POC) SaaS application that uses AI to create personalized onboarding experiences.

## What Is This?

Users sign up → Answer 3 questions → AI determines their best onboarding path → See personalized checklist

**Key Features**:
- ✅ User authentication (email + password)
- ✅ 5 predefined onboarding paths
- ✅ AI-powered user classification
- ✅ Personalized welcome messages
- ✅ Customized checklists per user type
- ✅ Admin dashboard to view all users

## 5-Minute Quick Start

### 1. Get OpenAI Key (2 min)
- Go to https://platform.openai.com/account/api-keys
- Create new API key (free tier available)
- Copy the key

### 2. Configure Backend (1 min)
```bash
cd backend
cp .env.example .env
# Edit .env, replace OPENAI_API_KEY with your key
```

### 3. Install & Run (2 min)
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend (new terminal)
cd frontend
npm install  
npm run dev
```

Open **http://localhost:3000** in your browser.

### 4. Test It
- Sign up: test@example.com / password123
- Answer: Founder, 1-5 people, "I want to streamline operations"
- See your personalized path!

---

## Project Structure

```
OnboardAI/
├── README.md                    # Full project documentation
├── SETUP.md                     # Detailed setup & testing
├── IMPLEMENTATION_NOTES.md      # Code walkthrough for developers
├── start-dev.bat/sh             # Scripts to start everything
│
├── backend/                     # Express + TypeScript
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── config/             # Database & environment config
│   │   ├── controllers/        # API endpoint logic
│   │   ├── models/             # Database operations
│   │   ├── services/           # OpenAI integration
│   │   ├── routes/             # API route definitions
│   │   └── middleware/         # Auth & error handling
│   ├── .env                    # Configuration (set your OpenAI key here)
│   └── package.json
│
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx             # Main component with routing
│   │   ├── pages/              # Signup, Login, Onboarding, Dashboard, Admin
│   │   ├── components/         # Reusable UI components
│   │   ├── services/           # API client
│   │   ├── context/            # Auth context/state
│   │   ├── types/              # TypeScript interfaces
│   │   └── styles/             # CSS files
│   ├── index.html              # HTML template
│   └── package.json
│
└── data/ (created automatically)
    └── onboard.db              # SQLite database
```

---

## Key Concepts

### User Flow
1. **Signup** → Create account (email + password)
2. **Onboarding** → Answer 3 questions about role/goals
3. **AI Classification** → OpenAI determines best path
4. **Dashboard** → See personalized checklist
5. **Admin** → View all users and their paths

### Tech Stack Choices
- **SQLite**: Self-contained, no external DB needed (perfect for POC)
- **JWT**: Stateless authentication, scalable
- **React Router**: Client-side routing, fast page changes
- **OpenAI API**: AI classification without building own ML model
- **TypeScript**: Type safety, catch bugs early

### Architecture Pattern
- **Controllers**: Handle HTTP requests
- **Services**: Business logic (AI scoring, etc.)
- **Models**: Database queries
- **Middleware**: Cross-cutting concerns (auth, errors)
- **Frontend Context**: Global state (auth)

---

## Important URLs

**While Running**:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/api/health

**User Paths** (once logged in):
- /signup → Create account
- /login → Sign in
- /onboarding → Answer profile questions
- /dashboard → See your path + checklist
- /admin → View all users

---

## Making Your First Change

### Change AI Scoring Logic
Edit `backend/src/services/aiService.ts`, function `scoreAndAssignPath()`. Change the prompt to be more strict, lenient, or consider different factors.

### Add New Onboarding Path
Edit `backend/src/models/OnboardingPath.ts`, add to `DEFAULT_PATHS` array:
```typescript
{
  user_type: 'Product Manager',
  name: 'Product Manager Onboarding',
  description: '...',
  checklist: [{ title: '...', description: '...' }, ...],
}
```

### Modify Database (add new user field)
Edit `backend/src/config/database.ts`:
1. Add column to CREATE TABLE statement
2. Update User.ts model
3. Delete `backend/data/onboard.db`
4. Restart backend (rebuilds DB)

### Change Frontend Styling
All CSS is in `frontend/src/styles/`. Pure CSS, no frameworks. Modify colors, spacing, fonts etc.

### Add Authentication Requirement
Wrap page in `<ProtectedRoute>` in `frontend/src/App.tsx`.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm install` in that folder |
| "Port 5000 in use" | Kill: `lsof -ti:5000 \| xargs kill -9` (mac/linux) |
| "OPENAI_API_KEY not found" | Create backend/.env, add your key |
| "Frontend won't load" | Check backend is running: `curl http://localhost:5000/api/health` |
| Wrong OpenAI model | Check `.env` and API key is valid |
| Database corrupted | Delete `backend/data/onboard.db`, restart backend |

---

## Documentation Files

- **README.md** - Complete overview, architecture, tech stack, API docs
- **SETUP.md** - Step-by-step setup, testing, curl examples
- **IMPLEMENTATION_NOTES.md** - Code walkthrough, design decisions, how-tos
- This file - Quick orientation

Pick based on what you need:
- _First time?_ → Start with this file, then SETUP.md
- _Making changes?_ → Read IMPLEMENTATION_NOTES.md
- _Need complete overview?_ → Read README.md
- _Testing API?_ → Look at SETUP.md

---

## Next Steps

### Immediate (If Keeping POC)
- [ ] Test all 3 user flows (signup, onboarding, login)
- [ ] Try all 5 predefined paths
- [ ] Check admin dashboard shows users
- [ ] Test with real OpenAI API

### Short Term (Validating Idea)
- [ ] Get real users to try it
- [ ] Collect feedback on paths
- [ ] Test AI classification accuracy
- [ ] Measure onboarding completion rates

### Medium Term (If Proven)
- [ ] Persist checklist completion in DB
- [ ] Add email verification
- [ ] Make paths customizable in UI
- [ ] Add analytics dashboard
- [ ] Switch to PostgreSQL

### Long Term (If Scaling)
- [ ] Add payment processing
- [ ] Multi-team/workspace support
- [ ] Custom path builder
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] API for partners

---

## Code Quality Notes

✅ **What's Done Well**:
- Full TypeScript typing (no `any` types)
- Centralized error handling
- Clean separation of concerns
- Extensive comments and docstrings
- SQLite auto-initialization
- JWT auth with bcrypt hashing
- Environment variable validation

⚠️ **What's Intentionally Simple** (for POC):
- No database migrations (delete DB to reset)
- No checklist persistence (UI only)
- No admin role checks (anyone logged in sees admin)
- No rate limiting
- No activity logging
- SQLite instead of PostgreSQL

🔐 **Security Before Production**:
- [ ] Change JWT_SECRET
- [ ] Add admin role checks
- [ ] Add rate limiting
- [ ] Switch to HTTPS
- [ ] Add input validation
- [ ] Add CORS restrictions

---

## Getting Help

### Error Messages
1. Check browser console (Frontend error details)
2. Check terminal output (Backend error details)
3. Search errors in IMPLEMENTATION_NOTES.md

### Code Questions
- IMPLEMENTATION_NOTES.md has detailed walkthrough of every file
- Each file has comments explaining what it does
- Git history shows changes and reasoning

### Feature Questions
- README.md explains all features and how they work
- SETUP.md shows API examples

---

## Fun Things to Try

1. **Change the AI prompt**: Make it assign paths based on different factors
2. **Add a new path**: "Consultant" path with different checklist
3. **Test error states**: Sign up with blank fields, see validation
4. **Use another AI model**: Switch from ChatGPT to Claude
5. **Add user preferences**: Let users pick their path instead of AI assigning
6. **Track completion**: Persist checklist state to database

---

## Quick Reference: Running Commands

```bash
# Development
cd backend && npm run dev      # Backend with auto-reload
cd frontend && npm run dev     # Frontend with hot reload

# Building
cd backend && npm run build    # Compile TS to JS
cd frontend && npm run build   # Create bundle for production

# Type checking
cd backend && npm run typecheck
cd frontend && npm run type-check

# Database reset (if corrupted)
rm backend/data/onboard.db     # Delete it
# Restart backend to auto-recreate

# Testing APIs
curl http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

---

## One More Thing

This is a **POC** - it's meant to validate the idea quickly, not be production-perfect. Some rough edges are intentional to save time. Once you know the idea works, you can add polish.

Key POC mindset:
- **Works** > Perfect
- **Fast** > Comprehensive
- **Simple** > Feature-rich
- **Learning** > Polish

Have fun! 🚀

---

**Need the full docs? Start with README.md**
