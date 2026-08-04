"use client";

import { useState } from "react";
import {
  Wand2,
  Loader2,
  Sparkles,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  projectId: number;
  existingPrompt: string | null;
  existingScript: string | null;
  onScriptGenerated: (script: string) => void;
}

export function PromptInput({
  projectId,
  existingPrompt,
  existingScript,
  onScriptGenerated,
}: PromptInputProps) {
  const [prompt, setPrompt] = useState(existingPrompt || "");
  const [script, setScript] = useState(existingScript || "");
  const [generating, setGenerating] = useState(false);
  const [showScript, setShowScript] = useState(!!existingScript);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.warning("Empty prompt", "Please enter a video prompt first.");
      return;
    }

    setGenerating(true);
    try {
      const result = await api.video.generateScript(projectId, prompt.trim());
      setScript(result.script);
      setShowScript(true);
      onScriptGenerated(result.script);
      toast.success("Script generated", "Your video script is ready.");
    } catch (err: any) {
      toast.error("Script generation failed", err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const result = await api.video.generateScript(projectId, prompt.trim());
      setScript(result.script);
      onScriptGenerated(result.script);
      toast.success("Script regenerated", "A new script has been created.");
    } catch (err: any) {
      toast.error("Regeneration failed", err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="panel space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Prompt & Script</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Video Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the video you want to create..."
            className="input-field min-h-[80px] text-sm resize-none"
            disabled={generating}
          />
        </div>

        <Button
          onClick={script ? handleRegenerate : handleGenerate}
          loading={generating}
          className="w-full"
          leftIcon={script ? <RefreshCw className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
        >
          {generating
            ? "Generating Script..."
            : script
            ? "Regenerate Script"
            : "Generate Script"}
        </Button>
      </div>

      {script && (
        <div className="space-y-2">
          <button
            onClick={() => setShowScript(!showScript)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Generated Script
            {showScript ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          {showScript && (
            <div className="rounded-lg bg-secondary/50 border border-border p-4 max-h-[200px] overflow-y-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {script}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}