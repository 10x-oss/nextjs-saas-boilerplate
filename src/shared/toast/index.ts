import { useToastStore } from "@/shared/store/toast.store";
import type { ToastType } from "./toast.types";

function push(type: ToastType, message: string, timeout = 3000) {
  // Zustand stores expose getState() outside React
  useToastStore.getState().add(type, message, timeout);
}

export const toast = {
  success: (msg: string, t?: number) => push("success", msg, t),
  error: (msg: string, t?: number) => push("error", msg, t),
  info: (msg: string, t?: number) => push("info", msg, t),
  warning: (msg: string, t?: number) => push("warning", msg, t),
};

// Keep default export to satisfy `import toast from "react-hot-toast"`
export default toast;
