"""DikachiVideo AI Studio - FastAPI Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import init_db
from app.config import settings
from app.services.ai_engine_manager import engine_manager
from app.routers import (
    projects_router,
    ai_engines_router,
    video_router,
    voice_router,
    subtitles_router,
    music_router,
    thumbnails_router,
    settings_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Initialize database
    init_db()
    print("Database initialized")

    # Initialize AI engines
    await engine_manager.initialize()
    print("AI Engine Manager initialized")

    # Ensure directories exist
    settings.PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
    settings.OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    os.makedirs("data", exist_ok=True)

    print(f"Projects dir: {settings.PROJECTS_DIR}")
    print(f"Outputs dir: {settings.OUTPUTS_DIR}")
    print(f"Models dir: {settings.MODELS_DIR}")

    yield

    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Personal AI Video Studio - Local First, Cloud Optional",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for outputs
os.makedirs(settings.OUTPUTS_DIR, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=str(settings.OUTPUTS_DIR)), name="outputs")

# Register routers
app.include_router(projects_router)
app.include_router(ai_engines_router)
app.include_router(video_router)
app.include_router(voice_router)
app.include_router(subtitles_router)
app.include_router(music_router)
app.include_router(thumbnails_router)
app.include_router(settings_router)

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "mode": engine_manager.mode.value,
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected",
        "engines": engine_manager.get_status(),
    }