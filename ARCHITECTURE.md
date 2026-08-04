DikachiVideo AI Studio — Architecture Documentation
Overview
DikachiVideo AI Studio is a full-stack desktop web application designed for personal AI video generation. It follows a clean, modular architecture with clear separation of concerns between the frontend, backend, and AI processing layers.
System Architecture
plain
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Dashboard  │  │   Studio    │  │       Settings          │  │
│  │  (Next.js)  │  │  (Next.js)  │  │      (Next.js)          │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│         └────────────────┴──────────────────────┘                │
│                          │                                       │
│                   ┌──────┴──────┐                                │
│                   │  API Client │                                │
│                   │   (lib/api) │                                │
│                   └──────┬──────┘                                │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTP /api/proxy/*
┌──────────────────────────┼──────────────────────────────────────┐
│                     FASTAPI BACKEND                             │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                    API ROUTER LAYER                        │  │
│  │  /projects  /video  /voice  /subtitles  /music  /thumbs  │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                   SERVICE LAYER                            │  │
│  │  AIEngineManager  VideoProcessor  VoiceSynthesizer        │  │
│  │  SubtitleGenerator  MusicGenerator  ThumbnailGenerator    │  │
│  └───────────────────────┬───────────────────────────────────┘  │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                   ENGINE LAYER                             │  │
│  │  ┌──────────────┐        ┌─────────────────────────────┐  │  │
│  │  │ LOCAL MODE   │        │ CLOUD MODE                  │  │  │
│  │  │ CogVideoX    │        │ OpenAI GPT-4 / Sora         │  │  │
│  │  │ Stable Video │        │ ElevenLabs Voice            │  │  │
│  │  │ Coqui TTS    │        │ DALL-E 3                    │  │  │
│  │  │ MusicGen     │        │ Suno API                    │  │  │
│  │  │ Whisper      │        │                             │  │  │
│  │  └──────────────┘        └─────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────────────────┐  │
│  │                   DATA LAYER                               │  │
│  │  SQLite (Projects, Settings, Media)                        │  │
│  │  Local Filesystem (Videos, Audio, Images, Subtitles)       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
Design Principles
1. Local-First Architecture
All core functionality works without internet connection
Cloud APIs are strictly optional enhancements
Data never leaves your machine unless explicitly configured
2. Modular Engine System
Engines implement a common BaseEngine interface
New engines can be added without modifying existing code
Engine selection is transparent to the user via Auto Mode
3. Clean Separation
Routers handle HTTP concerns only
Services contain business logic
Engines encapsulate AI model interactions
Utils provide cross-cutting concerns
4. Type Safety
Full TypeScript coverage on frontend
Pydantic models for all API contracts
Strict typing prevents runtime errors
Data Flow
Video Generation Workflow
plain
User Prompt
    │
    ▼
┌─────────────┐
│ AI Engine   │──→ Script Generation (GPT-4 / Local LLM)
│ Manager     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Scene       │──→ Scene Breakdown (AI parsing)
│ Generator   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Per-Scene   │──→ │   Voice     │──→ │  Subtitle   │
│ Video Gen   │     │  Synthesis  │     │  Generation │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  FFmpeg     │──→ │   Export    │
│  Assembly   │     │    MP4      │
└─────────────┘     └─────────────┘
Database Schema
Projects Table
sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    prompt TEXT,
    script TEXT,
    status TEXT DEFAULT 'draft',
    video_duration INTEGER DEFAULT 15,
    resolution TEXT DEFAULT '1080x1920',
    subtitle_style TEXT DEFAULT 'modern-yellow',
    voice_id TEXT DEFAULT 'alloy',
    output_video_path TEXT,
    output_thumbnail_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Scenes Table
sql
CREATE TABLE scenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    order INTEGER NOT NULL,
    description TEXT NOT NULL,
    script_text TEXT,
    duration INTEGER DEFAULT 5,
    image_path TEXT,
    video_path TEXT,
    voice_path TEXT,
    start_time REAL DEFAULT 0,
    end_time REAL DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
Settings Table
sql
CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Frontend Architecture
Component Hierarchy
plain
app/
├── layout.tsx              # Root layout (ToastProvider, dark mode)
├── globals.css             # CSS variables, custom utilities
├── page.tsx                # Dashboard page
├── settings/
│   └── page.tsx            # Settings with Tabs
└── studio/[projectId]/
    └── page.tsx            # Studio workspace

components/
├── ui/                     # Primitive components (no business logic)
│   ├── Button.tsx          # Variants: default, secondary, ghost, destructive
│   ├── Card.tsx            # Composable: Header, Title, Content, Footer
│   ├── Modal.tsx           # Radix Dialog wrapper with animations
│   ├── Toast.tsx           # Zustand-based notification system
│   ├── Skeleton.tsx        # Loading placeholders
│   ├── Badge.tsx           # Status indicators
│   ├── Select.tsx          # Accessible dropdown
│   └── Tabs.tsx            # Content switching
│
├── layout/                 # App shell components
│   ├── Sidebar.tsx         # Navigation, engine status
│   └── Header.tsx          # Top bar, user actions
│
├── dashboard/              # Dashboard-specific
│   ├── ProjectCard.tsx     # Project card with actions
│   ├── EmptyState.tsx      # No projects illustration
│   ├── CreateProjectModal.tsx
│   └── DeleteConfirmModal.tsx
│
├── studio/                 # Studio workflow panels
│   ├── PromptInput.tsx     # Prompt + script generation
│   ├── SceneEditor.tsx     # Scene CRUD + video gen
│   ├── VideoPanel.tsx      # Per-scene video generation
│   ├── VoicePanel.tsx      # Voice synthesis
│   ├── MusicPanel.tsx      # Background music
│   ├── SubtitlePanel.tsx   # Subtitle generation
│   ├── ThumbnailPanel.tsx  # Thumbnail AI/extract
│   ├── PreviewWindow.tsx   # Video player with controls
│   └── WorkflowTimeline.tsx # 10-step progress tracker
│
└── settings/               # Settings forms
    ├── ApiKeySettings.tsx
    ├── OutputSettings.tsx
    └── VoiceSettings.tsx
State Management
Table
State Type	Solution	Purpose
Global UI	Zustand (Toast store)	Notifications across app
Server Data	React Query pattern (useApi hook)	API caching, loading states
Local UI	useState/useReducer	Component-level state
Form State	Controlled inputs	Settings, project creation
API Client Pattern
TypeScript
// lib/api.ts — Centralized API client
const API_BASE = "/api";

async function fetchApi(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}/${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown" }));
    throw new Error(error.detail || error.error || `HTTP ${response.status}`);
  }
  return response.json();
}
Backend Architecture
Router Pattern
Each domain has its own router with consistent patterns:
Python
# routers/video.py
@router.post("/generate-script")
async def generate_script(request: ScriptRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    script = await VideoProcessor.generate_script(request.prompt)
    project.script = script
    project.status = ProjectStatus.SCRIPT_GENERATED
    db.commit()

    return {"script": script, "project_id": request.project_id}
Service Layer
Services encapsulate business logic and orchestrate engines:
Python
# services/ai_engine_manager.py
class AIEngineManager:
    def __init__(self):
        self.engines: Dict[str, BaseEngine] = {}
        self.mode = EngineMode.AUTO

    async def generate(self, capability: str, params: dict) -> dict:
        engine = self._select_engine(capability)
        return await engine.generate(params)

    def _select_engine(self, capability: str) -> BaseEngine:
        if self.mode == EngineMode.LOCAL:
            return self._get_local_engine(capability)
        elif self.mode == EngineMode.CLOUD:
            return self._get_cloud_engine(capability)
        else:  # AUTO
            local = self._get_local_engine(capability)
            if local.is_available():
                return local
            return self._get_cloud_engine(capability)
Engine Interface
Python
# engines/base.py
from abc import ABC, abstractmethod
from enum import Enum

class EngineCapability(Enum):
    TEXT_TO_VIDEO = "text_to_video"
    IMAGE_TO_VIDEO = "image_to_video"
    VOICE = "voice"
    MUSIC = "music"
    SUBTITLE = "subtitle"
    THUMBNAIL = "thumbnail"

class BaseEngine(ABC):
    @property
    @abstractmethod
    def name(self) -> str: ...

    @property
    @abstractmethod
    def capabilities(self) -> list[EngineCapability]: ...

    @abstractmethod
    def is_available(self) -> bool: ...

    @abstractmethod
    async def generate(self, params: dict) -> dict: ...
File Storage
plain
output/
└── projects/
    └── {project_id}/
        ├── scenes/
        │   ├── scene_1_video.mp4
        │   ├── scene_2_video.mp4
        │   └── ...
        ├── voice/
        │   └── voiceover.mp3
        ├── music/
        │   └── background.mp3
        ├── subtitles/
        │   └── subtitles.srt
        ├── thumbnails/
        │   └── thumbnail.png
        ├── final_video.mp4
        └── export_high.mp4
Security Considerations
API Keys: Stored in SQLite, never exposed to frontend
File Access: All media served through /api/media with path validation
CORS: Configured for localhost only
Input Validation: Pydantic models validate all inputs
SQL Injection: SQLAlchemy ORM prevents injection attacks
Performance Optimizations
Lazy Loading: Studio panels load on demand
Skeleton Screens: Perceived performance during data fetching
Video Previews: Lazy-loaded with preload="metadata"
Debounced Search: Dashboard search uses 300ms debounce
Connection Pooling: SQLite with connection pooling
FFmpeg Hardware Acceleration: NVENC/AMF when available
Extension Points
Adding a New Engine
Create engine class in engines/local/ or engines/cloud/
Inherit from BaseEngine
Implement is_available() and generate()
Register in AIEngineManager
Adding a New Workflow Step
Add step to WorkflowStep type in types/index.ts
Add icon and label to WorkflowTimeline
Add panel component in components/studio/
Add API endpoint in backend router
Adding a New Setting
Add to AppSettings type
Add form field in settings component
Add database migration if needed
Wire up in API client