"""AI Engines API router."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.ai_engine_manager import engine_manager, EngineMode

router = APIRouter(prefix="/ai-engines", tags=["AI Engines"])

class ModeRequest(BaseModel):
    mode: str

@router.get("/status")
async def get_engine_status():
    """Get current engine status and availability."""
    return engine_manager.get_status()

@router.post("/mode")
async def set_engine_mode(request: ModeRequest):
    """Set engine mode (local, cloud, auto)."""
    try:
        mode = EngineMode(request.mode.lower())
        engine_manager.mode = mode
        return {"mode": engine_manager.mode.value, "message": f"Mode set to {mode.value}"}
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid mode: {request.mode}. Use local, cloud, or auto.")

@router.get("/capabilities")
async def list_capabilities():
    """List all available capabilities."""
    return {
        "capabilities": [
            "text_to_video",
            "image_to_video",
            "text_to_speech",
            "music_generation",
            "image_generation",
            "subtitle_generation",
        ]
    }

@router.get("/available")
async def list_available_engines(capability: Optional[str] = None):
    """List available engines, optionally filtered by capability."""
    from app.engines.base import EngineCapability
    cap = EngineCapability(capability) if capability else None
    return {"engines": engine_manager.get_available_engines(cap)}

@router.post("/generate")
async def generate_with_engine(request: dict):
    """Generate content using specified engine."""
    from app.engines.base import EngineCapability
    capability = EngineCapability(request.get("capability", "text_to_video"))
    params = request.get("params", {})
    preferred = request.get("preferred_engine")

    result = await engine_manager.generate(capability, params, preferred_engine=preferred)
    return result