"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Video, Cpu } from "lucide-react";
import { EngineStatusIndicator } from "@/components/dashboard/EngineStatusIndicator";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">DikachiVideo</h1>
            <p className="text-xs text-muted-foreground">AI Studio</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <div className="glass-panel p-3">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-medium">System Status</span>
          </div>
          <EngineStatusIndicator />
        </div>
      </div>
    </aside>
  );
}