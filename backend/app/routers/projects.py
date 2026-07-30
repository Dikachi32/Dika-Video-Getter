"""Projects API router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.project import Project, ProjectStatus, Scene
from app.utils.file_manager import FileManager

router = APIRouter(prefix="/projects", tags=["Projects"])

# Pydantic schemas
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    prompt: Optional[str] = None
    video_duration: int = 15
    resolution: str = "1080x1920"
    subtitle_style: str = "modern-yellow"
    voice_id: str = "alloy"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    prompt: Optional[str] = None
    script: Optional[str] = None
    status: Optional[ProjectStatus] = None
    video_duration: Optional[int] = None
    resolution: Optional[str] = None
    subtitle_style: Optional[str] = None
    voice_id: Optional[str] = None
    output_video_path: Optional[str] = None
    output_thumbnail_path: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    prompt: Optional[str]
    script: Optional[str]
    status: str
    video_duration: int
    resolution: str
    subtitle_style: str
    voice_id: str
    output_video_path: Optional[str]
    output_thumbnail_path: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SceneCreate(BaseModel):
    order: int
    description: str
    script_text: Optional[str] = None
    duration: int = 3

class SceneResponse(BaseModel):
    id: int
    project_id: int
    order: int
    description: str
    script_text: Optional[str]
    duration: int
    image_path: Optional[str]
    video_path: Optional[str]
    voice_path: Optional[str]
    start_time: int
    end_time: int

    class Config:
        from_attributes = True

@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new video project."""
    db_project = Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # Create project directories
    FileManager.get_project_dir(db_project.id)
    FileManager.get_output_dir(db_project.id)

    return db_project

@router.get("/", response_model=List[ProjectResponse])
async def list_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all projects."""
    projects = db.query(Project).order_by(Project.created_at.desc()).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: int, project_update: ProjectUpdate, db: Session = Depends(get_db)):
    """Update a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for field, value in project_update.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project and all associated files."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Cleanup files
    FileManager.cleanup_project(project_id)

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

# Scene endpoints
@router.post("/{project_id}/scenes", response_model=SceneResponse)
async def create_scene(project_id: int, scene: SceneCreate, db: Session = Depends(get_db)):
    """Add a scene to a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db_scene = Scene(project_id=project_id, **scene.model_dump())
    db.add(db_scene)
    db.commit()
    db.refresh(db_scene)
    return db_scene

@router.get("/{project_id}/scenes", response_model=List[SceneResponse])
async def list_scenes(project_id: int, db: Session = Depends(get_db)):
    """List all scenes for a project."""
    scenes = db.query(Scene).filter(Scene.project_id == project_id).order_by(Scene.order).all()
    return scenes

@router.delete("/{project_id}/scenes/{scene_id}")
async def delete_scene(project_id: int, scene_id: int, db: Session = Depends(get_db)):
    """Delete a scene."""
    scene = db.query(Scene).filter(Scene.id == scene_id, Scene.project_id == project_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")

    db.delete(scene)
    db.commit()
    return {"message": "Scene deleted successfully"}