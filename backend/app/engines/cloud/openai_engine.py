"""OpenAI cloud engine for video, image, voice, and text generation."""
import os
import httpx
from typing import Dict, Any, Optional
from app.engines.base import BaseEngine, EngineCapability, EngineType
from app.config import settings

class OpenAIEngine(BaseEngine):
    """OpenAI API engine supporting GPT-4, DALL-E, and TTS."""

    name = "openai"
    engine_type = EngineType.CLOUD
    capabilities = [
        EngineCapability.TEXT_TO_VIDEO,
        EngineCapability.IMAGE_GENERATION,
        EngineCapability.TEXT_TO_SPEECH,
        EngineCapability.SUBTITLE_GENERATION,
    ]

    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.api_key = config.get("api_key", settings.OPENAI_API_KEY) if config else settings.OPENAI_API_KEY
        self.base_url = config.get("base_url", "https://api.openai.com/v1") if config else "https://api.openai.com/v1"
        self.client = None

    async def check_availability(self) -> bool:
        """Check if OpenAI API key is valid."""
        if not self.api_key:
            self._available = False
            return False

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/models",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=10.0
                )
                self._available = response.status_code == 200
                return self._available
        except Exception:
            self._available = False
            return False

    async def generate(self, capability: EngineCapability, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate content using OpenAI API."""
        if not self._available:
            raise RuntimeError("OpenAI API not available. Check API key in settings.")

        if capability == EngineCapability.IMAGE_GENERATION:
            return await self._generate_image(params)
        elif capability == EngineCapability.TEXT_TO_SPEECH:
            return await self._generate_speech(params)
        elif capability == EngineCapability.SUBTITLE_GENERATION:
            return await self._generate_subtitles(params)
        elif capability == EngineCapability.TEXT_TO_VIDEO:
            return await self._generate_video(params)

        raise ValueError(f"Capability {capability} not supported by OpenAI engine")

    async def _generate_image(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate image using DALL-E 3."""
        import openai
        client = openai.AsyncOpenAI(api_key=self.api_key, base_url=self.base_url)

        output_dir = params.get("output_dir", str(settings.OUTPUTS_DIR))
        os.makedirs(output_dir, exist_ok=True)

        response = await client.images.generate(
            model=params.get("model", "dall-e-3"),
            prompt=params["text"],
            size=params.get("size", "1024x1792"),  # 9:16 aspect ratio
            quality=params.get("quality", "standard"),
            n=1,
        )

        image_url = response.data[0].url

        # Download image
        output_path = os.path.join(output_dir, f"{params.get('name', 'image')}.png")
        async with httpx.AsyncClient() as client_http:
            img_response = await client_http.get(image_url)
            with open(output_path, "wb") as f:
                f.write(img_response.content)

        return {"path": output_path, "type": "image", "engine": self.name, "url": image_url}

    async def _generate_speech(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate speech using OpenAI TTS."""
        import openai
        client = openai.AsyncOpenAI(api_key=self.api_key, base_url=self.base_url)

        output_dir = params.get("output_dir", str(settings.OUTPUTS_DIR))
        os.makedirs(output_dir, exist_ok=True)

        output_path = os.path.join(output_dir, f"{params.get('name', 'voice')}.mp3")

        response = await client.audio.speech.create(
            model=params.get("model", "tts-1"),
            voice=params.get("voice", "alloy"),
            input=params["text"],
        )

        response.stream_to_file(output_path)

        return {"path": output_path, "type": "audio", "engine": self.name}

    async def _generate_subtitles(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate subtitles using Whisper API."""
        import openai
        client = openai.AsyncOpenAI(api_key=self.api_key, base_url=self.base_url)

        audio_path = params.get("audio_path")
        if not audio_path or not os.path.exists(audio_path):
            raise ValueError("Valid audio_path required for subtitle generation")

        output_dir = params.get("output_dir", str(settings.OUTPUTS_DIR))
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{params.get('name', 'subtitles')}.srt")

        with open(audio_path, "rb") as audio_file:
            transcript = await client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="srt"
            )

        with open(output_path, "w") as f:
            f.write(transcript)

        return {"path": output_path, "type": "subtitle", "engine": self.name}

    async def _generate_video(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate video using Sora or GPT-4o vision capabilities."""
        # OpenAI Sora is not yet publicly available via API
        # For now, generate a sequence of images and compile to video
        # or return a not-implemented response

        raise NotImplementedError(
            "OpenAI video generation (Sora) is not yet available via API. "
            "Use image generation + local video compilation instead."
        )