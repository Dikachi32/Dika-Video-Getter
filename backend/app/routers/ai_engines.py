"""AI Engines API router."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.services.ai_engine_manager import engine_manager, EngineMode, EngineCapability

router = APIRouter(prefix="/ai-engines", tags=["AI Engines"])

class EngineModeRequest(BaseModel):
    mode: EngineMode

class GenerateRequest(BaseModel):
    capability: str
    params: Dict[str, Any]
    preferred_engine: Optional[str] = None

@router.get("/status")
async def get_engine_status():
    """Get status of all AI engines."""
    return engine_manager.get_status()

@router.post("/mode")
async def set_engine_mode(request: EngineModeRequest):
    """Set engine mode (local/cloud/auto)."""
    engine_manager.mode = request.mode
    return {"mode": engine_manager.mode.value, "message": f"Engine mode set to {request.mode.value}"}

@router.get("/capabilities")
async def list_capabilities():
    """List all available capabilities."""
    return {
        "capabilities": [
            {"id": c.value, "name": c.value.replace("_", " ").title()}
            for c in EngineCapability
        ]
    }

@router.get("/available")
async def list_available_engines(capability: Optional[str] = None):
    """List available engines, optionally filtered by capability."""
    cap = EngineCapability(capability) if capability else None
    return {"engines": engine_manager.get_available_engines(cap)}

@router.post("/generate")
async def generate_content(request: GenerateRequest):
    """Generate content using AI engines."""
    try:
        capability = EngineCapability(request.capability)
        result = await engine_manager.generate(
            capability,
            request.params,
            preferred_engine=request.preferred_engine
        )
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))