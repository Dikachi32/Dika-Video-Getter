"""API routers."""
from app.routers.projects import router as projects_router
from app.routers.ai_engines import router as ai_engines_router
from app.routers.video import router as video_router
from app.routers.voice import router as voice_router
from app.routers.subtitles import router as subtitles_router
from app.routers.music import router as music_router
from app.routers.thumbnails import router as thumbnails_router
from app.routers.settings import router as settings_router

__all__ = [
    "projects_router",
    "ai_engines_router", 
    "video_router",
    "voice_router",
    "subtitles_router",
    "music_router",
    "thumbnails_router",
    "settings_router",
]