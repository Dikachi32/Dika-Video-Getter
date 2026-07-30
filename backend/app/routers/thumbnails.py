"""Thumbnail generation API router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.project import Project, ProjectStatus
from app.services.thumbnail_generator import ThumbnailGenerator

router = APIRouter(prefix="/thumbnails", tags=["Thumbnails"])

class ThumbnailGenerateRequest(BaseModel):
    project_id: int
    prompt: str
    engine: Optional[str] = None

class ThumbnailExtractRequest(BaseModel):
    project_id: int
    video_path: str
    timestamp: str = "00:00:01"

@router.post("/generate")
async def generate_thumbnail(request: ThumbnailGenerateRequest, db: Session = Depends(get_db)):
    """Generate AI thumbnail from text prompt."""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    thumbnail_path = await ThumbnailGenerator.generate_thumbnail(
        request.prompt,
        request.project_id,
        engine=request.engine
    )

    project.output_thumbnail_path = thumbnail_path
    project.status = ProjectStatus.THUMBNAIL_GENERATED
    db.commit()

    return {"thumbnail_path": thumbnail_path, "project_id": request.project_id}

@router.post("/extract")
async def extract_thumbnail(request: ThumbnailExtractRequest, db: Session = Depends(get_db)):
    """Extract thumbnail from video."""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    thumbnail_path = await ThumbnailGenerator.extract_thumbnail(
        request.video_path,
        request.project_id,
        request.timestamp
    )

    project.output_thumbnail_path = thumbnail_path
    db.commit()

    return {"thumbnail_path": thumbnail_path, "project_id": request.project_id}