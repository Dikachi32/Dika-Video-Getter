"use client";

import { useEffect, useState } from "react";
import { Cpu, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface EngineInfo {
  name: string;
  available: boolean;
  type: "local" | "cloud";
  capabilities: string[];
}

export function EngineStatusIndicator() {
  const [engines, setEngines] = useState<EngineInfo[]>([]);
  const [mode, setMode] = useState<string>("auto");
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const status = await api.engines.status();
      setMode(status.mode || "auto");

      if (status.engines) {
        const list = Object.entries(status.engines).map(
          ([name, data]: [string, any]) => ({
            name,
            available: data.available,
            type: data.type,
            capabilities: data.capabilities || [],
          })
        );
        setEngines(list);
      }
    } catch (err) {
      console.error("Failed to fetch engine status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const availableCount = engines.filter((e) => e.available).length;
  const totalCount = engines.length;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Checking engines...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <Cpu className="w-3 h-3 text-muted-foreground" />
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-wider",
            mode === "local"
              ? "text-emerald-400"
              : mode === "cloud"
              ? "text-primary"
              : "text-amber-400"
          )}
        >
          {mode} Mode
        </span>
      </div>
      <div className="flex items-center gap-1">
        {engines.slice(0, 3).map((engine) => (
          <div
            key={engine.name}
            className={cn(
              "w-2 h-2 rounded-full",
              engine.available ? "bg-emerald-400" : "bg-red-400/30"
            )}
            title={`${engine.name}: ${engine.available ? "Available" : "Unavailable"}`}
          />
        ))}
        {engines.length > 3 && (
          <span className="text-[10px] text-muted-foreground">
            +{engines.length - 3}
          </span>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground">
        {availableCount}/{totalCount} ready
      </span>
    </div>
  );
}