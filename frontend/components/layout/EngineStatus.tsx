"use client";

import { useEffect, useState } from "react";
import { Cpu, Cloud, Server, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import type { EngineStatus as EngineStatusType } from "@/types";

export function EngineStatus() {
  const [status, setStatus] = useState<EngineStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStatus() {
      try {
        const data = await api.engines.status();
        if (mounted) setStatus(data);
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-3 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <span className="text-xs text-muted-foreground">Checking engines...</span>
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="glass-panel p-3 border-destructive/30">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3 h-3 text-destructive" />
          <span className="text-xs text-destructive">Engine check failed</span>
        </div>
      </div>
    );
  }

  const availableCount = Object.values(status.engines).filter((e) => e.available).length;
  const totalCount = Object.values(status.engines).length;

  return (
    <div className="glass-panel p-3">
      <div className="flex items-center gap-2 mb-3">
        {status.mode === "cloud" ? (
          <Cloud className="w-3 h-3 text-primary" />
        ) : (
          <Server className="w-3 h-3 text-success" />
        )}
        <span className="text-xs font-medium capitalize">{status.mode} Mode</span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {availableCount}/{totalCount} engines
        </span>
      </div>

      <div className="space-y-1.5">
        {Object.entries(status.engines).map(([name, engine]) => (
          <div key={name} className="flex items-center gap-2">
            {engine.available ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-muted-foreground/50" />
            )}
            <span className="text-[10px] text-muted-foreground capitalize flex-1">
              {name.replace(/_/g, " ")}
            </span>
            <span className="text-[10px] text-muted-foreground/60 uppercase">
              {engine.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}