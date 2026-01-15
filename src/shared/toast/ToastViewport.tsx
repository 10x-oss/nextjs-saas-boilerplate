"use client";
import React, { useEffect } from "react";
import { useToastStore } from "@/shared/store/toast.store";
import {
  X as IconX,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./toast.module.css";
import ToastProgress from "./ToastProgress";

interface ToastIconProps {
  type: string;
  className?: string;
}

const ToastIcon = ({ type, className = "" }: ToastIconProps) => {
  switch (type) {
    case "success":
      return (
        <CheckCircle className={`text-xl ${className} ${styles.successIcon}`} />
      );
    case "error":
      return (
        <AlertCircle className={`text-xl ${className} ${styles.errorIcon}`} />
      );
    case "info":
      return <Info className={`text-xl ${className} ${styles.infoIcon}`} />;
    case "warning":
      return (
        <AlertTriangle
          className={`text-xl ${className} ${styles.warningIcon}`}
        />
      );
    default:
      return null;
  }
};

const toastVariants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  // Auto-dismiss after each toast.timeout (default 3 s)
  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => remove(t.id), t.timeout));
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            aria-live="polite"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={toastVariants}
            className={`${styles.toast} ${
              styles[toast.type]
            } ring-1 ring-black/5 dark:ring-white/10`}
          >
            <div className={styles.toastContent}>
              <div className={styles.toastIcon}>
                <ToastIcon type={toast.type} />
              </div>
              <div className={styles.toastMessage}>
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <button
                onClick={() => remove(toast.id)}
                className={styles.toastCloseButton}
                aria-label="Close toast"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
            <ToastProgress toast={toast} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
