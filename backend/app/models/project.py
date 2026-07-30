"""Project and Scene models."""
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    SCRIPT_GENERATED = "script_generated"
    SCENES_GENERATED = "scenes_generated"
    VIDEO_GENERATED = "video_generated"
    VOICE_GENERATED = "voice_generated"
    SUBTITLE_GENERATED = "subtitle_generated"
    MUSIC_GENERATED = "music_generated"
    THUMBNAIL_GENERATED = "thumbnail_generated"
    MERGED = "merged"
    EXPORTED = "exported"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    prompt = Column(Text, nullable=True)
    script = Column(Text, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT)

    # Configuration
    video_duration = Column(Integer, default=15)
    resolution = Column(String(50), default="1080x1920")
    subtitle_style = Column(String(100), default="modern-yellow")
    voice_id = Column(String(100), default="alloy")
    music_prompt = Column(Text, nullable=True)
    thumbnail_prompt = Column(Text, nullable=True)

    # Output paths
    output_video_path = Column(String(500), nullable=True)
    output_thumbnail_path = Column(String(500), nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    scenes = relationship("Scene", back_populates="project", cascade="all, delete-orphan")
    media_assets = relationship("MediaAsset", back_populates="project", cascade="all, delete-orphan")

class Scene(Base):
    __tablename__ = "scenes"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    order = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    script_text = Column(Text, nullable=True)
    duration = Column(Integer, default=3)

    # Generated assets
    image_path = Column(String(500), nullable=True)
    video_path = Column(String(500), nullable=True)
    voice_path = Column(String(500), nullable=True)

    # Timing
    start_time = Column(Integer, default=0)
    end_time = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="scenes")