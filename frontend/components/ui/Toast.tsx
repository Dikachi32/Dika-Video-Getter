"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  dismissAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: Math.random().toString(36).substring(2, 9),
          duration: toast.duration ?? 5000,
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  dismissAll: () => set({ toasts: [] }),
}));

export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ title, description, type: "success", duration }),
  error: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ title, description, type: "error", duration }),
  warning: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ title, description, type: "warning", duration }),
  info: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ title, description, type: "info", duration }),
};

const toastVariants = cva(
  "group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        error: "border-red-500/20 bg-red-500/10 text-red-400",
        warning: "border-amber-500/20 bg-amber-500/10 text-amber-400",
        info: "border-primary/20 bg-primary/10 text-primary",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 shrink-0" />,
  error: <AlertCircle className="w-5 h-5 shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 shrink-0" />,
  info: <Info className="w-5 h-5 shrink-0" />,
};

export function ToastItemComponent({ toast }: { toast: ToastItem }) {
  const { removeToast } = useToastStore();

  return (
    <ToastPrimitive.Root
      className={cn(toastVariants({ variant: toast.type }))}
      duration={toast.duration}
      onOpenChange={(open) => {
        if (!open) removeToast(toast.id);
      }}
    >
      <div className="flex items-start gap-3">
        {iconMap[toast.type]}
        <div className="flex-1 space-y-1">
          <ToastPrimitive.Title className="text-sm font-semibold">
            {toast.title}
          </ToastPrimitive.Title>
          {toast.description && (
            <ToastPrimitive.Description className="text-xs opacity-90">
              {toast.description}
            </ToastPrimitive.Description>
          )}
        </div>
      </div>
      <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50">
        <X className="w-3 h-3" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts } = useToastStore();

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
      {children}
      <ToastPrimitive.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
      {toasts.map((t) => (
        <ToastItemComponent key={t.id} toast={t} />
      ))}
    </ToastPrimitive.Provider>
  );
}