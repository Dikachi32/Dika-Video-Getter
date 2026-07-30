export interface Project {
  id: number;
  name: string;
  description: string | null;
  prompt: string | null;
  script: string | null;
  status: string;
  video_duration: number;
  resolution: string;
  subtitle_style: string;
  voice_id: string;
  output_video_path: string | null;
  output_thumbnail_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: number;
  project_id: number;
  order: number;
  description: string;
  script_text: string | null;
  duration: number;
  image_path: string | null;
  video_path: string | null;
  voice_path: string | null;
  start_time: number;
  end_time: number;
}

export interface EngineStatus {
  mode: string;
  initialized: boolean;
  engines: Record<string, {
    available: boolean;
    type: string;
    capabilities: string[];
  }>;
}

export interface AppSettings {
  api_keys: Record<string, string>;
  defaults: Record<string, string>;
  [category: string]: Record<string, string>;
}

export type WorkflowStep = 
  | "prompt"
  | "script"
  | "scenes"
  | "video"
  | "voice"
  | "subtitle"
  | "music"
  | "thumbnail"
  | "merge"
  | "export";

export interface WorkflowState {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  isProcessing: boolean;
  error: string | null;
}