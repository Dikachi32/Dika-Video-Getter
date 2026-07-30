"""API client for DikachiVideo AI Studio backend."""

const API_BASE = "/api";

async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}/${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.detail || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Projects
  projects: {
    list: () => fetchApi("projects/"),
    get: (id: number) => fetchApi(`projects/${id}`),
    create: (data: any) => fetchApi("projects/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchApi(`projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => fetchApi(`projects/${id}`, { method: "DELETE" }),
    getScenes: (id: number) => fetchApi(`projects/${id}/scenes`),
    createScene: (id: number, data: any) => fetchApi(`projects/${id}/scenes`, { method: "POST", body: JSON.stringify(data) }),
  },

  // AI Engines
  engines: {
    status: () => fetchApi("ai-engines/status"),
    setMode: (mode: string) => fetchApi("ai-engines/mode", { method: "POST", body: JSON.stringify({ mode }) }),
    capabilities: () => fetchApi("ai-engines/capabilities"),
    available: (capability?: string) => fetchApi(`ai-engines/available${capability ? `?capability=${capability}` : ""}`),
    generate: (capability: string, params: any, preferredEngine?: string) =>
      fetchApi("ai-engines/generate", { method: "POST", body: JSON.stringify({ capability, params, preferred_engine: preferredEngine }) }),
  },

  // Video
  video: {
    generateScript: (projectId: number, prompt: string) =>
      fetchApi("video/generate-script", { method: "POST", body: JSON.stringify({ project_id: projectId, prompt }) }),
    generateScenes: (projectId: number, script: string) =>
      fetchApi("video/generate-scenes", { method: "POST", body: JSON.stringify({ project_id: projectId, script }) }),
    generateSceneVideo: (projectId: number, sceneId?: number, engine?: string) =>
      fetchApi("video/generate-scene-video", { method: "POST", body: JSON.stringify({ project_id: projectId, scene_id: sceneId, engine }) }),
    assemble: (data: any) => fetchApi("video/assemble", { method: "POST", body: JSON.stringify(data) }),
    export: (projectId: number, quality: string = "high") =>
      fetchApi("video/export", { method: "POST", body: JSON.stringify({ project_id: projectId, quality }) }),
  },

  // Voice
  voice: {
    list: () => fetchApi("voice/voices"),
    generate: (projectId: number, text: string, voiceId: string = "alloy", engine?: string) =>
      fetchApi("voice/generate", { method: "POST", body: JSON.stringify({ project_id: projectId, text, voice_id: voiceId, engine }) }),
  },

  // Subtitles
  subtitles: {
    styles: () => fetchApi("subtitles/styles"),
    generate: (projectId: number, audioPath: string, engine?: string) =>
      fetchApi("subtitles/generate", { method: "POST", body: JSON.stringify({ project_id: projectId, audio_path: audioPath, engine }) }),
    fromScript: (projectId: number, scriptText: string, duration: number = 15) =>
      fetchApi("subtitles/from-script", { method: "POST", body: JSON.stringify({ project_id: projectId, script_text: scriptText, duration }) }),
  },

  // Music
  music: {
    generate: (projectId: number, prompt: string, duration: number = 15, engine?: string) =>
      fetchApi("music/generate", { method: "POST", body: JSON.stringify({ project_id: projectId, prompt, duration, engine }) }),
  },

  // Thumbnails
  thumbnails: {
    generate: (projectId: number, prompt: string, engine?: string) =>
      fetchApi("thumbnails/generate", { method: "POST", body: JSON.stringify({ project_id: projectId, prompt, engine }) }),
    extract: (projectId: number, videoPath: string, timestamp: string = "00:00:01") =>
      fetchApi("thumbnails/extract", { method: "POST", body: JSON.stringify({ project_id: projectId, video_path: videoPath, timestamp }) }),
  },

  // Settings
  settings: {
    getAll: () => fetchApi("settings/"),
    get: (key: string) => fetchApi(`settings/${key}`),
    set: (key: string, value: string, category: string = "general") =>
      fetchApi("settings/", { method: "POST", body: JSON.stringify({ key, value, category }) }),
    batchUpdate: (settings: Record<string, string>) =>
      fetchApi("settings/batch", { method: "POST", body: JSON.stringify({ settings }) }),
  },
};