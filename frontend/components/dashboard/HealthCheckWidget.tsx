"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Server,
  Cpu,
  HardDrive,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  backend: boolean;
  database: boolean;
  ffmpeg: boolean;
  version: string;
  uptime: string;
}

interface EngineStatusItem {
  name: string;
  available: boolean;
  type: string;
  capabilities: string[];
}

export function HealthCheckWidget() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [engines, setEngines] = useState<EngineStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      // Check backend health
      const healthRes = await fetch("/api/health").catch(() => null);
      const healthData = healthRes?.ok ? await healthRes.json() : null;

      // Check engine status
      const engineRes = await api.engines.status().catch(() => null);

      setHealth(
        healthData || {
          status: healthRes?.ok ? "healthy" : "unhealthy",
          backend: !!healthRes?.ok,
          database: healthData?.database || false,
          ffmpeg: healthData?.ffmpeg || false,
          version: healthData?.version || "unknown",
          uptime: healthData?.uptime || "0s",
        }
      );

      if (engineRes?.engines) {
        const engineList = Object.entries(engineRes.engines).map(
          ([name, data]: [string, any]) => ({
            name,
            available: data.available,
            type: data.type,
            capabilities: data.capabilities || [],
          })
        );
        setEngines(engineList);
      }

      setLastCheck(new Date());
    } catch (err: any) {
      toast.error("Health check failed", err.message);
      setHealth({
        status: "unhealthy",
        backend: false,
        database: false,
        ffmpeg: false,
        version: "unknown",
        uptime: "0s",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Auto-check every 30s
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    healthy: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle },
    degraded: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertCircle },
    unhealthy: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertCircle },
  };

  const currentStatus = health ? statusConfig[health.status] : statusConfig.unhealthy;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">System Health</h3>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          loading={loading}
          onClick={checkHealth}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        />
      </div>

      {health && (
        <div className="space-y-3">
          {/* Overall Status */}
          <div
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border",
              currentStatus.bg,
              currentStatus.border
            )}
          >
            <StatusIcon className={cn("w-5 h-5", currentStatus.color)} />
            <div>
              <p className={cn("text-sm font-medium", currentStatus.color)}>
                {health.status === "healthy"
                  ? "All Systems Operational"
                  : health.status === "degraded"
                  ? "Some Services Degraded"
                  : "System Unhealthy"}
              </p>
              {lastCheck && (
                <p className="text-[10px] text-muted-foreground">
                  Last check: {lastCheck.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Component Status */}
          <div className="space-y-2">
            <StatusRow
              icon={Server}
              label="Backend API"
              status={health.backend}
            />
            <StatusRow
              icon={HardDrive}
              label="Database"
              status={health.database}
            />
            <StatusRow
              icon={Cpu}
              label="FFmpeg"
              status={health.ffmpeg}
            />
          </div>

          {/* Engine Status */}
          {engines.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground">
                AI Engines
              </p>
              <div className="flex flex-wrap gap-1.5">
                {engines.map((engine) => (
                  <Badge
                    key={engine.name}
                    variant={engine.available ? "success" : "ghost"}
                    className="text-[10px]"
                  >
                    {engine.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Version Info */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border">
            <span>v{health.version}</span>
            <span>Uptime: {health.uptime}</span>
          </div>
        </div>
      )}

      {!health && !loading && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p>Unable to check system health</p>
        </div>
      )}
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  status,
}: {
  icon: React.ElementType;
  label: string;
  status: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      {status ? (
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
      )}
    </div>
  );
}