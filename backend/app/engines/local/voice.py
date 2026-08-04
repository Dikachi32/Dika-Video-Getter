"""Local voice synthesis engine."""
from typing import Dict, Any
from app.engines.base import BaseEngine, EngineCapability, EngineType

class LocalVoiceEngine(BaseEngine):
    """Local voice synthesis using Coqui TTS."""

    name = "local_voice"
    engine_type = EngineType.LOCAL
    capabilities = [EngineCapability.TEXT_TO_SPEECH]

    async def check_availability(self) -> bool:
        try:
            import TTS
            self._available = False
            return self._available
        except ImportError:
            self._available = False
            return False

    async def generate(self, capability: EngineCapability, params: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError("Local voice not yet configured. Install Coqui TTS.")