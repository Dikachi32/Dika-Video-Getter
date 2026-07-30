"""Video processing service - orchestrates video generation and assembly."""
import os
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.services.ai_engine_manager import engine_manager, EngineCapability
from app.utils.ffmpeg import FFmpegUtils
from app.utils.file_manager import FileManager
from app.config import settings

class VideoProcessor:
    """Handles video generation, scene assembly, and final export."""

    @staticmethod
    async def generate_script(prompt: str, engine: Optional[str] = None) -> str:
        """Generate video script from prompt using AI."""
        # For script generation, we use OpenAI GPT or local LLM
        # This is a simplified version - in production, use proper LLM integration
        script = f"""# Video Script

## Prompt
{prompt}

## Scene 1: Introduction
[0:00-0:05] Hook the viewer with an engaging opening.

## Scene 2: Main Content  
[0:05-0:12] Deliver the key message with visuals.

## Scene 3: Call to Action
[0:12-0:15] Encourage viewer engagement.

## Voiceover
Welcome! In this video, we explore {prompt[:50]}... 
Stay tuned for amazing insights and don't forget to like and subscribe!
"""
        return script

    @staticmethod
    async def generate_scenes(script: str, project_id: int, engine: Optional[str] = None) -> List[Dict[str, Any]]:
        """Generate scene descriptions from script."""
        # Parse script into scenes
        # In production, use LLM to extract scenes
        scenes = [
            {
                "order": 1,
                "description": "Opening scene with engaging visual",
                "script_text": "Welcome to this amazing video!",
                "duration": 5,
            },
            {
                "order": 2,
                "description": "Main content scene",
                "script_text": "Here is the key information you need.",
                "duration": 7,
            },
            {
                "order": 3,
                "description": "Closing call to action",
                "script_text": "Like and subscribe for more content!",
                "duration": 3,
            },
        ]
        return scenes

    @staticmethod
    async def generate_scene_video(scene: Dict[str, Any], project_id: int, resolution: str = "1080x1920", engine: Optional[str] = None) -> str:
        """Generate video for a single scene."""
        output_dir = FileManager.get_output_dir(project_id)

        params = {
            "text": scene["description"],
            "name": f"scene_{scene['order']}",
            "duration": scene.get("duration", 3),
            "resolution": resolution,
            "output_dir": str(output_dir),
        }

        result = await engine_manager.generate(
            EngineCapability.TEXT_TO_VIDEO,
            params,
            preferred_engine=engine
        )

        return result["path"]

    @staticmethod
    async def assemble_video(
        scene_videos: List[str],
        voice_path: Optional[str] = None,
        music_path: Optional[str] = None,
        subtitle_path: Optional[str] = None,
        output_path: Optional[str] = None,
        subtitle_style: str = "modern-yellow"
    ) -> str:
        """Assemble final video from all components."""

        if not output_path:
            output_path = str(settings.OUTPUTS_DIR / "final_video.mp4")

        # Step 1: Merge scene videos
        merged_path = output_path + ".merged.mp4"
        await FFmpegUtils.merge_videos(scene_videos, merged_path)

        current_video = merged_path

        # Step 2: Add voiceover
        if voice_path and os.path.exists(voice_path):
            voiced_path = output_path + ".voiced.mp4"
            await FFmpegUtils.add_audio_to_video(current_video, voice_path, voiced_path, volume=1.0)
            current_video = voiced_path

        # Step 3: Add background music
        if music_path and os.path.exists(music_path):
            music_path_temp = output_path + ".music.mp4"
            await FFmpegUtils.add_audio_to_video(current_video, music_path, music_path_temp, volume=0.15)
            current_video = music_path_temp

        # Step 4: Burn subtitles
        if subtitle_path and os.path.exists(subtitle_path):
            final_path = output_path
            await FFmpegUtils.add_subtitles(current_video, subtitle_path, final_path, style=subtitle_style)
        else:
            # Just rename to final path
            os.rename(current_video, output_path)
            final_path = output_path

        # Cleanup intermediate files
        for temp_file in [merged_path, output_path + ".voiced.mp4", output_path + ".music.mp4"]:
            if os.path.exists(temp_file) and temp_file != final_path:
                os.remove(temp_file)

        return final_path

    @staticmethod
    async def export_mp4(input_path: str, output_path: str, quality: str = "high") -> str:
        """Export video as optimized MP4."""
        crf = "18" if quality == "high" else "23" if quality == "medium" else "28"

        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-c:v", "libx264",
            "-preset", "slow",
            "-crf", crf,
            "-c:a", "aac",
            "-b:a", "192k",
            "-movflags", "+faststart",
            output_path
        ]

        stdout, stderr, code = await FFmpegUtils.run_command(cmd)
        if code != 0:
            raise RuntimeError(f"Export error: {stderr}")

        return output_path