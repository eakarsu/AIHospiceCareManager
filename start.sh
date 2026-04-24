#!/bin/bash

echo "============================================"
echo "  AI Hospice Care Manager - Startup Script  "
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Kill any process on ports 3000 and 3001
echo -e "${YELLOW}Cleaning up used ports...${NC}"
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null && echo -e "${GREEN}  Freed port 3000${NC}" || echo "  Port 3000 is free"
lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null && echo -e "${GREEN}  Freed port 3001${NC}" || echo "  Port 3001 is free"
echo ""

# Check for .env file
if [ ! -f .env ]; then
  echo -e "${RED}ERROR: .env file not found!${NC}"
  echo "Please create a .env file with the following variables:"
  echo "  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hospice_care"
  echo "  OPENROUTER_API_KEY=your_key_here"
  echo "  OPENROUTER_MODEL=anthropic/claude-haiku-4.5"
  echo "  JWT_SECRET=hospice-care-jwt-secret-2024"
  echo "  PORT=3001"
  exit 1
fi

# Check PostgreSQL
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${RED}PostgreSQL is not installed!${NC}"
  exit 1
fi

# Check if PostgreSQL is running
pg_isready -q 2>/dev/null
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Starting PostgreSQL...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
  sleep 2
fi
echo -e "${GREEN}  PostgreSQL is running${NC}"

# Create database if it doesn't exist
echo -e "${BLUE}Setting up database...${NC}"
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'hospice_care'" 2>/dev/null | grep -q 1 || \
  createdb -U postgres hospice_care 2>/dev/null || \
  psql -tc "SELECT 1 FROM pg_database WHERE datname = 'hospice_care'" 2>/dev/null | grep -q 1 || \
  createdb hospice_care 2>/dev/null
echo -e "${GREEN}  Database ready${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}Installing server dependencies...${NC}"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}  Server dependencies installed${NC}"

echo -e "${BLUE}Installing client dependencies...${NC}"
cd client && npm install --silent 2>&1 | tail -1 && cd ..
echo -e "${GREEN}  Client dependencies installed${NC}"
echo ""

# Seed database
echo -e "${BLUE}Seeding database with sample data...${NC}"
node server/seeds/seed.js
echo ""

# Start the application with hot-reload
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Starting AI Hospice Care Manager${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "  ${BLUE}Backend:${NC}  http://localhost:3001 (with nodemon hot-reload)"
echo -e "  ${BLUE}Frontend:${NC} http://localhost:3000 (with React hot-reload)"
echo ""
echo -e "  ${YELLOW}Login:${NC} admin@hospice.com / password123"
echo -e "  ${YELLOW}Quick Login:${NC} Click 'Auto-fill Admin Credentials' button"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Start both server (with nodemon) and client (with react-scripts)
npx concurrently \
  --names "SERVER,CLIENT" \
  --prefix-colors "blue,green" \
  "npx nodemon server/index.js" \
  "cd client && PORT=3000 npx react-scripts start"
