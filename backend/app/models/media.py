"""Media assets model."""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
from app.database import Base
from datetime import datetime
import enum

class MediaType(str, enum.Enum):
    VIDEO = "video"
    IMAGE = "image"
    AUDIO = "audio"
    MUSIC = "music"
    SUBTITLE = "subtitle"
    THUMBNAIL = "thumbnail"

class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    type = Column(Enum(MediaType), nullable=False)
    name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="media_assets")