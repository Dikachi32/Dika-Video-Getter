"use client";

import { useState } from "react";
import { Key, Eye, EyeOff, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

export function ApiKeySettings() {
  const { settings, loading, updateBatch } = useSettings();
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showElevenLabs, setShowElevenLabs] = useState(false);
  const [openaiKey, setOpenaiKey] = useState("");
  const [elevenlabsKey, setElevenlabsKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    setError(null);

    try {
      const updates: Record<string, string> = {};
      if (openaiKey.trim()) updates["OPENAI_API_KEY"] = openaiKey.trim();
      if (elevenlabsKey.trim()) updates["ELEVENLABS_API_KEY"] = elevenlabsKey.trim();

      if (Object.keys(updates).length === 0) {
        setError("Please enter at least one API key");
        setSaving(false);
        return;
      }

      await updateBatch(updates);
      setSaveStatus("success");
      setOpenaiKey("");
      setElevenlabsKey("");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      setSaveStatus("error");
      setError(err.message || "Failed to save API keys");
    } finally {
      setSaving(false);
    }
  };

  const currentOpenAI = settings?.api_keys?.OPENAI_API_KEY
    ? "••••••••" + settings.api_keys.OPENAI_API_KEY.slice(-4)
    : "Not set";
  const currentElevenLabs = settings?.api_keys?.ELEVENLABS_API_KEY
    ? "••••••••" + settings.api_keys.ELEVENLABS_API_KEY.slice(-4)
    : "Not set";

  return (
    <div className="panel">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Key className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">API Keys</h3>
          <p className="text-sm text-muted-foreground">
            Configure cloud AI engine credentials
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
          API keys saved successfully
        </div>
      )}

      <div className="space-y-6">
        {/* OpenAI */}
        <div>
          <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-muted-foreground">
              {currentOpenAI}
            </div>
          </div>
          <div className="relative">
            <input
              type={showOpenAI ? "text" : "password"}
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="input-field pr-10"
              disabled={loading || saving}
            />
            <button
              type="button"
              onClick={() => setShowOpenAI(!showOpenAI)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showOpenAI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Required for script generation, scene creation, and image generation.
          </p>
        </div>

        {/* ElevenLabs */}
        <div>
          <label className="block text-sm font-medium mb-2">ElevenLabs API Key</label>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-muted-foreground">
              {currentElevenLabs}
            </div>
          </div>
          <div className="relative">
            <input
              type={showElevenLabs ? "text" : "password"}
              value={elevenlabsKey}
              onChange={(e) => setElevenlabsKey(e.target.value)}
              placeholder="..."
              className="input-field pr-10"
              disabled={loading || saving}
            />
            <button
              type="button"
              onClick={() => setShowElevenLabs(!showElevenLabs)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showElevenLabs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Required for high-quality voice synthesis. Falls back to OpenAI TTS if not set.
          </p>
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
                Save API Keys
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}