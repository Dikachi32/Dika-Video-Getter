"use client";

import { useToastStore, toast } from "@/components/ui/Toast";

export function useToast() {
  const { toasts, addToast, removeToast, dismissAll } = useToastStore();

  return {
    toasts,
    toast,
    addToast,
    removeToast,
    dismissAll,
  };
}

export { toast };