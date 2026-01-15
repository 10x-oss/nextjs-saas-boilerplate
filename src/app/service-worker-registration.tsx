"use client";

import { useEffect } from "react";
import toast from "@/shared/toast";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", function () {
        navigator.serviceWorker
          .register("/sw.js", {
            scope: "/",
          })
          .then(
            function (registration) {
              toast.info(
                `ServiceWorker registration successful with scope: ${registration.scope}`
              );
            },
            function (err) {
              toast.error(`ServiceWorker registration failed: ${err}`);
            }
          );
      });
    }
  }, []);

  return null;
}
