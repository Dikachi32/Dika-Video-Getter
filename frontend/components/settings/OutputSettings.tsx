"use client";

import { useState, useEffect } from "react";
import { Monitor, Clock, Type, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

const RESOLUTIONS = [
  { value: "1080x1920", label: "1080x1920 (9:16 Vertical)" },
  { value: "1920x1080", label: "1920x1080 (16:9 Horizontal)" },
  { value: "1080x1080", label: "1080x1080 (1:1 Square)" },
  { value: "720x1280", label: "720x1280 (9:16 Mobile)" },
];

const SUBTITLE_STYLES = [
  { value: "modern-yellow", label: "Modern Yellow" },
  { value: "classic-white", label: "Classic White" },
  { value: "bold-red", label: "Bold Red" },
  { value: "minimal-black", label: "Minimal Black" },
  { value: "neon-green", label: "Neon Green" },
  { value: "elegant-gold", label: "Elegant Gold" },
];

export function OutputSettings() {
  const { settings, loading, updateBatch } = useSettings();
  const [resolution, setResolution] = useState("1080x1920");
  const [duration, setDuration] = useState(15);
  const [subtitleStyle, setSubtitleStyle] = useState("modern-yellow");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.defaults) {
      setResolution(settings.defaults.DEFAULT_RESOLUTION || "1080x1920");
      setDuration(Number(settings.defaults.DEFAULT_VIDEO_DURATION) || 15);
      setSubtitleStyle(settings.defaults.DEFAULT_SUBTITLE_STYLE || "modern-yellow");
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    setError(null);

    try {
      await updateBatch({
        DEFAULT_RESOLUTION: resolution,
        DEFAULT_VIDEO_DURATION: String(duration),
        DEFAULT_SUBTITLE_STYLE: subtitleStyle,
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      setSaveStatus("error");
      setError(err.message || "Failed to save output settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Monitor className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Output Settings</h3>
          <p className="text-sm text-muted-foreground">
            Default video output configuration
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {saveStatus === "success" && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Output settings saved successfully
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            Default Resolution
          </label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="input-field"
            disabled={loading || saving}
          >
            {RESOLUTIONS.map((res) => (
              <option key={res.value} value={res.value}>
                {res.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Default Duration
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1 accent-primary"
              disabled={loading || saving}
            />
            <span className="text-sm font-medium w-16 text-right">{duration}s</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Type className="w-4 h-4 text-muted-foreground" />
            Default Subtitle Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SUBTITLE_STYLES.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setSubtitleStyle(style.value)}
                className={cn(
                  "px-3 py-2 rounded-lg border text-sm font-medium transition-all text-left",
                  subtitleStyle === style.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-secondary hover:border-primary/30"
                )}
                disabled={loading || saving}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className={cn(
              "btn-primary flex items-center gap-2",
              saving && "opacity-70"
            )}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Output Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}