"""Background music generation service."""
import os
from typing import Optional
from app.services.ai_engine_manager import engine_manager, EngineCapability
from app.utils.file_manager import FileManager

class MusicGenerator:
    """Handles AI music generation."""

    @staticmethod
    async def generate_music(
        prompt: str,
        project_id: int,
        duration: int = 15,
        engine: Optional[str] = None
    ) -> str:
        """Generate background music from text prompt."""
        output_dir = FileManager.get_output_dir(project_id)

        params = {
            "text": prompt,
            "name": "background_music",
            "duration": duration,
            "output_dir": str(output_dir),
        }

        try:
            result = await engine_manager.generate(
                EngineCapability.MUSIC_GENERATION,
                params,
                preferred_engine=engine
            )
            return result["path"]
        except (RuntimeError, NotImplementedError):
            # Fallback: generate test audio
            from app.utils.ffmpeg import FFmpegUtils
            output_path = os.path.join(output_dir, "background_music.mp3")
            await FFmpegUtils.generate_test_audio(output_path, duration)
            return output_path