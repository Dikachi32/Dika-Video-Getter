Installation Guide
Complete step-by-step installation for DikachiVideo AI Studio.
Quick Start (Recommended)
If you already have Python 3.10+, Node.js 18+, and FFmpeg installed:
bash
# 1. Clone repository
git clone https://github.com/yourusername/dikachivideo-ai-studio.git
cd dikachivideo-ai-studio

# 2. Set up backend
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# 3. Set up frontend (new terminal)
cd ../frontend
npm install

# 4. Start both servers
# Terminal 1: cd backend && python run.py
# Terminal 2: cd frontend && npm run dev
# Or use: ./start.sh (macOS/Linux) or start.bat (Windows)
Then open http://localhost:3000
Detailed Installation
Windows
Step 1: Install Python
Go to https://www.python.org/downloads/windows/
Download Python 3.12.x (64-bit)
Run installer
CRITICAL: Check "Add Python to PATH" at the bottom
Check "Install pip"
Click "Install Now"
Verify in Command Prompt:
cmd
python --version
# Should show Python 3.12.x
Step 2: Install Node.js
Go to https://nodejs.org/
Download LTS version (v20.x)
Run installer with default settings
Verify:
cmd
node --version
npm --version
Step 3: Install FFmpeg
Method A — Chocolatey (Easiest):
Open PowerShell as Administrator
Install Chocolatey:
powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
Install FFmpeg:
powershell
choco install ffmpeg
Method B — Manual:
Download from https://www.gyan.dev/ffmpeg/builds/
Download ffmpeg-release-essentials.zip
Extract to C:\ffmpeg
Add C:\ffmpeg\bin to System PATH:
Win + R → sysdm.cpl → Advanced → Environment Variables
Under "System variables", find "Path" → Edit → New
Add C:\ffmpeg\bin
OK all windows
Restart Command Prompt
Verify:
cmd
ffmpeg -version
Step 4: Install Git (if not installed)
powershell
choco install git
# Or download from https://git-scm.com/download/win
Step 5: Clone and Set Up
cmd
git clone https://github.com/yourusername/dikachivideo-ai-studio.git
cd dikachivideo-ai-studio

:: Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

:: Frontend (new Command Prompt)
cd ..\frontend
npm install
Step 6: Start Application
cmd
:: Terminal 1 - Backend
cd backend
venv\Scripts\activate
python run.py

:: Terminal 2 - Frontend
cd frontend
npm run dev
Or use the startup script:
cmd
cd dikachivideo-ai-studio
start.bat
macOS
Step 1: Install Homebrew
bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
Step 2: Install Python, Node.js, FFmpeg
bash
brew install python@3.12 node@20 ffmpeg
Step 3: Verify Installations
bash
python3 --version    # 3.12.x
node --version       # v20.x
ffmpeg -version      # 5.0+
Step 4: Clone and Set Up
bash
git clone https://github.com/yourusername/dikachivideo-ai-studio.git
cd dikachivideo-ai-studio

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Frontend (new terminal)
cd ../frontend
npm install
Step 5: Start Application
bash
# Terminal 1
cd backend && source venv/bin/activate && python run.py

# Terminal 2
cd frontend && npm run dev

# Or use startup script
cd dikachivideo-ai-studio && ./start.sh
Linux (Ubuntu/Debian)
Step 1: Update System
bash
sudo apt update && sudo apt upgrade -y
Step 2: Install Python
bash
sudo apt install python3.12 python3.12-venv python3.12-dev python3-pip -y
python3.12 --version
Step 3: Install Node.js
bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
Step 4: Install FFmpeg
bash
sudo apt install ffmpeg -y
ffmpeg -version
Step 5: Install Git
bash
sudo apt install git -y
Step 6: Clone and Set Up
bash
git clone https://github.com/yourusername/dikachivideo-ai-studio.git
cd dikachivideo-ai-studio

# Backend
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Frontend (new terminal)
cd ../frontend
npm install
Step 7: Start Application
bash
# Terminal 1
cd backend && source venv/bin/activate && python run.py

# Terminal 2
cd frontend && npm run dev

# Or use startup script
cd dikachivideo-ai-studio && ./start.sh
Post-Installation
Configure API Keys (Optional)
Open http://localhost:3000/settings
Go to "API Keys" tab
Enter your keys:
OpenAI: Get from https://platform.openai.com/api-keys
ElevenLabs: Get from https://elevenlabs.io/app/settings/api-keys
Settings auto-save to database
Verify Everything Works
Open http://localhost:3000
Click "New Project"
Enter name and prompt
Click through the workflow steps
If Cloud Mode is configured, generation will use APIs
If only Local Mode, install models (see README.md)
Common Issues
"python" command not found (Windows)
Use py instead of python, or add Python to PATH manually.
"npm" command not found
Restart your terminal after installing Node.js.
"ffmpeg" command not found
Restart terminal after adding to PATH. On Windows, you may need to log out and back in.
Port 8000 or 3000 already in use
bash
# macOS/Linux
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
Permission denied (Linux/macOS)
bash
chmod +x start.sh
Next Steps
Read the First Video Walkthrough
Learn about Local AI Models
Review Troubleshooting