"""Background music API router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.project import Project, ProjectStatus
from app.services.music_generator import MusicGenerator

router = APIRouter(prefix="/music", tags=["Music"])

class MusicGenerateRequest(BaseModel):
    project_id: int
    prompt: str
    duration: int = 15
    engine: Optional[str] = None

@router.post("/generate")
async def generate_music(request: MusicGenerateRequest, db: Session = Depends(get_db)):
    """Generate background music from text prompt."""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    music_path = await MusicGenerator.generate_music(
        request.prompt,
        request.project_id,
        duration=request.duration,
        engine=request.engine
    )

    project.status = ProjectStatus.MUSIC_GENERATED
    db.commit()

    return {"music_path": music_path, "project_id": request.project_id}