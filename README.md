DikachiVideo AI Studio
Personal AI Video Studio — Local First, Cloud Optional
A complete, production-quality desktop web application for generating professional AI videos. Runs entirely on your local machine with optional cloud API integration for enhanced quality.
Table of Contents
Features
Architecture
Prerequisites
Installation
Configuration
First Video Walkthrough
Local AI Models
Troubleshooting
Project Structure
API Reference
License
Features
Table
Feature	Local Mode	Cloud Mode	Description
Text to Video	CogVideoX	OpenAI Sora	Generate video from text prompts
Image to Video	Stable Video Diffusion	Runway	Animate static images
AI Voice	Coqui TTS	ElevenLabs	Natural-sounding voiceovers
Subtitle Generation	Whisper	OpenAI Whisper API	Auto-generate synchronized subtitles
Background Music	MusicGen	Suno API	AI-generated background tracks
Thumbnail Generation	Stable Diffusion	DALL-E 3	Eye-catching video thumbnails
Export MP4	FFmpeg	—	Professional-quality video export
AI Engine Manager
The heart of the application. Every request passes through the AI Engine Manager which intelligently routes to:
Local Mode — Open-source models running on your GPU/CPU
Cloud Mode — Commercial APIs (OpenAI, ElevenLabs, etc.)
Auto Mode — Tries Local first, falls back to Cloud
Architecture
plain
DikachiVideo AI Studio
├── Backend (FastAPI + Python)
│   ├── AI Engine Manager
│   │   ├── Local Engines
│   │   │   ├── Text-to-Video (CogVideoX)
│   │   │   ├── Image-to-Video (Stable Video)
│   │   │   └── Voice (Coqui TTS)
│   │   └── Cloud Engines
│   │       ├── OpenAI (GPT-4, DALL-E, TTS)
│   │       └── ElevenLabs (Voice)
│   ├── Video Processor (FFmpeg)
│   ├── Subtitle Generator
│   ├── Music Generator
│   ├── Thumbnail Generator
│   └── SQLite Database
│
└── Frontend (Next.js 14 + React + TypeScript)
    ├── Dashboard
    ├── Studio (10-Step Workflow)
    ├── Settings
    └── UI Component Library
Tech Stack
Table
Layer	Technology
Frontend	Next.js 14, React 18, TypeScript, Tailwind CSS
Backend	FastAPI, Python 3.10+, SQLAlchemy
Database	SQLite
Video Processing	FFmpeg
State Management	Zustand
UI Primitives	Radix UI
Styling	Tailwind CSS + Custom CSS Variables
Prerequisites
Before installing DikachiVideo AI Studio, ensure your system meets these requirements:
Minimum Requirements
OS: Windows 10/11, macOS 12+, or Linux (Ubuntu 20.04+)
RAM: 8 GB minimum (16 GB recommended)
Storage: 10 GB free space (50+ GB for local models)
GPU: Optional but strongly recommended (NVIDIA with CUDA 11.8+)
Python: 3.10 or higher
Node.js: 18 LTS or higher
FFmpeg: 5.0 or higher
Check Your System
Open a terminal and run:
bash
# Check Python
python --version        # Should be 3.10+

# Check Node.js
node --version          # Should be v18+
npm --version           # Should be 9+

# Check FFmpeg
ffmpeg -version         # Should show version 5.0+
If any command fails or shows an outdated version, follow the installation steps below.
Installation
Step 1: Install Python
Windows:
Download Python 3.12 from python.org
Run the installer
IMPORTANT: Check "Add Python to PATH" during installation
Verify: python --version
macOS:
bash
# Using Homebrew (recommended)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install python@3.12

# Verify
python3 --version
Linux (Ubuntu/Debian):
bash
sudo apt update
sudo apt install python3.12 python3.12-venv python3.12-dev python3-pip

# Verify
python3.12 --version
Step 2: Install Node.js
Windows:
Download LTS from nodejs.org
Run the installer
Verify: node --version
macOS:
bash
brew install node@20
Linux:
bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
Step 3: Install FFmpeg
FFmpeg is required for all video processing operations.
Windows (via Chocolatey — easiest):
powershell
# Install Chocolatey first (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install FFmpeg
choco install ffmpeg

# Verify
ffmpeg -version
Windows (Manual):
Download from gyan.dev
Extract to C:\ffmpeg
Add C:\ffmpeg\bin to your System PATH
Restart terminal and verify: ffmpeg -version
macOS:
bash
brew install ffmpeg
ffmpeg -version
Linux (Ubuntu/Debian):
bash
sudo apt update
sudo apt install ffmpeg
ffmpeg -version
Linux (Fedora):
bash
sudo dnf install ffmpeg
ffmpeg -version
Step 4: Clone the Repository
bash
git clone https://github.com/yourusername/dikachivideo-ai-studio.git
cd dikachivideo-ai-studio
Step 5: Set Up Backend
bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; print(fastapi.__version__)"
Step 6: Set Up Frontend
bash
# Navigate to frontend (in a new terminal)
cd frontend

# Install dependencies
npm install

# Verify installation
npm run dev
Step 7: Configure Environment Variables
bash
# In the backend directory
cp .env.example .env
Edit .env with your preferred text editor:
env
# Backend Configuration
APP_NAME=DikachiVideo AI Studio
DEBUG=false
DATABASE_URL=sqlite:///./data/dikachivideo.db
OUTPUT_DIR=./output

# API Keys (Optional — for Cloud Mode)
OPENAI_API_KEY=sk-your-openai-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here

# Local Model Paths (Optional — will auto-download if not set)
COGVIDEOX_PATH=
STABLE_VIDEO_PATH=
COQUI_TTS_PATH=
MUSICGEN_PATH=
Step 8: Initialize Database
bash
# In backend directory with venv activated
python -c "from app.database import init_db; init_db()"
Step 9: Start the Application
Option A: Manual Start (Two Terminals)
Terminal 1 — Backend:
bash
cd backend
py -3.11 -m venv venv
venv\Scripts\activate 
python run.py
# Backend running at http://localhost:8000
Terminal 2 — Frontend:
bash
cd frontend
npm run dev
# Frontend running at http://localhost:3000
Option B: Single Command (Using Startup Script)
bash
# From project root
./start.sh      # macOS/Linux
start.bat       # Windows
Open your browser and navigate to http://localhost:3000
Configuration
Settings Page
All settings are managed through the in-app Settings page (http://localhost:3000/settings):
Table
Tab	Settings
API Keys	OpenAI API Key, ElevenLabs API Key
Output	Resolution (1080x1920, 1920x1080), Output Folder, Default Duration
Voice	Default Voice ID, Voice Preference
Settings are automatically saved to the SQLite database.
Environment Variables
Table
Variable	Required	Description
OPENAI_API_KEY	No	For Cloud Mode (GPT-4, DALL-E, TTS)
ELEVENLABS_API_KEY	No	For Cloud Mode voice generation
DATABASE_URL	Yes	SQLite database path
OUTPUT_DIR	Yes	Where generated files are saved
First Video Walkthrough
Follow these steps to create your first AI video:
1. Create a Project
Open http://localhost:3000
Click "New Project"
Enter:
Name: "My First AI Video"
Prompt: "A motivational video about perseverance with dramatic mountain scenery"
Click "Create Project"
2. Generate Script
In the Studio, review your prompt
Click "Generate Script"
The AI will create a complete script with scene breakdowns
Review and edit the generated script if needed
3. Generate Scenes
The AI automatically generates scenes from your script
Each scene includes:
Description
Duration
Script text for narration
Edit any scene by clicking the expand arrow
4. Generate Scene Videos
In the Scene Videos panel, click "Generate All" or generate individually
Each scene gets its own AI-generated video
Preview videos directly in the panel
5. Generate Voiceover
Open the AI Voice panel
Select a voice (Alloy, Nova, Shimmer, etc.)
Click "Generate Voiceover"
Preview the generated audio
6. Generate Subtitles
Open the Subtitles panel
Choose a style (Modern Yellow, Classic White, etc.)
Click "Generate Subtitles"
Preview the subtitle style
7. Generate Background Music
Open the Background Music panel
Select a preset or enter custom description
Click "Generate Music"
Preview the audio track
8. Generate Thumbnail
Open the Thumbnail panel
Enter a description or use a preset
Click "Generate Thumbnail"
Download or regenerate as needed
9. Assemble Video
Click "Assemble Video"
The system merges all components:
Scene videos
Voiceover
Background music
Subtitles
Wait for processing to complete
10. Export MP4
Click "Export MP4"
Choose quality (High recommended)
The final video is saved to your output folder
Download from the preview window
Local AI Models
Downloading Models
Local models are optional. The application works without them using Cloud Mode. To use Local Mode, download these models:
CogVideoX (Text-to-Video)
bash
# Install from Hugging Face
pip install git+https://github.com/THUDM/CogVideo.git

# Download model (requires ~20GB disk space)
# The application will auto-download on first use if configured
Stable Video Diffusion (Image-to-Video)
bash
# Install
pip install stable-video-diffusion

# Download checkpoint (~10GB)
# Auto-downloaded on first use
Coqui TTS (Voice)
bash
# Install
pip install TTS

# Download models (~2GB)
# Auto-downloaded on first use
MusicGen (Background Music)
bash
# Install
pip install audiocraft

# Download model (~4GB)
# Auto-downloaded on first use
Model Storage
Models are cached in:
Windows: %USERPROFILE%\.cache\dikachivideo\
macOS/Linux: ~/.cache/dikachivideo/
You can change this in Settings.
Troubleshooting
Backend Won't Start
Problem: ModuleNotFoundError when running python run.py
Solution:
bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate    # Windows

# Reinstall dependencies
pip install -r requirements.txt
FFmpeg Not Found
Problem: ffmpeg not found error
Solution:
bash
# Verify installation
ffmpeg -version

# If not found, reinstall and ensure PATH is set
# Windows: Restart terminal after adding to PATH
# macOS/Linux: source ~/.bashrc or restart terminal
Frontend Build Errors
Problem: Cannot find module or TypeScript errors
Solution:
bash
cd frontend

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
API Connection Failed
Problem: Frontend shows "Connection error"
Solution:
Ensure backend is running on port 8000
Check frontend/lib/api.ts — base URL should be /api
Verify the API proxy route exists at frontend/app/api/proxy/[[...path]]/route.ts
Check browser console for CORS errors
CUDA Out of Memory (Local Models)
Problem: CUDA out of memory when generating videos
Solution:
Reduce batch size in settings
Use smaller resolution (720p instead of 1080p)
Close other GPU-intensive applications
Use CPU mode (slower but works on any hardware)
Cloud API Errors
Problem: 401 Unauthorized or rate limit errors
Solution:
Verify API keys in Settings
Check API key validity on provider dashboard
For OpenAI: Ensure billing is enabled
For ElevenLabs: Check subscription tier limits
Database Locked
Problem: database is locked error
Solution:
bash
# Stop all backend processes
# Delete the lock file (if exists)
rm backend/data/*.db-journal

# Restart backend
python run.py
Port Already in Use
Problem: Address already in use for port 8000 or 3000
Solution:
bash
# Find and kill process on port 8000
# macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
Project Structure
plain
dikachivideo-ai-studio/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entry
│   │   ├── config.py               # Configuration management
│   │   ├── database.py             # SQLite database setup
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── project.py
│   │   │   ├── settings.py
│   │   │   └── media.py
│   │   ├── routers/                # API endpoints
│   │   │   ├── projects.py
│   │   │   ├── ai_engines.py
│   │   │   ├── video.py
│   │   │   ├── voice.py
│   │   │   ├── subtitles.py
│   │   │   ├── music.py
│   │   │   ├── thumbnails.py
│   │   │   └── settings.py
│   │   ├── services/               # Business logic
│   │   │   ├── ai_engine_manager.py
│   │   │   ├── video_processor.py
│   │   │   ├── voice_synthesizer.py
│   │   │   ├── subtitle_generator.py
│   │   │   ├── music_generator.py
│   │   │   └── thumbnail_generator.py
│   │   ├── engines/                # AI engine implementations
│   │   │   ├── base.py
│   │   │   ├── local/              # Open-source models
│   │   │   │   ├── text_to_video.py
│   │   │   │   ├── image_to_video.py
│   │   │   │   └── voice.py
│   │   │   └── cloud/              # Commercial APIs
│   │   │       ├── openai_engine.py
│   │   │       └── elevenlabs_engine.py
│   │   └── utils/                  # Utilities
│   │       ├── ffmpeg.py
│   │       └── file_manager.py
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
│
├── frontend/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout with ToastProvider
│   │   ├── globals.css             # Global styles & CSS variables
│   │   ├── page.tsx                # Dashboard
│   │   ├── settings/page.tsx       # Settings page
│   │   ├── studio/[projectId]/     # Studio workspace
│   │   │   └── page.tsx
│   │   └── api/proxy/[[...path]]/  # API proxy to backend
│   │       └── route.ts
│   ├── components/
│   │   ├── ui/                     # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Tabs.tsx
│   │   ├── layout/                 # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── dashboard/              # Dashboard components
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── CreateProjectModal.tsx
│   │   │   └── DeleteConfirmModal.tsx
│   │   ├── studio/                 # Studio workflow panels
│   │   │   ├── PromptInput.tsx
│   │   │   ├── SceneEditor.tsx
│   │   │   ├── VideoPanel.tsx
│   │   │   ├── VoicePanel.tsx
│   │   │   ├── MusicPanel.tsx
│   │   │   ├── SubtitlePanel.tsx
│   │   │   ├── ThumbnailPanel.tsx
│   │   │   ├── PreviewWindow.tsx
│   │   │   └── WorkflowTimeline.tsx
│   │   └── settings/               # Settings components
│   │       ├── ApiKeySettings.tsx
│   │       ├── OutputSettings.tsx
│   │       └── VoiceSettings.tsx
│   ├── hooks/                      # Custom React hooks
│   │   ├── useApi.ts
│   │   ├── useProjects.ts
│   │   └── useToast.ts
│   ├── lib/                        # Utilities
│   │   ├── api.ts                  # API client
│   │   └── utils.ts                # Helper functions
│   ├── types/                      # TypeScript types
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── next.config.js
│   └── next-env.d.ts
│
├── start.sh                        # macOS/Linux startup script
├── start.bat                       # Windows startup script
└── README.md                       # This file
API Reference
Projects
Table
Method	Endpoint	Description
GET	/api/projects/	List all projects
GET	/api/projects/{id}	Get project by ID
POST	/api/projects/	Create new project
PUT	/api/projects/{id}	Update project
DELETE	/api/projects/{id}	Delete project
GET	/api/projects/{id}/scenes	Get project scenes
Video
Table
Method	Endpoint	Description
POST	/api/video/generate-script	Generate script from prompt
POST	/api/video/generate-scenes	Generate scenes from script
POST	/api/video/generate-scene-video	Generate video for a scene
POST	/api/video/assemble	Assemble final video
POST	/api/video/export	Export as MP4
AI Engines
Table
Method	Endpoint	Description
GET	/api/ai-engines/status	Get engine status
POST	/api/ai-engines/mode	Set engine mode
GET	/api/ai-engines/capabilities	List capabilities
POST	/api/ai-engines/generate	Generate with engine
License
MIT License — Personal use only. This is not a SaaS product.
Support
For issues, questions, or contributions, please refer to the project repository.
Built with passion for creators who want AI video generation without dependency on external services.