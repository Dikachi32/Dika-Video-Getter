"use client";

import Link from "next/link";
import {
  Film,
  Clock,
  Calendar,
  MoreVertical,
  Trash2,
  ExternalLink,
  Play,
} from "lucide-react";
import { Project } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onDelete: (project: Project) => void;
}

const statusConfig: Record<string, { label: string; variant: any }> = {
  draft: { label: "Draft", variant: "ghost" },
  script_generated: { label: "Script", variant: "default" },
  scenes_generated: { label: "Scenes", variant: "default" },
  video_generated: { label: "Video", variant: "warning" },
  voice_generated: { label: "Voice", variant: "warning" },
  subtitle_generated: { label: "Subtitles", variant: "warning" },
  music_generated: { label: "Music", variant: "warning" },
  thumbnail_generated: { label: "Thumbnail", variant: "warning" },
  merged: { label: "Merged", variant: "success" },
  exported: { label: "Exported", variant: "success" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status] || {
    label: "Unknown",
    variant: "ghost",
  };

  const hasVideo = !!project.output_video_path;

  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              hasVideo
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {hasVideo ? (
              <Play className="w-5 h-5" />
            ) : (
              <Film className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate pr-2">
              {project.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {project.description || "No description"}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-50 min-w-[160px] rounded-xl border border-border bg-popover p-1 shadow-xl"
          >
            <DropdownMenuItem
              onClick={() => onDelete(project)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 rounded-lg cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 outline-none"
            >
              <Trash2 className="w-4 h-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDuration(project.video_duration)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(project.created_at)}</span>
        </div>
        <Badge variant={status.variant} className="ml-auto">
          {status.label}
        </Badge>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2">
        <Link href={`/studio/${project.id}`} className="flex-1">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Open Studio
          </Button>
        </Link>
        {hasVideo && (
          <Button
            variant="outline"
            size="icon-sm"
            leftIcon={<Play className="w-3.5 h-3.5" />}
            onClick={() => {
              if (project.output_video_path) {
                window.open(`/api/media?path=${encodeURIComponent(project.output_video_path)}`, "_blank");
              }
            }}
          />
        )}
      </div>
    </div>
  );
}