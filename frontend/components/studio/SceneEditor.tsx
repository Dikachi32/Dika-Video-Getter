"use client";

import { useState } from "react";
import {
  Layers,
  Loader2,
  GripVertical,
  Trash2,
  Plus,
  Wand2,
  Play,
  ImageIcon,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Scene } from "@/types";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface SceneEditorProps {
  projectId: number;
  scenes: Scene[];
  onScenesChange: (scenes: Scene[]) => void;
}

export function SceneEditor({
  projectId,
  scenes,
  onScenesChange,
}: SceneEditorProps) {
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleGenerateSceneVideo = async (scene: Scene) => {
    setGeneratingId(scene.id);
    try {
      const result = await api.video.generateSceneVideo(
        projectId,
        scene.id,
        undefined
      );
      const updated = scenes.map((s) =>
        s.id === scene.id ? { ...s, video_path: result.video_path } : s
      );
      onScenesChange(updated);
      toast.success("Video generated", `Scene ${scene.order} is ready.`);
    } catch (err: any) {
      toast.error("Generation failed", err.message);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateAllVideos = async () => {
    const pending = scenes.filter((s) => !s.video_path);
    if (pending.length === 0) {
      toast.info("All scenes have videos");
      return;
    }
    setGeneratingAll(true);
    for (const scene of pending) {
      try {
        const result = await api.video.generateSceneVideo(
          projectId,
          scene.id,
          undefined
        );
        const updated = scenes.map((s) =>
          s.id === scene.id ? { ...s, video_path: result.video_path } : s
        );
        onScenesChange(updated);
      } catch (err: any) {
        toast.error(`Scene ${scene.order} failed`, err.message);
      }
    }
    setGeneratingAll(false);
    toast.success("All videos generated");
  };

  const handleDeleteScene = (sceneId: number) => {
    const updated = scenes.filter((s) => s.id !== sceneId);
    onScenesChange(updated);
    toast.success("Scene removed");
  };

  const handleUpdateScene = (sceneId: number, updates: Partial<Scene>) => {
    const updated = scenes.map((s) =>
      s.id === sceneId ? { ...s, ...updates } : s
    );
    onScenesChange(updated);
  };

  if (scenes.length === 0) {
    return (
      <div className="panel text-center py-8">
        <Layers className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground mb-1">No scenes yet</p>
        <p className="text-xs text-muted-foreground">
          Generate a script to create scenes automatically.
        </p>
      </div>
    );
  }

  const completedCount = scenes.filter((s) => s.video_path).length;

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Scenes ({scenes.length})</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {completedCount}/{scenes.length} videos
          </span>
          <Button
            size="sm"
            variant="outline"
            loading={generatingAll}
            onClick={handleGenerateAllVideos}
            leftIcon={<Wand2 className="w-3.5 h-3.5" />}
          >
            Generate All
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {scenes.map((scene) => {
          const isExpanded = expandedId === scene.id;
          const isGenerating = generatingId === scene.id;
          const hasVideo = !!scene.video_path;

          return (
            <div
              key={scene.id}
              className={cn(
                "rounded-lg border transition-all",
                hasVideo
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-border bg-secondary/20"
              )}
            >
              <div className="flex items-center gap-2 p-3">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <span className="text-xs font-mono text-muted-foreground w-6">
                  {scene.order}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    {scene.description}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : scene.id)}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
                <Button
                  size="icon-sm"
                  variant={hasVideo ? "outline" : "default"}
                  loading={isGenerating}
                  onClick={() => handleGenerateSceneVideo(scene)}
                  leftIcon={
                    hasVideo ? (
                      <Play className="w-3 h-3" />
                    ) : (
                      <Wand2 className="w-3 h-3" />
                    )
                  }
                />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => handleDeleteScene(scene.id)}
                  leftIcon={<Trash2 className="w-3 h-3 text-red-400" />}
                />
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      value={scene.description}
                      onChange={(e) =>
                        handleUpdateScene(scene.id, { description: e.target.value })
                      }
                      className="input-field text-xs min-h-[50px] resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Duration (s)
                      </label>
                      <input
                        type="number"
                        value={scene.duration}
                        onChange={(e) =>
                          handleUpdateScene(scene.id, {
                            duration: Number(e.target.value),
                          })
                        }
                        className="input-field text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Script Text
                      </label>
                      <input
                        type="text"
                        value={scene.script_text || ""}
                        onChange={(e) =>
                          handleUpdateScene(scene.id, {
                            script_text: e.target.value,
                          })
                        }
                        placeholder="Scene narration..."
                        className="input-field text-xs"
                      />
                    </div>
                  </div>
                  {hasVideo && scene.video_path && (
                    <div className="rounded-md overflow-hidden bg-black/50">
                      <video
                        src={`/api/media?path=${encodeURIComponent(scene.video_path)}`}
                        className="w-full h-28 object-cover"
                        controls
                        preload="metadata"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}