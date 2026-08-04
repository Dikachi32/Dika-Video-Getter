#!/bin/bash

# DikachiVideo AI Studio — Startup Script FOR (macOS/Linux)
# Runs both backend and frontend servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Ports
BACKEND_PORT=8000
FRONTEND_PORT=3000

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null || true
    fi
}

# Print banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║           DikachiVideo AI Studio — Startup Script             ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo -e "${RED}ERROR: Python is not installed. Please install Python 3.10+${NC}"
    exit 1
fi
PYTHON_CMD=$(command -v python3 || command -v python)
echo -e "${GREEN}✓ Python found: $($PYTHON_CMD --version)${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}ERROR: FFmpeg is not installed. Please install FFmpeg 5.0+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ FFmpeg found: $(ffmpeg -version | head -n1 | awk '{print $3}')${NC}"

# Check directories
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}ERROR: Backend directory not found at $BACKEND_DIR${NC}"
    exit 1
fi
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}ERROR: Frontend directory not found at $FRONTEND_DIR${NC}"
    exit 1
fi

# Check virtual environment
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo -e "${YELLOW}Virtual environment not found. Creating one...${NC}"
    cd "$BACKEND_DIR"
    $PYTHON_CMD -m venv venv
fi

# Check backend dependencies
if [ ! -f "$BACKEND_DIR/venv/bin/uvicorn" ] && [ ! -f "$BACKEND_DIR/venv/bin/fastapi" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$BACKEND_DIR"
    source venv/bin/activate
    pip install -r requirements.txt
fi

# Check frontend dependencies
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$FRONTEND_DIR"
    npm install
fi

# Check .env file
if [ ! -f "$BACKEND_DIR/.env" ]; then
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        echo -e "${YELLOW}Creating .env from example...${NC}"
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    fi
fi

# Initialize database if needed
if [ ! -f "$BACKEND_DIR/data/dikachivideo.db" ]; then
    echo -e "${YELLOW}Initializing database...${NC}"
    cd "$BACKEND_DIR"
    source venv/bin/activate
    mkdir -p data
    python -c "from app.database import init_db; init_db()" 2>/dev/null || true
fi

# Kill existing processes on ports
echo -e "${BLUE}Checking for existing processes...${NC}"
if check_port $BACKEND_PORT; then
    kill_port $BACKEND_PORT
fi
if check_port $FRONTEND_PORT; then
    kill_port $FRONTEND_PORT
fi

# Start backend
echo -e "${BLUE}Starting backend server on port $BACKEND_PORT...${NC}"
cd "$BACKEND_DIR"
source venv/bin/activate
python run.py &
BACKEND_PID=$!

# Wait for backend to be ready
echo -e "${YELLOW}Waiting for backend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is ready${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}WARNING: Backend may not have started correctly${NC}"
    fi
done

# Start frontend
echo -e "${BLUE}Starting frontend server on port $FRONTEND_PORT...${NC}"
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend
echo -e "${YELLOW}Waiting for frontend to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Frontend is ready${NC}"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}WARNING: Frontend may not have started correctly${NC}"
    fi
done

# Print success message
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║              DikachiVideo AI Studio is Running!               ║"
echo "║                                                               ║"
echo "║   🌐 Frontend: http://localhost:3000                          ║"
echo "║   🔌 Backend:  http://localhost:8000                          ║"
echo "║   📖 API Docs: http://localhost:8000/docs                     ║"
echo "║                                                               ║"
echo "║   Press Ctrl+C to stop both servers                           ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Handle shutdown
cleanup() {
    echo -e "${YELLOW}\nShutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    echo -e "${GREEN}Servers stopped.${NC}"
    exit 0
}
trap cleanup INT TERM

# Keep script running
wait