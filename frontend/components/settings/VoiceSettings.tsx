"use client";

import { useState, useEffect } from "react";
import { Mic, Volume2, Save, AlertCircle, CheckCircle2, Play } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

const VOICES = [
  { value: "alloy", label: "Alloy", desc: "Balanced, versatile" },
  { value: "echo", label: "Echo", desc: "Warm, approachable" },
  { value: "fable", label: "Fable", desc: "British, refined" },
  { value: "onyx", label: "Onyx", desc: "Deep, authoritative" },
  { value: "nova", label: "Nova", desc: "Clear, professional" },
  { value: "shimmer", label: "Shimmer", desc: "Bright, energetic" },
];

export function VoiceSettings() {
  const { settings, loading, updateBatch } = useSettings();
  const [voiceId, setVoiceId] = useState("alloy");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings?.defaults) {
      setVoiceId(settings.defaults.DEFAULT_VOICE || "alloy");
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    setError(null);

    try {
      await updateBatch({
        DEFAULT_VOICE: voiceId,
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      setSaveStatus("error");
      setError(err.message || "Failed to save voice settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="panel">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Mic className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Voice Settings</h3>
          <p className="text-sm text-muted-foreground">
            Default voice for AI-generated narration
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
          Voice settings saved successfully
        </div>
      )}

      <div className="space-y-4">
        {VOICES.map((voice) => (
          <button
            key={voice.value}
            type="button"
            onClick={() => setVoiceId(voice.value)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
              voiceId === voice.value
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary hover:border-primary/30"
            )}
            disabled={loading || saving}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                voiceId === voice.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {voiceId === voice.value ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{voice.label}</div>
              <div className="text-sm text-muted-foreground">{voice.desc}</div>
            </div>
            {voiceId === voice.value && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </button>
        ))}
      </div>

      <div className="pt-4">
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
              Save Voice Preference
            </>
          )}
        </button>
      </div>
    </div>
  );
}