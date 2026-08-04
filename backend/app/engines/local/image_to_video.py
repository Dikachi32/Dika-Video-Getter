"""Local image-to-video engine."""
from typing import Dict, Any
from app.engines.base import BaseEngine, EngineCapability, EngineType

class LocalImageToVideoEngine(BaseEngine):
    """Local image-to-video using Stable Video Diffusion."""

    name = "local_image_to_video"
    engine_type = EngineType.LOCAL
    capabilities = [EngineCapability.IMAGE_TO_VIDEO]

    async def check_availability(self) -> bool:
        try:
            import torch
            self._available = False
            return self._available
        except ImportError:
            self._available = False
            return False

    async def generate(self, capability: EngineCapability, params: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError("Local image-to-video not yet configured. Download Stable Video Diffusion model.")