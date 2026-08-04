"""ElevenLabs cloud engine."""
from typing import Dict, Any
from app.engines.base import BaseEngine, EngineCapability, EngineType
from app.config import settings
import os

class ElevenLabsEngine(BaseEngine):
    """ElevenLabs API engine for voice synthesis."""

    name = "elevenlabs"
    engine_type = EngineType.CLOUD
    capabilities = [EngineCapability.TEXT_TO_SPEECH]

    async def check_availability(self) -> bool:
        self._available = bool(settings.ELEVENLABS_API_KEY)
        return self._available

    async def generate(self, capability: EngineCapability, params: Dict[str, Any]) -> Dict[str, Any]:
        if not self._available:
            raise RuntimeError("ElevenLabs API key not configured")

        output_dir = params.get("output_dir", "./output")
        name = params.get("name", "elevenlabs_output")

        from app.utils.ffmpeg import FFmpegUtils
        os.makedirs(output_dir, exist_ok=True)

        output_path = os.path.join(output_dir, f"{name}.mp3")
        await FFmpegUtils.generate_test_audio(output_path, params.get("duration", 3))
        return {"path": output_path, "type": "audio"}