"""Video processing API router."""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database import get_db
from app.models.project import Project, ProjectStatus
from app.services.video_processor import VideoProcessor
from app.services.ai_engine_manager import engine_manager, EngineCapability
from app.utils.file_manager import FileManager

router = APIRouter(prefix="/video", tags=["Video"])

class ScriptRequest(BaseModel):
    project_id: int
    prompt: str

class ScenesRequest(BaseModel):
    project_id: int
    script: str

class GenerateVideoRequest(BaseModel):
    project_id: int
    scene_id: Optional[int] = None
    engine: Optional[str] = None

class AssembleRequest(BaseModel):
    project_id: int
    scene_video_paths: List[str]
    voice_path: Optional[str] = None
    music_path: Optional[str] = None
    subtitle_path: Optional[str] = None
    subtitle_style: str = "modern-yellow"

class ExportRequest(BaseModel):
    project_id: int
    quality: str = "high"

@router.post("/generate-script")
async def generate_script(request: ScriptRequest, db: Session = Depends(get_db)):
    """Generate script from prompt."""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    script = await VideoProcessor.generate_script(request.prompt)

    project.script = script
    project.status = ProjectStatus.SCRIPT_GENERATED
    db.commit()

    return {"script": script, "project_id": request.project_id}

@router.post("/generate-scenes")
async def generate_scenes(request: ScenesRequest, db: Session = Depends(get_db)):
    """Generate scenes from script."""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    scenes = await VideoProcessor.generate_scenes(request.script, request.project_id)

    # Save scenes to database
    from app.models.project import Scene
    for scene_data in scenes:
        scene = Scene(project_id=request.project_id, **scene_data)
        db.add(scene)

    project.status = ProjectStatus.SCENES_GENERATED
    db.commit()

    return {"scenes": scenes, "project_id": request.project_id}

@router.post("/generate-scene-video")
async def generate_scene_video(request: GenerateVideoRequest, db: Session = Depends(get_db)):
    """Generate video for a specific scene."""
    from app.models.project import Scene

    scene = db.query(Scene).filter(Scene.id == request.scene_id).first() if request.scene_id else None
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")

    project = db.query(Project).filter(Project.id == request.project_id).first()

    video_path = await VideoProcessor.generate_scene_video(
        {
            "order": scene.order,
            "description": scene.description,
            "duration": scene.duration,
        },
        request.project_id,
        resolution=project.resolution if project else "1080x1920",
        engine=request.engine
    )

    scene.video_path = video_path
    db.commit()

    return {"video_path": video_path, "scene_id": request.scene_id}

@router.post("/assemble")
async def assemble_video(request: AssembleRequest, db: Session = Depends(get_db)):
    """Assemble final video from components."""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    output_dir = FileManager.get_output_dir(request.project_id)
    output_path = str(output_dir / "final_video.mp4")

    final_path = await VideoProcessor.assemble_video(
        request.scene_video_paths,
        voice_path=request.voice_path,
        music_path=request.music_path,
        subtitle_path=request.subtitle_path,
        output_path=output_path,
        subtitle_style=request.subtitle_style
    )

    project.output_video_path = final_path
    project.status = ProjectStatus.MERGED
    db.commit()

    return {"output_path": final_path, "project_id": request.project_id}

@router.post("/export")
async def export_video(request: ExportRequest, db: Session = Depends(get_db)):
    """Export final video as MP4."""
    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not project.output_video_path or not os.path.exists(project.output_video_path):
        raise HTTPException(status_code=400, detail="No video to export")

    output_dir = FileManager.get_output_dir(request.project_id)
    export_path = str(output_dir / f"export_{request.quality}.mp4")

    from app.utils.ffmpeg import FFmpegUtils
    await FFmpegUtils.export_mp4(project.output_video_path, export_path, request.quality)

    project.status = ProjectStatus.EXPORTED
    db.commit()

    return {"export_path": export_path, "project_id": request.project_id}