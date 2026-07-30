"""File management utilities."""
import os
import shutil
from pathlib import Path
from typing import Optional
from app.config import settings

class FileManager:
    """Manages project files and outputs."""

    @staticmethod
    def get_project_dir(project_id: int) -> Path:
        """Get project directory path."""
        path = settings.PROJECTS_DIR / str(project_id)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @staticmethod
    def get_output_dir(project_id: int) -> Path:
        """Get output directory path."""
        path = settings.OUTPUTS_DIR / str(project_id)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @staticmethod
    def cleanup_project(project_id: int):
        """Remove all files for a project."""
        project_dir = settings.PROJECTS_DIR / str(project_id)
        output_dir = settings.OUTPUTS_DIR / str(project_id)

        if project_dir.exists():
            shutil.rmtree(project_dir)
        if output_dir.exists():
            shutil.rmtree(output_dir)

    @staticmethod
    def ensure_dir(path: Path) -> Path:
        """Ensure directory exists."""
        path.mkdir(parents=True, exist_ok=True)
        return path