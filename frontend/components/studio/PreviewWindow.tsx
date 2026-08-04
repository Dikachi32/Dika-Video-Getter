"use client";

import { useState, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Film,
  MonitorPlay,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviewWindowProps {
  videoPath: string | null;
  projectName: string;
}

export function PreviewWindow({ videoPath, projectName }: PreviewWindowProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(prog);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = (Number(e.target.value) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = time;
    setProgress(Number(e.target.value));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    videoRef.current.requestFullscreen();
  };

  const handleDownload = () => {
    if (!videoPath) return;
    const link = document.createElement("a");
    link.href = `/api/media?path=${encodeURIComponent(videoPath)}`;
    link.download = `${projectName.replace(/\s+/g, "_")}.mp4`;
    link.click();
  };

  if (!videoPath) {
    return (
      <div className="panel flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <MonitorPlay className="w-8 h-8 text-muted-foreground opacity-50" />
        </div>
        <h3 className="font-semibold text-sm mb-1">No Preview Available</h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          Generate and assemble your video to see a preview here.
        </p>
      </div>
    );
  }

  return (
    <div className="panel p-0 overflow-hidden">
      <div className="relative bg-black rounded-t-xl overflow-hidden">
        <video
          ref={videoRef}
          src={`/api/media?path=${encodeURIComponent(videoPath)}`}
          className="w-full aspect-video object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-3 space-y-2">
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={togglePlay}
              leftIcon={
                isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )
              }
            />
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={toggleMute}
              leftIcon={
                isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )
              }
            />
            <span className="text-xs text-muted-foreground ml-1">
              {formatTime(videoRef.current?.currentTime || 0)} /{" "}
              {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleDownload}
              leftIcon={<Download className="w-4 h-4" />}
            />
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={handleFullscreen}
              leftIcon={<Maximize className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}