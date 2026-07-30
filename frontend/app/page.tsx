"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Film, Clock, ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useProjects } from "@/hooks/useProjects";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Project } from "@/types";

export default function Dashboard() {
  const { projects, loading, refresh } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectPrompt, setNewProjectPrompt] = useState("");

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    await api.projects.create({
      name: newProjectName,
      prompt: newProjectPrompt,
    });

    setShowModal(false);
    setNewProjectName("");
    setNewProjectPrompt("");
    refresh();
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
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

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : projects.length === 0 ? (
              <div className="panel flex flex-col items-center justify-center py-20 text-center">
                <Film className="w-16 h-16 text-muted mb-4" />
                <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Create your first AI video project. Enter a prompt and let the AI generate your video.
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
                  <div
                    key={project.id}
                    className="panel hover:border-primary/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Film className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground capitalize">
                        {project.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-1 truncate">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.prompt || "No prompt provided"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.video_duration}s
                      </div>
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                    <Link
                      href={`/studio/${project.id}`}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-secondary hover:bg-primary hover:text-white transition-all text-sm font-medium"
                    >
                      Open Studio
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="panel w-full max-w-lg animate-slide-up">
            <h3 className="text-xl font-bold mb-4">Create New Project</h3>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My AI Video"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Video Prompt</label>
                <textarea
                  value={newProjectPrompt}
                  onChange={(e) => setNewProjectPrompt(e.target.value)}
                  placeholder="Describe the video you want to create..."
                  className="input-field h-32 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}