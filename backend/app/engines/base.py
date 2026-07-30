"""Base class for all AI engines."""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from enum import Enum

class EngineCapability(str, Enum):
    TEXT_TO_VIDEO = "text_to_video"
    IMAGE_TO_VIDEO = "image_to_video"
    TEXT_TO_SPEECH = "text_to_speech"
    MUSIC_GENERATION = "music_generation"
    IMAGE_GENERATION = "image_generation"
    SUBTITLE_GENERATION = "subtitle_generation"

class EngineType(str, Enum):
    LOCAL = "local"
    CLOUD = "cloud"

class BaseEngine(ABC):
    """Abstract base class for all AI engines."""

    name: str = "base"
    engine_type: EngineType = EngineType.LOCAL
    capabilities: List[EngineCapability] = []

    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self._available = False

    @abstractmethod
    async def check_availability(self) -> bool:
        """Check if the engine is available and ready."""
        pass

    @abstractmethod
    async def generate(self, capability: EngineCapability, params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate content using the specified capability."""
        pass

    def is_available(self) -> bool:
        return self._available

    def supports(self, capability: EngineCapability) -> bool:
        return capability in self.capabilities