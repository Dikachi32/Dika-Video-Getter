"""Subtitle generation API router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.project import Project, ProjectStatus
from app.services.subtitle_generator import SubtitleGenerator
from app.utils.file_manager import FileManager

router = APIRouter(prefix="/subtitles", tags=["Subtitles"])

class SubtitleGenerateRequest(BaseModel):
    project_id: int
    audio_path: str
    engine: Optional[str] = None

class SubtitleFromScriptRequest(BaseModel):
    project_id: int
    script_text: str
    duration: int = 15

@router.get("/styles")
async def list_styles():
    """List available subtitle styles."""
    return {"styles": SubtitleGenerator.get_available_styles()}

@router.post("/generate")
async def generate_subtitles(request: SubtitleGenerateRequest, db: Session = Depends(get_db)):
    """Generate subtitles from audio file."""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    subtitle_path = await SubtitleGenerator.generate_subtitles(
        request.audio_path,
        request.project_id,
        engine=request.engine
    )

    project.status = ProjectStatus.SUBTITLE_GENERATED
    db.commit()

    return {"subtitle_path": subtitle_path, "project_id": request.project_id}

@router.post("/from-script")
async def create_subtitles_from_script(request: SubtitleFromScriptRequest, db: Session = Depends(get_db)):
    """Create subtitles from script text."""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    output_dir = FileManager.get_output_dir(request.project_id)
    output_path = str(output_dir / "subtitles.srt")

    SubtitleGenerator.create_subtitle_from_script(
        request.script_text,
        request.duration,
        output_path
    )

    return {"subtitle_path": output_path, "project_id": request.project_id}