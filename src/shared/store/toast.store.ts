import { create } from "zustand";
import type { Toast, ToastType } from "@/shared/toast/toast.types";

interface ToastState {
  toasts: Toast[];
  add: (type: ToastType, message: string, timeout?: number) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  add: (type, message, timeout = 3000) =>
    set((state) => {
      const id = `${Date.now()}-${Math.random()}`;
      const toast: Toast = { id, type, message, timeout };
      const next = [...state.toasts, toast].slice(-3); // max 3
      return { toasts: next };
    }),
  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
