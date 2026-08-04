"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Combine,
  Download,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { PromptInput } from "@/components/studio/PromptInput";
import { SceneEditor } from "@/components/studio/SceneEditor";
import { PreviewWindow } from "@/components/studio/PreviewWindow";
import { VoicePanel } from "@/components/studio/VoicePanel";
import { MusicPanel } from "@/components/studio/MusicPanel";
import { SubtitlePanel } from "@/components/studio/SubtitlePanel";
import { ThumbnailPanel } from "@/components/studio/ThumbnailPanel";
import { VideoPanel } from "@/components/studio/VideoPanel";
import { WorkflowTimeline } from "@/components/studio/WorkflowTimeline";
import { SkeletonScene } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Project, Scene, WorkflowState, WorkflowStep } from "@/types";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export default function StudioPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowState>({
    currentStep: "prompt",
    completedSteps: [],
    isProcessing: false,
    error: null,
  });

  const [voicePath, setVoicePath] = useState<string | null>(null);
  const [musicPath, setMusicPath] = useState<string | null>(null);
  const [subtitlePath, setSubtitlePath] = useState<string | null>(null);
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);
  const [assembling, setAssembling] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const p = await api.projects.get(projectId);
      setProject(p);
      updateWorkflowFromStatus(p.status);
      if (p.output_video_path) setVoicePath(p.output_video_path);
    } catch (err: any) {
      setError(err.message || "Failed to load project");
    }
  }, [projectId]);

  const fetchScenes = useCallback(async () => {
    try {
      const s = await api.projects.getScenes(projectId);
      setScenes(s);
    } catch (err) {
      console.error("Failed to load scenes:", err);
    }
  }, [projectId]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchProject(), fetchScenes()]);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [fetchProject, fetchScenes]);

  const updateWorkflowFromStatus = (status: string) => {
    const stepMap: Record<string, WorkflowStep> = {
      draft: "prompt",
      script_generated: "script",
      scenes_generated: "scenes",
      video_generated: "video",
      voice_generated: "voice",
      subtitle_generated: "subtitle",
      music_generated: "music",
      thumbnail_generated: "thumbnail",
      merged: "merge",
      exported: "export",
    };

    const current = stepMap[status] || "prompt";
    const allSteps: WorkflowStep[] = [
      "prompt", "script", "scenes", "video", "voice",
      "subtitle", "music", "thumbnail", "merge", "export",
    ];
    const completedIndex = allSteps.indexOf(current);
    const completed = completedIndex > 0 ? allSteps.slice(0, completedIndex) : [];

    setWorkflow({
      currentStep: current,
      completedSteps: completed,
      isProcessing: false,
      error: null,
    });
  };

  const handleScriptGenerated = async (script: string) => {
    setWorkflow((w) => ({
      ...w,
      currentStep: "script",
      completedSteps: [...w.completedSteps, "prompt"],
    }));
    try {
      await api.projects.update(projectId, { script });
      await api.video.generateScenes(projectId, script);
      await fetchScenes();
      setWorkflow((w) => ({
        ...w,
        currentStep: "scenes",
        completedSteps: [...w.completedSteps, "script"],
      }));
      await fetchProject();
      toast.success("Script & scenes generated", "Your video structure is ready.");
    } catch (err: any) {
      setWorkflow((w) => ({ ...w, error: err.message }));
      toast.error("Generation failed", err.message);
    }
  };

  const handleScenesChange = (newScenes: Scene[]) => {
    setScenes(newScenes);
  };

  const handleSceneUpdate = (updatedScene: Scene) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === updatedScene.id ? updatedScene : s))
    );
  };

  const handleAssemble = async () => {
    const sceneVideos = scenes
      .map((s) => s.video_path)
      .filter(Boolean) as string[];
    if (sceneVideos.length === 0) {
      toast.warning("No videos", "Generate scene videos before assembling.");
      return;
    }

    setAssembling(true);
    setWorkflow((w) => ({ ...w, isProcessing: true, error: null }));

    try {
      await api.video.assemble({
        project_id: projectId,
        scene_video_paths: sceneVideos,
        voice_path: voicePath || undefined,
        music_path: musicPath || undefined,
        subtitle_path: subtitlePath || undefined,
        subtitle_style: project?.subtitle_style || "modern-yellow",
      });

      setWorkflow((w) => ({
        ...w,
        currentStep: "merge",
        completedSteps: [
          ...w.completedSteps,
          "video",
          "voice",
          "subtitle",
          "music",
          "thumbnail",
        ],
        isProcessing: false,
      }));
      await fetchProject();
      toast.success("Video assembled", "Your final video is ready for export.");
    } catch (err: any) {
      setWorkflow((w) => ({ ...w, error: err.message, isProcessing: false }));
      toast.error("Assembly failed", err.message);
    } finally {
      setAssembling(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setWorkflow((w) => ({ ...w, isProcessing: true, error: null }));

    try {
      await api.video.export(projectId, "high");
      setWorkflow((w) => ({
        ...w,
        currentStep: "export",
        completedSteps: [...w.completedSteps, "merge"],
        isProcessing: false,
      }));
      await fetchProject();
      toast.success("Export complete", "Your MP4 has been saved.");
    } catch (err: any) {
      setWorkflow((w) => ({ ...w, error: err.message, isProcessing: false }));
      toast.error("Export failed", err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading studio...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-screen bg-background">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="panel text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || "This project does not exist."}
              </p>
              <Link href="/dashboard">
                <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb & Mobile Toggle */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-foreground font-medium truncate max-w-[200px] lg:max-w-xs">
                  {project.name}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
              {/* Left Column - Workflow */}
              <div className="xl:col-span-3 space-y-4 lg:space-y-6">
                <WorkflowTimeline state={workflow} />
              </div>

              {/* Center Column - Main Workspace */}
              <div className="xl:col-span-6 space-y-4 lg:space-y-6">
                <PromptInput
                  projectId={projectId}
                  existingPrompt={project.prompt}
                  existingScript={project.script}
                  onScriptGenerated={handleScriptGenerated}
                />

                <VideoPanel
                  projectId={projectId}
                  scenes={scenes}
                  onSceneUpdate={handleSceneUpdate}
                />

                <SceneEditor
                  projectId={projectId}
                  scenes={scenes}
                  onScenesChange={handleScenesChange}
                />

                <PreviewWindow
                  videoPath={project.output_video_path}
                  projectName={project.name}
                />

                {/* Assemble & Export Actions */}
                <div className="panel flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    onClick={handleAssemble}
                    loading={assembling}
                    disabled={scenes.filter((s) => s.video_path).length === 0}
                    className="flex-1 w-full sm:w-auto"
                    leftIcon={<Combine className="w-4 h-4" />}
                  >
                    {assembling ? "Assembling..." : "Assemble Video"}
                  </Button>
                  <Button
                    onClick={handleExport}
                    loading={exporting}
                    disabled={!project.output_video_path}
                    variant="secondary"
                    className="flex-1 w-full sm:w-auto"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    {exporting ? "Exporting..." : "Export MP4"}
                  </Button>
                </div>
              </div>

              {/* Right Column - Assets */}
              <div className="xl:col-span-3 space-y-4 lg:space-y-6">
                <VoicePanel
                  projectId={projectId}
                  scriptText={project.script}
                  voiceId={project.voice_id}
                  onVoiceGenerated={setVoicePath}
                />
                <MusicPanel
                  projectId={projectId}
                  duration={project.video_duration}
                  onMusicGenerated={setMusicPath}
                />
                <SubtitlePanel
                  projectId={projectId}
                  scriptText={project.script}
                  duration={project.video_duration}
                  subtitleStyle={project.subtitle_style}
                  onSubtitlesGenerated={setSubtitlePath}
                />
                <ThumbnailPanel
                  projectId={projectId}
                  onThumbnailGenerated={setThumbnailPath}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}