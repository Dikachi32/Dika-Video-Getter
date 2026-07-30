"""ElevenLabs cloud engine for high-quality voice synthesis."""
import os
import httpx
from typing import Dict, Any
from app.engines.base import BaseEngine, EngineCapability, EngineType
from app.config import settings

class ElevenLabsEngine(BaseEngine):
    """ElevenLabs API engine for premium text-to-speech."""

    name = "elevenlabs"
    engine_type = EngineType.CLOUD
    capabilities = [EngineCapability.TEXT_TO_SPEECH]

    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.api_key = config.get("api_key", settings.ELEVENLABS_API_KEY) if config else settings.ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
        self.voice_id = config.get("voice_id", "21m00Tcm4TlvDq8ikWAM") if config else "21m00Tcm4TlvDq8ikWAM"

    async def check_availability(self) -> bool:
        """Check if ElevenLabs API key is valid."""
        if not self.api_key:
            self._available = False
            return False

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/user",
                    headers={"xi-api-key": self.api_key},
                    timeout=10.0
                )
                self._available = response.status_code == 200
                return self._available
        except Exception:
            self._available = False
            return False

    async def generate(self, capability: EngineCapability, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate speech using ElevenLabs API."""
        if not self._available:
            raise RuntimeError("ElevenLabs API not available. Check API key in settings.")

        if capability == EngineCapability.TEXT_TO_SPEECH:
            return await self._generate_speech(params)

        raise ValueError(f"Capability {capability} not supported by ElevenLabs engine")

    async def _generate_speech(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate high-quality speech."""
        output_dir = params.get("output_dir", str(settings.OUTPUTS_DIR))
        os.makedirs(output_dir, exist_ok=True)

        output_path = os.path.join(output_dir, f"{params.get('name', 'voice')}.mp3")
        voice_id = params.get("voice_id", self.voice_id)
        text = params["text"]

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/text-to-speech/{voice_id}",
                headers={
                    "xi-api-key": self.api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "text": text,
                    "model_id": params.get("model", "eleven_multilingual_v2"),
                    "voice_settings": {
                        "stability": params.get("stability", 0.5),
                        "similarity_boost": params.get("similarity_boost", 0.75),
                    }
                },
                timeout=60.0
            )

            if response.status_code != 200:
                raise RuntimeError(f"ElevenLabs API error: {response.text}")

            with open(output_path, "wb") as f:
                f.write(response.content)

        return {"path": output_path, "type": "audio", "engine": self.name}