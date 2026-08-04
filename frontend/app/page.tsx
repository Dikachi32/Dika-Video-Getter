"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  AlertCircle,
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { HealthCheckWidget } from "@/components/dashboard/HealthCheckWidget";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types";

export default function DashboardPage() {
  const { projects, loading, refresh } = useProjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (project: Project) => {
    setDeleteProject(project);
    setDeleteOpen(true);
  };

  const handleDeleted = () => refresh();
  const handleCreated = () => refresh();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your AI video projects
                </p>
              </div>
              <Button
                onClick={() => setCreateOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                New Project
              </Button>
            </div>

            {/* Health Check Widget */}
            <div className="mb-6">
              <HealthCheckWidget />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="input-field pl-10 w-full sm:w-80"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <SkeletonDashboard count={6} />
            ) : filteredProjects.length === 0 ? (
              searchQuery ? (
                <div className="text-center py-20">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No projects match &quot;{searchQuery}&quot;
                  </p>
                </div>
              ) : (
                <EmptyState onCreate={() => setCreateOpen(true)} />
              )
            ) : (
              <div
                className={`grid gap-4 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      <DeleteConfirmModal
        project={deleteProject}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteProject(null);
        }}
        onDeleted={handleDeleted}
      />
    </div>
  );
}