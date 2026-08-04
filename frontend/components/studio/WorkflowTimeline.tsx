"use client";

import {
  Type,
  FileText,
  Layers,
  Video,
  Mic,
  Subtitles,
  Music,
  Image,
  Combine,
  Download,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { WorkflowState, WorkflowStep } from "@/types";
import { cn } from "@/lib/utils";

const steps: { id: WorkflowStep; label: string; icon: React.ElementType }[] = [
  { id: "prompt", label: "Prompt", icon: Type },
  { id: "script", label: "Script", icon: FileText },
  { id: "scenes", label: "Scenes", icon: Layers },
  { id: "video", label: "Video", icon: Video },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "subtitle", label: "Subtitles", icon: Subtitles },
  { id: "music", label: "Music", icon: Music },
  { id: "thumbnail", label: "Thumbnail", icon: Image },
  { id: "merge", label: "Merge", icon: Combine },
  { id: "export", label: "Export", icon: Download },
];

interface WorkflowTimelineProps {
  state: WorkflowState;
}

export function WorkflowTimeline({ state }: WorkflowTimelineProps) {
  const currentIndex = steps.findIndex((s) => s.id === state.currentStep);

  return (
    <div className="panel">
      <h3 className="font-semibold text-sm mb-4">Workflow</h3>
      <div className="space-y-1">
        {steps.map((step, index) => {
          const isCompleted = state.completedSteps.includes(step.id);
          const isCurrent = step.id === state.currentStep;
          const isPending = index > currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                isCurrent && "bg-primary/10 border border-primary/20",
                isCompleted && "opacity-70",
                isPending && "opacity-40"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all",
                  isCompleted
                    ? "bg-emerald-500/10 text-emerald-400"
                    : isCurrent
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent && state.isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrent && state.error ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {isCurrent && state.error && (
                <span className="text-[10px] text-red-400 truncate max-w-[80px]">
                  Error
                </span>
              )}
            </div>
          );
        })}
      </div>

      {state.error && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{state.error}</p>
        </div>
      )}
    </div>
  );
}