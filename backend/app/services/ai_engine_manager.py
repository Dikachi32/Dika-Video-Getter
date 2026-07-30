"""AI Engine Manager - routes requests to appropriate engines."""
import os
from typing import Dict, Any, List, Optional
from enum import Enum
from app.engines.base import BaseEngine, EngineCapability, EngineType
from app.engines.local.mock_engine import MockEngine
from app.engines.local.text_to_video import LocalTextToVideoEngine
from app.engines.local.image_to_video import LocalImageToVideoEngine
from app.engines.local.voice import LocalVoiceEngine
from app.engines.cloud.openai_engine import OpenAIEngine
from app.engines.cloud.elevenlabs_engine import ElevenLabsEngine
from app.config import settings

class EngineMode(str, Enum):
    LOCAL = "local"
    CLOUD = "cloud"
    AUTO = "auto"

class AIEngineManager:
    """Central manager for all AI engines.

    Provides unified interface for:
    - Engine discovery and registration
    - Capability-based routing
    - Local/Cloud/Auto mode selection
    - Fallback handling
    """

    def __init__(self):
        self.engines: Dict[str, BaseEngine] = {}
        self.mode: EngineMode = EngineMode.AUTO
        self._initialized = False

    async def initialize(self, mode: EngineMode = EngineMode.AUTO):
        """Initialize and discover all available engines."""
        self.mode = mode

        # Register local engines
        self._register_engine(LocalTextToVideoEngine())
        self._register_engine(LocalImageToVideoEngine())
        self._register_engine(LocalVoiceEngine())
        self._register_engine(MockEngine())

        # Register cloud engines
        self._register_engine(OpenAIEngine())
        self._register_engine(ElevenLabsEngine())

        # Check availability
        for engine in self.engines.values():
            try:
                await engine.check_availability()
            except Exception:
                engine._available = False

        self._initialized = True

    def _register_engine(self, engine: BaseEngine):
        """Register an engine instance."""
        self.engines[engine.name] = engine

    def get_available_engines(self, capability: Optional[EngineCapability] = None) -> List[Dict[str, Any]]:
        """Get list of available engines, optionally filtered by capability."""
        results = []
        for name, engine in self.engines.items():
            if not engine.is_available():
                continue
            if capability and not engine.supports(capability):
                continue
            results.append({
                "name": engine.name,
                "type": engine.engine_type.value,
                "capabilities": [c.value for c in engine.capabilities],
            })
        return results

    async def generate(
        self, 
        capability: EngineCapability, 
        params: Dict[str, Any],
        preferred_engine: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate content using the best available engine.

        Args:
            capability: The type of content to generate
            params: Generation parameters
            preferred_engine: Optional specific engine to use

        Returns:
            Dict containing generation results
        """
        if not self._initialized:
            await self.initialize()

        engine = self._select_engine(capability, preferred_engine)
        if not engine:
            raise RuntimeError(f"No available engine found for capability: {capability.value}")

        return await engine.generate(capability, params)

    def _select_engine(
        self, 
        capability: EngineCapability, 
        preferred: Optional[str] = None
    ) -> Optional[BaseEngine]:
        """Select the best engine based on mode and capability."""

        # If preferred engine specified, try it first
        if preferred and preferred in self.engines:
            engine = self.engines[preferred]
            if engine.is_available() and engine.supports(capability):
                return engine

        # Filter engines by capability and availability
        candidates = [
            e for e in self.engines.values()
            if e.is_available() and e.supports(capability)
        ]

        if not candidates:
            return None

        # Sort based on mode
        if self.mode == EngineMode.LOCAL:
            # Prefer local engines
            local = [e for e in candidates if e.engine_type == EngineType.LOCAL and e.name != "mock"]
            if local:
                return local[0]
            # Fall back to mock if no other local available
            mock = [e for e in candidates if e.name == "mock"]
            if mock:
                return mock[0]

        elif self.mode == EngineMode.CLOUD:
            # Prefer cloud engines
            cloud = [e for e in candidates if e.engine_type == EngineType.CLOUD]
            if cloud:
                return cloud[0]

        elif self.mode == EngineMode.AUTO:
            # Try local first (excluding mock), then cloud, then mock
            local = [e for e in candidates if e.engine_type == EngineType.LOCAL and e.name != "mock"]
            if local:
                return local[0]

            cloud = [e for e in candidates if e.engine_type == EngineType.CLOUD]
            if cloud:
                return cloud[0]

            mock = [e for e in candidates if e.name == "mock"]
            if mock:
                return mock[0]

        # Default: return first available
        return candidates[0]

    def get_status(self) -> Dict[str, Any]:
        """Get overall engine status."""
        return {
            "mode": self.mode.value,
            "initialized": self._initialized,
            "engines": {
                name: {
                    "available": engine.is_available(),
                    "type": engine.engine_type.value,
                    "capabilities": [c.value for c in engine.capabilities],
                }
                for name, engine in self.engines.items()
            }
        }

# Global engine manager instance
engine_manager = AIEngineManager()