import { useToastStore } from "@/shared/store/toast.store";
import type { ToastType } from "@/shared/toast/toast.types";

export function useToast() {
  const add = useToastStore((s) => s.add);

  return {
    success: (msg: string, t?: number) => add("success", msg, t),
    error: (msg: string, t?: number) => add("error", msg, t),
    info: (msg: string, t?: number) => add("info", msg, t),
    warning: (msg: string, t?: number) => add("warning", msg, t),
  };
}
