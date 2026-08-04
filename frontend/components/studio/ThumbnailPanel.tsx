"use client";

import { useState } from "react";
import {
  Image,
  Loader2,
  Wand2,
  Camera,
  CheckCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface ThumbnailPanelProps {
  projectId: number;
  onThumbnailGenerated: (path: string) => void;
}

const thumbnailPresets = [
  "Cinematic dramatic lighting, professional quality",
  "Bright and colorful, eye-catching social media style",
  "Dark moody atmosphere, mysterious and intriguing",
  "Clean minimal design, modern aesthetic",
  "Action-packed dynamic composition, high energy",
  "Warm golden hour lighting, emotional storytelling",
];

export function ThumbnailPanel({
  projectId,
  onThumbnailGenerated,
}: ThumbnailPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"generate" | "extract">("generate");
  const [videoPath, setVideoPath] = useState("");
  const [timestamp, setTimestamp] = useState("00:00:01");

  const handleGenerate = async () => {
    const finalPrompt = prompt.trim() || thumbnailPresets[0];
    setLoading(true);
    try {
      const result = await api.thumbnails.generate(
        projectId,
        finalPrompt,
        undefined
      );
      setThumbnailPath(result.thumbnail_path);
      onThumbnailGenerated(result.thumbnail_path);
      toast.success("Thumbnail generated", "Your thumbnail is ready.");
    } catch (err: any) {
      toast.error("Thumbnail generation failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    if (!videoPath) {
      toast.warning("No video path", "Please provide a video path to extract from.");
      return;
    }
    setLoading(true);
    try {
      const result = await api.thumbnails.extract(
        projectId,
        videoPath,
        timestamp
      );
      setThumbnailPath(result.thumbnail_path);
      onThumbnailGenerated(result.thumbnail_path);
      toast.success("Thumbnail extracted", `Frame at ${timestamp} captured.`);
    } catch (err: any) {
      toast.error("Extraction failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel space-y-4">
      <div className="flex items-center gap-2">
        <Image className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Thumbnail</h3>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-secondary p-1">
        <button
          onClick={() => setActiveTab("generate")}
          className={cn(
            "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
            activeTab === "generate"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Wand2 className="w-3 h-3 inline mr-1" />
          AI Generate
        </button>
        <button
          onClick={() => setActiveTab("extract")}
          className={cn(
            "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
            activeTab === "extract"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Camera className="w-3 h-3 inline mr-1" />
          Extract Frame
        </button>
      </div>

      {activeTab === "generate" ? (
        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your ideal thumbnail..."
            className="input-field min-h-[60px] text-sm resize-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {thumbnailPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setPrompt(preset)}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] transition-all border",
                  prompt === preset
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {preset.length > 35 ? preset.slice(0, 35) + "..." : preset}
              </button>
            ))}
          </div>
          <Button
            onClick={handleGenerate}
            loading={loading}
            className="w-full"
            leftIcon={<Wand2 className="w-4 h-4" />}
          >
            {loading ? "Generating..." : "Generate Thumbnail"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Video Path
            </label>
            <input
              type="text"
              value={videoPath}
              onChange={(e) => setVideoPath(e.target.value)}
              placeholder="/path/to/video.mp4"
              className="input-field text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Timestamp (HH:MM:SS)
            </label>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="00:00:01"
              className="input-field text-sm font-mono"
            />
          </div>
          <Button
            onClick={handleExtract}
            loading={loading}
            className="w-full"
            variant="secondary"
            leftIcon={<Camera className="w-4 h-4" />}
          >
            Extract Frame
          </Button>
        </div>
      )}

      {thumbnailPath && (
        <div className="space-y-2">
          <div className="rounded-lg border border-emerald-500/20 overflow-hidden">
            <img
              src={`/api/media?path=${encodeURIComponent(thumbnailPath)}`}
              alt="Generated thumbnail"
              className="w-full h-32 object-cover"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400">Ready</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => {
                  setThumbnailPath(null);
                  setPrompt("");
                }}
                leftIcon={<RefreshCw className="w-3 h-3" />}
              />
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = `/api/media?path=${encodeURIComponent(thumbnailPath)}`;
                  link.download = "thumbnail.png";
                  link.click();
                }}
                leftIcon={<Download className="w-3 h-3" />}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}