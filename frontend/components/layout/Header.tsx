"use client";

import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname === "/settings") return "Settings";
    if (pathname.startsWith("/studio")) return "Video Studio";
    return "DikachiVideo";
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-8 sticky top-0 z-40">
      <h2 className="text-xl font-semibold">{getTitle()}</h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium">
          <Zap className="w-3 h-3 text-warning" />
          <span>Auto Mode</span>
        </div>
      </div>
    </header>
  );
}