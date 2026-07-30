"""Thumbnail generation service."""
import os
from typing import Optional
from app.services.ai_engine_manager import engine_manager, EngineCapability
from app.utils.ffmpeg import FFmpegUtils
from app.utils.file_manager import FileManager

class ThumbnailGenerator:
    """Handles AI thumbnail generation."""

    @staticmethod
    async def generate_thumbnail(
        prompt: str,
        project_id: int,
        engine: Optional[str] = None
    ) -> str:
        """Generate thumbnail image from text prompt."""
        output_dir = FileManager.get_output_dir(project_id)

        params = {
            "text": prompt,
            "name": "thumbnail",
            "size": "1024x1792",  # 9:16 for short-form content
            "output_dir": str(output_dir),
        }

        result = await engine_manager.generate(
            EngineCapability.IMAGE_GENERATION,
            params,
            preferred_engine=engine or "openai"
        )

        return result["path"]

    @staticmethod
    async def extract_thumbnail(video_path: str, project_id: int, timestamp: str = "00:00:01") -> str:
        """Extract thumbnail from video at specified timestamp."""
        output_dir = FileManager.get_output_dir(project_id)
        output_path = os.path.join(output_dir, "thumbnail_extracted.jpg")

        await FFmpegUtils.create_thumbnail(video_path, output_path, timestamp)
        return output_path