"""OpenAI cloud engine."""
from typing import Dict, Any
from app.engines.base import BaseEngine, EngineCapability, EngineType
from app.config import settings
import os

class OpenAIEngine(BaseEngine):
    """OpenAI API engine for GPT, DALL-E, TTS."""

    name = "openai"
    engine_type = EngineType.CLOUD
    capabilities = [
        EngineCapability.TEXT_TO_VIDEO,
        EngineCapability.TEXT_TO_SPEECH,
        EngineCapability.IMAGE_GENERATION,
        EngineCapability.SUBTITLE_GENERATION,
    ]

    async def check_availability(self) -> bool:
        self._available = bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"))
        return self._available

    async def generate(self, capability: EngineCapability, params: Dict[str, Any]) -> Dict[str, Any]:
        if not self._available:
            raise RuntimeError("OpenAI API key not configured")

        # For now, return mock data since full OpenAI integration requires more setup
        output_dir = params.get("output_dir", "./output")
        name = params.get("name", "openai_output")

        from app.utils.ffmpeg import FFmpegUtils
        os.makedirs(output_dir, exist_ok=True)

        if capability == EngineCapability.TEXT_TO_SPEECH:
            output_path = os.path.join(output_dir, f"{name}.mp3")
            await FFmpegUtils.generate_test_audio(output_path, params.get("duration", 3))
            return {"path": output_path, "type": "audio"}

        elif capability == EngineCapability.IMAGE_GENERATION:
            output_path = os.path.join(output_dir, f"{name}.png")
            await FFmpegUtils.generate_test_image(output_path, params.get("size", "1024x1792"), params.get("text", "AI Generated")[:30])
            return {"path": output_path, "type": "image"}

        else:
            raise NotImplementedError(f"OpenAI capability {capability.value} not fully implemented")