"""Mock engine for testing and fallback."""
from typing import Dict, Any
from app.engines.base import BaseEngine, EngineCapability, EngineType
from app.utils.ffmpeg import FFmpegUtils
import os

class MockEngine(BaseEngine):
    """Mock engine that generates test files using FFmpeg."""

    name = "mock"
    engine_type = EngineType.LOCAL
    capabilities = [
        EngineCapability.TEXT_TO_VIDEO,
        EngineCapability.IMAGE_TO_VIDEO,
        EngineCapability.TEXT_TO_SPEECH,
        EngineCapability.MUSIC_GENERATION,
        EngineCapability.IMAGE_GENERATION,
        EngineCapability.SUBTITLE_GENERATION,
    ]

    async def check_availability(self) -> bool:
        """Always available since it uses FFmpeg."""
        self._available = FFmpegUtils.check_ffmpeg()
        return self._available

    async def generate(self, capability: EngineCapability, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate test content based on capability."""
        output_dir = params.get("output_dir", "./output")
        name = params.get("name", "test")
        duration = params.get("duration", 3)
        resolution = params.get("resolution", "1080x1920")
        text = params.get("text", params.get("prompt", "Test"))

        os.makedirs(output_dir, exist_ok=True)

        if capability == EngineCapability.TEXT_TO_VIDEO:
            output_path = os.path.join(output_dir, f"{name}.mp4")
            await FFmpegUtils.generate_test_video(output_path, duration, resolution, text[:30])
            return {"path": output_path, "type": "video"}

        elif capability == EngineCapability.TEXT_TO_SPEECH:
            output_path = os.path.join(output_dir, f"{name}.mp3")
            await FFmpegUtils.generate_test_audio(output_path, duration)
            return {"path": output_path, "type": "audio"}

        elif capability == EngineCapability.MUSIC_GENERATION:
            output_path = os.path.join(output_dir, f"{name}.mp3")
            await FFmpegUtils.generate_test_audio(output_path, duration)
            return {"path": output_path, "type": "audio"}

        elif capability == EngineCapability.IMAGE_GENERATION:
            output_path = os.path.join(output_dir, f"{name}.png")
            await FFmpegUtils.generate_test_image(output_path, resolution, text[:30])
            return {"path": output_path, "type": "image"}

        elif capability == EngineCapability.SUBTITLE_GENERATION:
            output_path = os.path.join(output_dir, f"{name}.srt")
            from app.services.subtitle_generator import SubtitleGenerator
            SubtitleGenerator.create_subtitle_from_script(text, duration, output_path)
            return {"path": output_path, "type": "subtitle"}

        else:
            raise NotImplementedError(f"Capability {capability.value} not implemented in mock engine")