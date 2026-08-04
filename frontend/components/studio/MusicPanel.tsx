"use client";

import { useState } from "react";
import { Music, Loader2, Play, Pause, Wand2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface MusicPanelProps {
  projectId: number;
  duration: number;
  onMusicGenerated: (path: string) => void;
}

export function MusicPanel({
  projectId,
  duration,
  onMusicGenerated,
}: MusicPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [musicPath, setMusicPath] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  const presets = [
    "Upbeat electronic background music",
    "Calm ambient cinematic soundtrack",
    "Energetic pop instrumental",
    "Lo-fi chill study beats",
    "Epic orchestral trailer music",
    "Corporate motivational background",
  ];

  const handleGenerate = async () => {
    const finalPrompt = prompt.trim() || presets[0];
    setLoading(true);
    try {
      const result = await api.music.generate(
        projectId,
        finalPrompt,
        duration,
        undefined
      );
      setMusicPath(result.music_path);
      onMusicGenerated(result.music_path);
      toast.success("Music generated", "Background music is ready.");
    } catch (err: any) {
      toast.error("Music generation failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef) return;
    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="panel space-y-4">
      <div className="flex items-center gap-2">
        <Music className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Background Music</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Music Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the mood and style of music..."
            className="input-field min-h-[60px] text-sm resize-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setPrompt(preset)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] transition-all border",
                prompt === preset
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {preset}
            </button>
          ))}
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          className="w-full"
          leftIcon={<Wand2 className="w-4 h-4" />}
        >
          {loading ? "Generating Music..." : "Generate Music"}
        </Button>
      </div>

      {musicPath && (
        <div className="rounded-lg border border-border bg-secondary/50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Generated Music</span>
          </div>
          <audio
            ref={(el) => {
              if (el) {
                setAudioRef(el);
                el.onended = () => setIsPlaying(false);
              }
            }}
            src={`/api/media?path=${encodeURIComponent(musicPath)}`}
            className="w-full h-8"
            controls
          />
        </div>
      )}
    </div>
  );
}