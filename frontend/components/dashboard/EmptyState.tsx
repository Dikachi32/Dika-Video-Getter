"use client";

import { Film, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Film className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">No Projects Yet</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Start your first AI video project. Enter a prompt and let the AI generate
        a complete video with script, scenes, voice, music, and subtitles.
      </p>
      <Button
        onClick={onCreate}
        size="lg"
        leftIcon={<Plus className="w-5 h-5" />}
      >
        Create First Project
      </Button>
    </div>
  );
}