"use client";

import { useEffect, useState } from "react";
import { Save, Key, Monitor } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    openai_key: "",
    elevenlabs_key: "",
    voice: "alloy",
    resolution: "1080x1920",
    duration: "15",
    subtitle_style: "modern-yellow",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.settings.getAll();
      setSettings(prev => ({
        ...prev,
        openai_key: res.api_keys?.OPENAI_API_KEY || "",
        elevenlabs_key: res.api_keys?.ELEVENLABS_API_KEY || "",
        voice: res.defaults?.DEFAULT_VOICE || "alloy",
        resolution: res.defaults?.DEFAULT_RESOLUTION || "1080x1920",
        duration: res.defaults?.DEFAULT_VIDEO_DURATION || "15",
        subtitle_style: res.defaults?.DEFAULT_SUBTITLE_STYLE || "modern-yellow",
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettings = async () => {
    await api.settings.batchUpdate({
      OPENAI_API_KEY: settings.openai_key,
      ELEVENLABS_API_KEY: settings.elevenlabs_key,
      DEFAULT_VOICE: settings.voice,
      DEFAULT_RESOLUTION: settings.resolution,
      DEFAULT_VIDEO_DURATION: settings.duration,
      DEFAULT_SUBTITLE_STYLE: settings.subtitle_style,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (field: string, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="space-y-6">
              <div className="panel">
                <div className="flex items-center gap-3 mb-6">
                  <Key className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">API Keys</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
                    <input
                      type="password"
                      value={settings.openai_key}
                      onChange={(e) => updateField("openai_key", e.target.value)}
                      placeholder="sk-..."
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ElevenLabs API Key</label>
                    <input
                      type="password"
                      value={settings.elevenlabs_key}
                      onChange={(e) => updateField("elevenlabs_key", e.target.value)}
                      placeholder="..."
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="flex items-center gap-3 mb-6">
                  <Monitor className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Default Settings</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Video Duration (seconds)</label>
                    <input
                      type="number"
                      value={settings.duration}
                      onChange={(e) => updateField("duration", e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Resolution</label>
                    <select
                      value={settings.resolution}
                      onChange={(e) => updateField("resolution", e.target.value)}
                      className="input-field"
                    >
                      <option value="1080x1920">1080x1920 (9:16)</option>
                      <option value="1920x1080">1920x1080 (16:9)</option>
                      <option value="1080x1080">1080x1080 (1:1)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Voice</label>
                    <select
                      value={settings.voice}
                      onChange={(e) => updateField("voice", e.target.value)}
                      className="input-field"
                    >
                      <option value="alloy">Alloy</option>
                      <option value="echo">Echo</option>
                      <option value="fable">Fable</option>
                      <option value="onyx">Onyx</option>
                      <option value="nova">Nova</option>
                      <option value="shimmer">Shimmer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subtitle Style</label>
                    <select
                      value={settings.subtitle_style}
                      onChange={(e) => updateField("subtitle_style", e.target.value)}
                      className="input-field"
                    >
                      <option value="modern-yellow">Modern Yellow</option>
                      <option value="clean-white">Clean White</option>
                      <option value="bold-red">Bold Red</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={saveSettings}
                className="btn-primary flex items-center gap-2 w-full justify-center"
              >
                <Save className="w-4 h-4" />
                {saved ? "Saved!" : "Save Settings"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}