"use client";

import { useState, useEffect } from "react";
import {
  Subtitles,
  Loader2,
  Wand2,
  Type,
  Palette,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface SubtitlePanelProps {
  projectId: number;
  scriptText: string | null;
  duration: number;
  subtitleStyle: string;
  onSubtitlesGenerated: (path: string) => void;
}

const styleOptions = [
  { value: "modern-yellow", label: "Modern Yellow", preview: "bg-yellow-400 text-black" },
  { value: "classic-white", label: "Classic White", preview: "bg-white text-black" },
  { value: "bold-red", label: "Bold Red", preview: "bg-red-500 text-white" },
  { value: "minimal-black", label: "Minimal Black", preview: "bg-black/80 text-white" },
  { value: "gradient-purple", label: "Gradient Purple", preview: "bg-gradient-to-r from-purple-500 to-pink-500 text-white" },
  { value: "neon-green", label: "Neon Green", preview: "bg-emerald-400 text-black" },
];

export function SubtitlePanel({
  projectId,
  scriptText,
  duration,
  subtitleStyle,
  onSubtitlesGenerated,
}: SubtitlePanelProps) {
  const [loading, setLoading] = useState(false);
  const [subtitlePath, setSubtitlePath] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(subtitleStyle);
  const [styles, setStyles] = useState<string[]>([]);
  const [stylesLoading, setStylesLoading] = useState(false);

  useEffect(() => {
    async function fetchStyles() {
      setStylesLoading(true);
      try {
        const result = await api.subtitles.styles();
        setStyles(result.styles || styleOptions.map((s) => s.value));
      } catch {
        setStyles(styleOptions.map((s) => s.value));
      } finally {
        setStylesLoading(false);
      }
    }
    fetchStyles();
  }, []);

  const handleGenerate = async () => {
    if (!scriptText) {
      toast.warning("No script", "Generate a script first before creating subtitles.");
      return;
    }

    setLoading(true);
    try {
      const result = await api.subtitles.fromScript(
        projectId,
        scriptText,
        duration
      );
      setSubtitlePath(result.subtitle_path);
      onSubtitlesGenerated(result.subtitle_path);
      toast.success("Subtitles generated", `Style: ${selectedStyle}`);
    } catch (err: any) {
      toast.error("Subtitle generation failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentStyle = styleOptions.find((s) => s.value === selectedStyle);

  return (
    <div className="panel space-y-4">
      <div className="flex items-center gap-2">
        <Subtitles className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Subtitles</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Palette className="w-3 h-3" />
            Subtitle Style
          </label>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent>
              {styleOptions.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-sm border border-white/20",
                        style.preview
                      )}
                    />
                    <span>{style.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentStyle && (
          <div className="rounded-lg p-3 border border-border bg-black/30">
            <p className="text-[10px] text-muted-foreground mb-2">Preview</p>
            <div className="flex justify-center">
              <span
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-bold",
                  currentStyle.preview
                )}
              >
                Sample Subtitle Text
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          loading={loading}
          className="w-full"
          leftIcon={<Wand2 className="w-4 h-4" />}
          disabled={!scriptText}
        >
          {loading ? "Generating Subtitles..." : "Generate Subtitles"}
        </Button>
      </div>

      {subtitlePath && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400">Subtitles ready</span>
        </div>
      )}

      {!scriptText && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
          <Type className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400">
            Generate a script first to create subtitles.
          </p>
        </div>
      )}
    </div>
  );
}