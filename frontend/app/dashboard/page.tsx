"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Film, AlertCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { useProjects } from "@/hooks/useProjects";
import { api } from "@/lib/api";
import { Project } from "@/types";

export default function DashboardPage() {
  const { projects, loading, refresh } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    setDeleteError(null);
    try {
      await api.projects.delete(id);
      refresh();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete project");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage your AI video projects
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>

            {/* Delete Error */}
            {deleteError && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {deleteError}
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading projects...</span>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="panel flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Film className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Create your first AI video project. Enter a prompt and let the AI
                  generate your video from script to final export.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: Project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={refresh}
      />
    </div>
  );
}