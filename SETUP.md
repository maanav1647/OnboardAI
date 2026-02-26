# Quick Setup Instructions

## Pre-Requirements
- Node.js 16+ installed
- OpenAI API key (free tier available at https://platform.openai.com)

## First Time Setup

### 1. Get OpenAI API Key
- Go to https://platform.openai.com/account/api-keys
- Create a new API key
- Copy it (you'll need it in the next step)

### 2. Backend Configuration
```bash
cd backend
cp .env.example .env
# Edit .env and replace OPENAI_API_KEY with your actual key
```

Example .env:
```
PORT=5000
NODE_ENV=development
DB_PATH=./data/onboard.db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=sk-proj-your-key-here
CORS_ORIGIN=http://localhost:3000
```

### 3. Frontend Configuration (Already Done)
```bash
cd frontend
# .env is already configured
```

## Running the Application

### Option 1: Two Terminal Windows (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Use Startup Script

**Windows:**
```bash
start-dev.bat
```

**macOS/Linux:**
```bash
bash start-dev.sh
```

### Option 3: Single Terminal with Background Processes

```bash
cd backend && npm run dev &
cd ../frontend && npm run dev
```

## Testing the App

### 1. Create Test Account
1. Go to http://localhost:3000
2. Click "Sign up"
3. Enter email: `test@example.com`
4. Password: `test123456`
5. Submit

### 2. Complete Onboarding
1. Answer the profile questions:
   - Role: Select "Founder"
   - Team size: Select "1-5 people"
   - Goal: "I want to streamline our entire business operations"
2. Submit → AI will assign you a path
3. See your personalized checklist

### 3. Login Again
1. Log out
2. Go to `/login`
3. Use same email/password
4. See your dashboard with the saved path

### 4. View Admin Dashboard
1. Go to http://localhost:3000/admin
2. See all users and their assigned paths

## API Testing with curl

```bash
# Health check
curl http://localhost:5000/api/health

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'

# Get current user (requires token from login response)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/auth/me

# Update profile
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role":"Sales Lead",
    "team_size":"6-20 people",
    "goal":"Improve our sales pipeline and team performance"
  }'
```

## Troubleshooting

### "Port 5000 already in use"
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows
```

### "Cannot find module 'openai'"
Run `npm install` again in the backend folder.

### Frontend can't reach backend
- Make sure backend is running on port 5000
- Check CORS_ORIGIN in backend/.env
- Check browser console for specific error

### Database errors
- Delete the `backend/data/onboard.db` file  
- Restart the backend to recreate the database

## Next: Making Code Changes

All source files are in:
- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`

Both projects use TypeScript and will automatically recompile on file save.

## Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

---

**Questions?** Check the main README.md for more details!
