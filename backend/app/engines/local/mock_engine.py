"""Mock engine for testing and development without heavy models."""
import os
import shutil
from typing import Dict, Any
from app.engines.base import BaseEngine, EngineCapability, EngineType
from app.config import settings

class MockEngine(BaseEngine):
    """Mock engine that creates placeholder files for testing workflows."""

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
        self._available = True
        return True

    async def generate(self, capability: EngineCapability, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate placeholder files for testing."""
        output_dir = params.get("output_dir", str(settings.OUTPUTS_DIR))
        os.makedirs(output_dir, exist_ok=True)

        if capability == EngineCapability.TEXT_TO_VIDEO:
            return await self._generate_video(params, output_dir)
        elif capability == EngineCapability.IMAGE_TO_VIDEO:
            return await self._generate_video(params, output_dir)
        elif capability == EngineCapability.TEXT_TO_SPEECH:
            return await self._generate_audio(params, output_dir)
        elif capability == EngineCapability.MUSIC_GENERATION:
            return await self._generate_music(params, output_dir)
        elif capability == EngineCapability.IMAGE_GENERATION:
            return await self._generate_image(params, output_dir)
        elif capability == EngineCapability.SUBTITLE_GENERATION:
            return await self._generate_subtitles(params, output_dir)

        raise ValueError(f"Capability {capability} not supported")

    async def _generate_video(self, params: Dict[str, Any], output_dir: str) -> Dict[str, Any]:
        from app.utils.ffmpeg import FFmpegUtils
        output_path = os.path.join(output_dir, f"{params.get('name', 'video')}.mp4")
        duration = params.get("duration", 3)
        resolution = params.get("resolution", "1080x1920")
        text = params.get("text", "Mock Video")

        await FFmpegUtils.generate_test_video(output_path, duration, resolution, text)
        return {"path": output_path, "type": "video", "engine": self.name}

    async def _generate_audio(self, params: Dict[str, Any], output_dir: str) -> Dict[str, Any]:
        from app.utils.ffmpeg import FFmpegUtils
        output_path = os.path.join(output_dir, f"{params.get('name', 'audio')}.mp3")
        duration = params.get("duration", 3)

        await FFmpegUtils.generate_test_audio(output_path, duration)
        return {"path": output_path, "type": "audio", "engine": self.name}

    async def _generate_music(self, params: Dict[str, Any], output_dir: str) -> Dict[str, Any]:
        return await self._generate_audio(params, output_dir)

    async def _generate_image(self, params: Dict[str, Any], output_dir: str) -> Dict[str, Any]:
        from app.utils.ffmpeg import FFmpegUtils
        output_path = os.path.join(output_dir, f"{params.get('name', 'image')}.png")
        resolution = params.get("resolution", "1080x1920")
        text = params.get("text", "Mock Image")

        await FFmpegUtils.generate_test_image(output_path, resolution, text)
        return {"path": output_path, "type": "image", "engine": self.name}

    async def _generate_subtitles(self, params: Dict[str, Any], output_dir: str) -> Dict[str, Any]:
        output_path = os.path.join(output_dir, f"{params.get('name', 'subtitles')}.srt")
        text = params.get("text", "Mock subtitle text")

        with open(output_path, "w") as f:
            f.write(f"1\n00:00:00,000 --> 00:00:05,000\n{text}\n")

        return {"path": output_path, "type": "subtitle", "engine": self.name}