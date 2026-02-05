"use client";
import React, { useEffect, useState } from "react";
import styles from "./toast.module.css";
import type { Toast } from "./toast.types";
import { useMemo } from "react";

// Create a set of progress classes at 5% intervals (0, 5, 10, ..., 100)
const PROGRESS_STEPS = 21; // 0 to 100 in steps of 5

// Component to handle the toast progress bar without inline styles
export default function ToastProgress({ toast }: { toast: Toast }) {
  const [progress, setProgress] = useState(100);
  const createdAt = parseInt(toast.id.split('-')[0] ?? '0', 10);
  const progressBarClass = `progressBar${toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}`;

  // Calculate the closest 5% interval for the current progress
  const progressStep = useMemo(() => {
    return Math.round(progress / 5) * 5;
  }, [progress]);

  useEffect(() => {
    // Calculate initial progress
    const updateProgress = () => {
      const elapsedTime = Date.now() - createdAt;
      const currentProgress = Math.max(0, 100 - (100 * elapsedTime / toast.timeout));
      setProgress(currentProgress);
    };

    // Initial update
    updateProgress();

    // Setup animation frame for smooth progress bar
    let animationFrameId: number;
    const animate = () => {
      updateProgress();
      if (progress > 0) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [createdAt, toast.timeout, progress]);
  
  return (
    <div 
      className={`${styles.progressBar} ${styles[progressBarClass]} ${styles[`progress${progressStep}`]}`}
      data-progress={progressStep}
    />
  );
}
