"""FFmpeg utilities for video processing."""
import os
import asyncio
import subprocess
from typing import List, Optional, Tuple
from pathlib import Path

class FFmpegUtils:
    """Utility class for FFmpeg video operations."""

    @staticmethod
    async def run_command(cmd: List[str]) -> Tuple[str, str, int]:
        """Run an FFmpeg command asynchronously."""
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        return stdout.decode(), stderr.decode(), process.returncode

    @staticmethod
    def check_ffmpeg() -> bool:
        """Check if FFmpeg is installed."""
        try:
            subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    @staticmethod
    async def generate_test_video(output_path: str, duration: int = 3, resolution: str = "1080x1920", text: str = "Test") -> str:
        """Generate a test video with text overlay."""
        width, height = resolution.split("x")
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", f"color=c=black:s={resolution}:d={duration}",
            "-vf", f"drawtext=text='{text}':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-t", str(duration),
            output_path
        ]
        stdout, stderr, code = await FFmpegUtils.run_command(cmd)
        if code != 0:
            raise RuntimeError(f"FFmpeg error: {stderr}")
        return output_path

    @staticmethod
    async def generate_test_audio(output_path: str, duration: int = 3) -> str:
        """Generate a test audio file."""
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", f"sine=frequency=1000:duration={duration}",
            "-c:a", "libmp3lame",
            "-q:a", "4",
            output_path
        ]
        stdout, stderr, code = await FFmpegUtils.run_command(cmd)
        if code != 0:
            raise RuntimeError(f"FFmpeg error: {stderr}")
        return output_path

    @staticmethod
    async def generate_test_image(output_path: str, resolution: str = "1080x1920", text: str = "Test") -> str:
        """Generate a test image with text."""
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", f"color=c=darkblue:s={resolution}",
            "-vf", f"drawtext=text='{text}':fontcolor=white:fontsize=80:x=(w-text_w)/2:y=(h-text_h)/2",
            "-frames:v", "1",
            output_path
        ]
        stdout, stderr, code = await FFmpegUtils.run_command(cmd)
        if code != 0:
            raise RuntimeError(f"FFmpeg error: {stderr}")
        return output_path

    @staticmethod
    async def merge_videos(video_paths: List[str], output_path: str, transition: str = "fade") -> str:
        """Merge multiple videos with transitions."""
        if len(video_paths) == 1:
            # Just copy if single video
            cmd = ["ffmpeg", "-y", "-i", video_paths[0], "-c", "copy", output_path]
        else:
            # Create concat file
            concat_file = output_path + ".concat.txt"
            with open(concat_file, "w") as f:
                for path in video_paths:
                    f.write(f"file '{os.path.abspath(path)}'\n")

            cmd = [
                "ffmpeg", "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", concat_file,
                "-c", "copy",
                output_path
            ]

        stdout, stderr, code = await FFmpegUtils.run_command(cmd)
        if code != 0:
            raise RuntimeError(f"FFmpeg merge error: {stderr}")

        # Cleanup concat file
        if os.path.exists(concat_file):
            os.remove(concat_file)

        return output_path

    @staticmethod
    async def add_audio_to_video(video_path: str, audio_path: str, output_path: str, volume: float = 0.3) -> str:
        """Add background music to video."""
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-i", audio_path,
            "-filter_complex", f"[1:a]volume={volume}[a1];[0:a][a1]amix=inputs=2:duration=first",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            output_path
        ]
        stdout, stderr, code = await FFmpegUtils.run_command(cmd)
        if code != 0:
            raise RuntimeError(f"FFmpeg audio mix error: {stderr}")
        return output_path

    @staticmethod
    async def add_subtitles(video_path: str, subtitle_path: str, output_path: str, style: str = "modern-yellow") -> str:
        """Burn subtitles into video."""
        # Style configurations
        styles = {
            "modern-yellow": "FontName=Arial:FontSize=24:PrimaryColour=&H00FFFF00:OutlineColour=&H00000000:Outline=2",
            "clean-white": "FontName=Arial:FontSize=24:PrimaryColour=&H00FFFFFF:OutlineColour=&H00000000:Outline=2",
            "bold-red": "FontName=Arial:FontSize=28:PrimaryColour=&H000000FF:OutlineColour=&H00FFFFFF:Outline=2",
            "minimal": "FontName=Helvetica:FontSize=20:PrimaryColour=&H00FFFFFF:Outline=0:Shadow=0",
        }

        style_str = styles.get(style, styles["modern-yellow"])

        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-vf", f"subtitles={subtitle_path}:force_style='{style_str}'",
            "-c:a", "copy",
            output_path
        ]
        stdout, stderr, code = await FFmpegUtils.run_command(cmd)
        if code != 0:
            raise RuntimeError(f"FFmpeg subtitle error: {stderr}")
        return output_path

    @staticmethod
    async def create_thumbnail(video_path: str, output_path: str, timestamp: str = "00:00:01") -> str:
        """Extract thumbnail from video."""
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-ss", timestamp,
            "-vframes", "1",
            "-q:v", "2",
            output_path
        ]
        stdout, stderr, code = await FFmpegUtils.run_command(cmd)
        if code != 0:
            raise RuntimeError(f"FFmpeg thumbnail error: {stderr}")
        return output_path

    @staticmethod
    async def resize_video(input_path: str, output_path: str, resolution: str = "1080x1920") -> str:
        """Resize video to target resolution."""
        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-vf", f"scale={resolution}:force_original_aspect_ratio=decrease,pad={resolution}:(ow-iw)/2:(oh-ih)/2:black",
            "-c:a", "copy",
            output_path
        ]
        stdout, stderr, code = await FFmpegUtils.run_command(cmd)
        if code != 0:
            raise RuntimeError(f"FFmpeg resize error: {stderr}")
        return output_path

    @staticmethod
    async def get_video_info(path: str) -> dict:
        """Get video metadata using ffprobe."""
        cmd = [
            "ffprobe", "-v", "quiet", "-print_format", "json",
            "-show_format", "-show_streams", path
        ]
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            raise RuntimeError(f"ffprobe error: {stderr.decode()}")

        import json
        return json.loads(stdout.decode())