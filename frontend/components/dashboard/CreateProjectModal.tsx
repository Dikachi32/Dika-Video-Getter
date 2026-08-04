"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prompt.trim()) return;

    setLoading(true);
    try {
      await api.projects.create({
        name: name.trim(),
        description: description.trim() || null,
        prompt: prompt.trim(),
        video_duration: 15,
        resolution: "1080x1920",
        subtitle_style: "modern-yellow",
        voice_id: "alloy",
      });
      toast.success("Project created", `"${name}" has been created successfully.`);
      setName("");
      setDescription("");
      setPrompt("");
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error("Failed to create project", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Create New Project
            </ModalTitle>
            <ModalDescription>
              Enter your video idea and let AI do the rest.
            </ModalDescription>
          </ModalHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., My First AI Video"
                className="input-field"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of your project"
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Video Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want the AI to create..."
                className="input-field min-h-[100px] resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                Be descriptive. The AI will generate a script and scenes from this.
              </p>
            </div>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftIcon={<Wand2 className="w-4 h-4" />}
            >
              Create Project
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}