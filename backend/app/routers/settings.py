"""Application settings API router."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any

from app.database import get_db
from app.models.settings import AppSettings
from app.config import settings as app_settings

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingCreate(BaseModel):
    key: str
    value: str
    category: str = "general"

class SettingUpdate(BaseModel):
    value: str

class SettingsBatchUpdate(BaseModel):
    settings: Dict[str, str]

@router.get("/")
async def get_all_settings(db: Session = Depends(get_db)):
    """Get all application settings."""
    db_settings = db.query(AppSettings).all()
    result = {}
    for s in db_settings:
        if s.category not in result:
            result[s.category] = {}
        result[s.category][s.key] = s.value

    # Include env defaults
    result["api_keys"] = {
        "OPENAI_API_KEY": app_settings.OPENAI_API_KEY,
        "ELEVENLABS_API_KEY": app_settings.ELEVENLABS_API_KEY,
    }
    result["defaults"] = {
        "DEFAULT_VIDEO_DURATION": str(app_settings.DEFAULT_VIDEO_DURATION),
        "DEFAULT_RESOLUTION": app_settings.DEFAULT_RESOLUTION,
        "DEFAULT_SUBTITLE_STYLE": app_settings.DEFAULT_SUBTITLE_STYLE,
        "DEFAULT_VOICE": app_settings.DEFAULT_VOICE,
    }

    return result

@router.get("/{key}")
async def get_setting(key: str, db: Session = Depends(get_db)):
    """Get a specific setting."""
    setting = db.query(AppSettings).filter(AppSettings.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return {"key": setting.key, "value": setting.value, "category": setting.category}

@router.post("/")
async def create_or_update_setting(setting: SettingCreate, db: Session = Depends(get_db)):
    """Create or update a setting."""
    db_setting = db.query(AppSettings).filter(AppSettings.key == setting.key).first()
    if db_setting:
        db_setting.value = setting.value
        db_setting.category = setting.category
    else:
        db_setting = AppSettings(**setting.model_dump())
        db.add(db_setting)

    db.commit()
    db.refresh(db_setting)
    return {"key": db_setting.key, "value": db_setting.value}

@router.post("/batch")
async def update_settings_batch(request: SettingsBatchUpdate, db: Session = Depends(get_db)):
    """Update multiple settings at once."""
    for key, value in request.settings.items():
        db_setting = db.query(AppSettings).filter(AppSettings.key == key).first()
        if db_setting:
            db_setting.value = value
        else:
            db_setting = AppSettings(key=key, value=value, category="general")
            db.add(db_setting)

    db.commit()
    return {"message": "Settings updated successfully"}

@router.delete("/{key}")
async def delete_setting(key: str, db: Session = Depends(get_db)):
    """Delete a setting."""
    setting = db.query(AppSettings).filter(AppSettings.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")

    db.delete(setting)
    db.commit()
    return {"message": "Setting deleted"}