#!/bin/bash
# OnboardAI Development Startup Script

echo "🚀 Starting OnboardAI (full-stack POC)"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start backend
echo -e "${BLUE}Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo -e "${BLUE}Starting frontend server...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

sleep 2

echo ""
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo ""
echo "To stop, press Ctrl+C or:"
echo "  kill $BACKEND_PID"
echo "  kill $FRONTEND_PID"
echo ""

# Wait for both processes
wait
