"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  Play, Mic, Music, Type, 
  Image, Download, Wand2, FileText, Layers, Merge
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { api } from "@/lib/api";
import { Project, Scene, WorkflowStep } from "@/types";

const workflowSteps: { id: WorkflowStep; label: string; icon: any }[] = [
  { id: "prompt", label: "Prompt", icon: FileText },
  { id: "script", label: "Script", icon: FileText },
  { id: "scenes", label: "Scenes", icon: Layers },
  { id: "video", label: "Video", icon: Play },
  { id: "voice", label: "Voice", icon: Mic },
  { id: "subtitle", label: "Subtitle", icon: Type },
  { id: "music", label: "Music", icon: Music },
  { id: "thumbnail", label: "Thumbnail", icon: Image },
  { id: "merge", label: "Merge", icon: Merge },
  { id: "export", label: "Export", icon: Download },
];

export default function StudioPage() {
  const params = useParams();
  const projectId = Number(params.projectId);

  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeTab, setActiveTab] = useState<WorkflowStep>("prompt");
  const [processing, setProcessing] = useState(false);
  const [generatedScript, setGeneratedScript] = useState("");

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const p = await api.projects.get(projectId);
      setProject(p);
      setGeneratedScript(p.script || "");
      const s = await api.projects.getScenes(projectId);
      setScenes(s);
    } catch (e) {
      console.error(e);
    }
  };

  const generateScript = async () => {
    if (!project?.prompt) return;
    setProcessing(true);
    try {
      const res = await api.video.generateScript(projectId, project.prompt);
      setGeneratedScript(res.script);
      await loadProject();
    } catch (e) {
      alert("Failed to generate script");
    } finally {
      setProcessing(false);
    }
  };

  const generateScenes = async () => {
    if (!generatedScript) return;
    setProcessing(true);
    try {
      await api.video.generateScenes(projectId, generatedScript);
      await loadProject();
    } catch (e) {
      alert("Failed to generate scenes");
    } finally {
      setProcessing(false);
    }
  };

  const generateVoice = async () => {
    setProcessing(true);
    try {
      const text = scenes.map(s => s.script_text).filter(Boolean).join(" ");
      await api.voice.generate(projectId, text, project?.voice_id || "alloy");
      await loadProject();
    } catch (e) {
      alert("Failed to generate voice");
    } finally {
      setProcessing(false);
    }
  };

  const assembleAndExport = async () => {
    setProcessing(true);
    try {
      const sceneVideos = scenes.map(s => s.video_path).filter(Boolean) as string[];
      await api.video.assemble({
        project_id: projectId,
        scene_video_paths: sceneVideos,
        subtitle_style: project?.subtitle_style || "modern-yellow",
      });
      await api.video.export(projectId, "high");
      await loadProject();
      alert("Video exported successfully!");
    } catch (e) {
      alert("Export failed");
    } finally {
      setProcessing(false);
    }
  };

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        <main className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r border-border bg-card/30 p-4 overflow-y-auto">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
              Workflow
            </h3>
            <div className="space-y-1">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = activeTab === step.id;
                const isCompleted = false; // Simplified for now

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveTab(step.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isActive 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted ? "bg-success text-black" : "bg-secondary"
                    }`}>
                      {isCompleted ? "✓" : idx + 1}
                    </div>
                    <Icon className="w-4 h-4" />
                    {step.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-96 bg-black border-b border-border flex items-center justify-center relative">
              {project.output_video_path ? (
                <video 
                  src={`/outputs/${projectId}/export_high.mp4`} 
                  controls 
                  className="max-h-full max-w-full"
                />
              ) : (
                <div className="text-center">
                  <Play className="w-16 h-16 text-muted mx-auto mb-4" />
                  <p className="text-muted-foreground">Preview will appear here</p>
                </div>
              )}
              {processing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-sm font-medium">Processing...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === "prompt" && (
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4">Video Prompt</h3>
                  <textarea
                    value={project.prompt || ""}
                    readOnly
                    className="input-field h-40 resize-none mb-4"
                    placeholder="Describe your video..."
                  />
                  <button onClick={generateScript} className="btn-primary flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    Generate Script
                  </button>
                </div>
              )}

              {activeTab === "script" && (
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4">Generated Script</h3>
                  <textarea
                    value={generatedScript}
                    onChange={(e) => setGeneratedScript(e.target.value)}
                    className="input-field h-64 resize-none font-mono text-sm mb-4"
                  />
                  <button onClick={generateScenes} className="btn-primary flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Generate Scenes
                  </button>
                </div>
              )}

              {activeTab === "scenes" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Scenes</h3>
                  <div className="space-y-3">
                    {scenes.map((scene, idx) => (
                      <div key={scene.id} className="panel p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-6 h-6 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-medium">{scene.description}</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-9">{scene.script_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "voice" && (
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4">AI Voice</h3>
                  <button onClick={generateVoice} className="btn-primary flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Generate Voiceover
                  </button>
                </div>
              )}

              {activeTab === "export" && (
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4">Export Video</h3>
                  <button onClick={assembleAndExport} className="btn-primary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Assemble & Export MP4
                  </button>
                  {project.output_video_path && (
                    <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
                      <p className="text-sm text-success font-medium">Video ready!</p>
                      <p className="text-xs text-muted-foreground mt-1">{project.output_video_path}</p>
                    </div>
                  )}
                </div>
              )}

              {!["prompt", "script", "scenes", "voice", "export"].includes(activeTab) && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>This step will be implemented in the workflow panel.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}