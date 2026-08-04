"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { AppSettings } from "@/types";

interface UseSettingsReturn {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateSetting: (key: string, value: string, category?: string) => Promise<void>;
  updateBatch: (settings: Record<string, string>) => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.settings.getAll();
      setSettings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
      console.error("Settings fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSetting = useCallback(
    async (key: string, value: string, category: string = "general") => {
      try {
        await api.settings.set(key, value, category);
        await fetchSettings();
      } catch (err: any) {
        setError(err.message || "Failed to update setting");
        throw err;
      }
    },
    [fetchSettings]
  );

  const updateBatch = useCallback(
    async (newSettings: Record<string, string>) => {
      try {
        await api.settings.batchUpdate(newSettings);
        await fetchSettings();
      } catch (err: any) {
        setError(err.message || "Failed to update settings");
        throw err;
      }
    },
    [fetchSettings]
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refresh: fetchSettings,
    updateSetting,
    updateBatch,
  };
}