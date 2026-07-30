"""Voice synthesis service."""
import os
from typing import Optional, Dict, Any
from app.services.ai_engine_manager import engine_manager, EngineCapability
from app.utils.file_manager import FileManager
from app.config import settings

class VoiceSynthesizer:
    """Handles AI voice generation and management."""

    VOICE_OPTIONS = {
        "alloy": {"name": "Alloy", "provider": "openai"},
        "echo": {"name": "Echo", "provider": "openai"},
        "fable": {"name": "Fable", "provider": "openai"},
        "onyx": {"name": "Onyx", "provider": "openai"},
        "nova": {"name": "Nova", "provider": "openai"},
        "shimmer": {"name": "Shimmer", "provider": "openai"},
        "eleven_monolingual": {"name": "Eleven Monolingual", "provider": "elevenlabs"},
        "eleven_multilingual": {"name": "Eleven Multilingual", "provider": "elevenlabs"},
    }

    @classmethod
    def get_available_voices(cls) -> Dict[str, Any]:
        """Get list of available voices."""
        return cls.VOICE_OPTIONS

    @staticmethod
    async def generate_voice(
        text: str,
        project_id: int,
        voice_id: str = "alloy",
        engine: Optional[str] = None
    ) -> str:
        """Generate voice audio from text."""
        output_dir = FileManager.get_output_dir(project_id)

        params = {
            "text": text,
            "name": "voiceover",
            "voice": voice_id,
            "output_dir": str(output_dir),
        }

        # Determine engine based on voice
        if voice_id in ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]:
            preferred = engine or "openai"
        else:
            preferred = engine or "elevenlabs"

        result = await engine_manager.generate(
            EngineCapability.TEXT_TO_SPEECH,
            params,
            preferred_engine=preferred
        )

        return result["path"]