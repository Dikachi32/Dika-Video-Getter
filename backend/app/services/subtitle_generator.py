"""Subtitle generation service."""
import os
from typing import Optional
from app.services.ai_engine_manager import engine_manager, EngineCapability
from app.utils.file_manager import FileManager

class SubtitleGenerator:
    """Handles subtitle generation and styling."""

    STYLES = {
        "modern-yellow": {
            "name": "Modern Yellow",
            "description": "Bold yellow text with black outline",
        },
        "clean-white": {
            "name": "Clean White",
            "description": "Clean white text with subtle shadow",
        },
        "bold-red": {
            "name": "Bold Red",
            "description": "Attention-grabbing red text",
        },
        "minimal": {
            "name": "Minimal",
            "description": "Simple minimal style",
        },
    }

    @classmethod
    def get_available_styles(cls):
        """Get available subtitle styles."""
        return cls.STYLES

    @staticmethod
    async def generate_subtitles(
        audio_path: str,
        project_id: int,
        engine: Optional[str] = None
    ) -> str:
        """Generate subtitles from audio using Whisper or similar."""
        output_dir = FileManager.get_output_dir(project_id)

        params = {
            "audio_path": audio_path,
            "name": "subtitles",
            "output_dir": str(output_dir),
        }

        result = await engine_manager.generate(
            EngineCapability.SUBTITLE_GENERATION,
            params,
            preferred_engine=engine or "openai"
        )

        return result["path"]

    @staticmethod
    def create_subtitle_from_script(script_text: str, duration: int, output_path: str) -> str:
        """Create simple SRT subtitle from script text."""
        lines = script_text.strip().split("\n")
        segment_duration = duration // max(len(lines), 1)

        with open(output_path, "w") as f:
            for i, line in enumerate(lines):
                if not line.strip():
                    continue
                start = i * segment_duration
                end = start + segment_duration

                start_str = f"00:00:{start:02d},000"
                end_str = f"00:00:{end:02d},000"

                f.write(f"{i+1}\n")
                f.write(f"{start_str} --> {end_str}\n")
                f.write(f"{line.strip()}\n\n")

        return output_path