"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  count = 1,
  ...props
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-muted rounded-md";

  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-xl",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(baseClasses, variantClasses[variant], className)}
          style={style}
          {...props}
        />
      ))}
    </>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
      <Skeleton count={2} />
      <div className="flex gap-2 pt-2">
        <Skeleton width={80} height={32} className="rounded-lg" />
        <Skeleton width={80} height={32} className="rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonDashboard({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonScene({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton width="40%" />
          </div>
          <Skeleton count={2} />
          <Skeleton width="100%" height={120} variant="rounded" />
        </div>
      ))}
    </div>
  );
}