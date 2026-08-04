"use client";

import { useState } from "react";
import {
  Video,
  Loader2,
  Play,
  Wand2,
  CheckCircle,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { Scene } from "@/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface VideoPanelProps {
  projectId: number;
  scenes: Scene[];
  onSceneUpdate: (scene: Scene) => void;
}

export function VideoPanel({ projectId, scenes, onSceneUpdate }: VideoPanelProps) {
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);

  const handleGenerateScene = async (scene: Scene) => {
    setGeneratingId(scene.id);
    try {
      const result = await api.video.generateSceneVideo(
        projectId,
        scene.id,
        undefined // auto-select engine
      );
      const updatedScene = { ...scene, video_path: result.video_path };
      onSceneUpdate(updatedScene);
      toast.success("Scene video generated", `Scene ${scene.order} is ready.`);
    } catch (err: any) {
      toast.error("Generation failed", err.message);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateAll = async () => {
    const pendingScenes = scenes.filter((s) => !s.video_path);
    if (pendingScenes.length === 0) {
      toast.info("All scenes already have videos");
      return;
    }

    setGeneratingAll(true);
    for (const scene of pendingScenes) {
      try {
        const result = await api.video.generateSceneVideo(
          projectId,
          scene.id,
          undefined
        );
        const updatedScene = { ...scene, video_path: result.video_path };
        onSceneUpdate(updatedScene);
      } catch (err: any) {
        toast.error(`Scene ${scene.order} failed`, err.message);
      }
    }
    setGeneratingAll(false);
    toast.success("Batch complete", "All pending scenes have been processed.");
  };

  const completedCount = scenes.filter((s) => s.video_path).length;
  const allComplete = scenes.length > 0 && completedCount === scenes.length;

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Scene Videos</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={allComplete ? "success" : "default"}>
            {completedCount}/{scenes.length}
          </Badge>
          {scenes.length > 0 && !allComplete && (
            <Button
              size="sm"
              variant="outline"
              loading={generatingAll}
              onClick={handleGenerateAll}
              leftIcon={<Wand2 className="w-3.5 h-3.5" />}
            >
              Generate All
            </Button>
          )}
        </div>
      </div>

      {scenes.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No scenes yet. Generate a script first.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {scenes.map((scene) => {
            const isGenerating = generatingId === scene.id;
            const hasVideo = !!scene.video_path;

            return (
              <div
                key={scene.id}
                className={cn(
                  "rounded-lg border p-3 transition-all",
                  hasVideo
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-border bg-secondary/30"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{scene.order}
                      </span>
                      {hasVideo ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {scene.description}
                    </p>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      {scene.duration}s
                    </span>
                  </div>
                  <Button
                    size="icon-sm"
                    variant={hasVideo ? "outline" : "default"}
                    loading={isGenerating}
                    onClick={() => handleGenerateScene(scene)}
                    leftIcon={
                      hasVideo ? (
                        <Play className="w-3.5 h-3.5" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )
                    }
                  />
                </div>
                {hasVideo && scene.video_path && (
                  <div className="mt-2 rounded-md overflow-hidden bg-black/50">
                    <video
                      src={`/api/media?path=${encodeURIComponent(scene.video_path)}`}
                      className="w-full h-24 object-cover"
                      controls
                      preload="metadata"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}