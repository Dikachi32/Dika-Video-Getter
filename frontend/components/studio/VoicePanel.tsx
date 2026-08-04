"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  Loader2,
  Wand2,
  Volume2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
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

interface VoicePanelProps {
  projectId: number;
  scriptText: string | null;
  voiceId: string;
  onVoiceGenerated: (path: string) => void;
}

interface VoiceOption {
  id: string;
  name: string;
  preview_url?: string;
  gender?: string;
  accent?: string;
}

export function VoicePanel({
  projectId,
  scriptText,
  voiceId,
  onVoiceGenerated,
}: VoicePanelProps) {
  const [loading, setLoading] = useState(false);
  const [voicePath, setVoicePath] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(voiceId);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchVoices() {
      setVoicesLoading(true);
      try {
        const result = await api.voice.list();
        setVoices(result.voices || defaultVoices);
      } catch {
        setVoices(defaultVoices);
      } finally {
        setVoicesLoading(false);
      }
    }
    fetchVoices();
  }, []);

  const defaultVoices: VoiceOption[] = [
    { id: "alloy", name: "Alloy", gender: "Neutral" },
    { id: "echo", name: "Echo", gender: "Male" },
    { id: "fable", name: "Fable", gender: "Male" },
    { id: "onyx", name: "Onyx", gender: "Male" },
    { id: "nova", name: "Nova", gender: "Female" },
    { id: "shimmer", name: "Shimmer", gender: "Female" },
  ];

  const handleGenerate = async () => {
    if (!scriptText) {
      toast.warning("No script", "Generate a script first before creating voiceover.");
      return;
    }

    setLoading(true);
    try {
      const result = await api.voice.generate(
        projectId,
        scriptText,
        selectedVoice,
        undefined
      );
      setVoicePath(result.voice_path || result.audio_path);
      onVoiceGenerated(result.voice_path || result.audio_path);
      toast.success("Voice generated", `Using voice: ${selectedVoice}`);
    } catch (err: any) {
      toast.error("Voice generation failed", err.message);
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
        <Mic className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">AI Voice</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Voice
          </label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{voice.name}</span>
                    {voice.gender && (
                      <span className="text-muted-foreground text-xs">
                        ({voice.gender})
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          className="w-full"
          leftIcon={<Wand2 className="w-4 h-4" />}
          disabled={!scriptText}
        >
          {loading ? "Generating Voice..." : "Generate Voiceover"}
        </Button>
      </div>

      {voicePath && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">
              Voiceover Ready
            </span>
          </div>
          <audio
            ref={(el) => {
              if (el) {
                setAudioRef(el);
                el.onended = () => setIsPlaying(false);
              }
            }}
            src={`/api/media?path=${encodeURIComponent(voicePath)}`}
            className="w-full h-8"
            controls
          />
        </div>
      )}

      {!scriptText && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400">
            Generate a script first to create voiceover.
          </p>
        </div>
      )}
    </div>
  );
}