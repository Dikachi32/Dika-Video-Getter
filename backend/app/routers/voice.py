"""Voice synthesis API router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.project import Project, ProjectStatus
from app.services.voice_synthesizer import VoiceSynthesizer
from app.utils.file_manager import FileManager

router = APIRouter(prefix="/voice", tags=["Voice"])

class VoiceGenerateRequest(BaseModel):
    project_id: int
    text: str
    voice_id: str = "alloy"
    engine: Optional[str] = None

@router.get("/voices")
async def list_voices():
    """List available AI voices."""
    return {"voices": VoiceSynthesizer.get_available_voices()}

@router.post("/generate")
async def generate_voice(request: VoiceGenerateRequest, db: Session = Depends(get_db)):
    """Generate voice audio from text."""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    voice_path = await VoiceSynthesizer.generate_voice(
        request.text,
        request.project_id,
        voice_id=request.voice_id,
        engine=request.engine
    )

    # Update project
    from app.models.project import Scene
    scenes = db.query(Scene).filter(Scene.project_id == request.project_id).order_by(Scene.order).all()
    for scene in scenes:
        if not scene.voice_path:
            scene.voice_path = voice_path
            break

    project.status = ProjectStatus.VOICE_GENERATED
    db.commit()

    return {"voice_path": voice_path, "project_id": request.project_id}