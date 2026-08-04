"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
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
import { Project } from "@/types";
import { toast } from "@/components/ui/Toast";

interface DeleteConfirmModalProps {
  project: Project | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteConfirmModal({
  project,
  open,
  onClose,
  onDeleted,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!project) return;
    if (confirmText !== project.name) return;

    setLoading(true);
    try {
      await api.projects.delete(project.id);
      toast.success("Project deleted", `"${project.name}" has been permanently deleted.`);
      setConfirmText("");
      onDeleted();
      onClose();
    } catch (err: any) {
      toast.error("Failed to delete", err.message);
    } finally {
      setLoading(false);
    }
  };

  const isConfirmed = project ? confirmText === project.name : false;

  return (
    <Modal open={open} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete Project
          </ModalTitle>
          <ModalDescription>
            This action cannot be undone. This will permanently delete the project
            and all associated files.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
            <p className="text-sm text-destructive/80">
              To confirm, type <strong className="text-destructive">{project?.name}</strong> below:
            </p>
          </div>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type project name to confirm"
            className="input-field"
            disabled={loading}
          />
        </div>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={loading}
            disabled={!isConfirmed}
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={handleDelete}
          >
            Delete Forever
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}