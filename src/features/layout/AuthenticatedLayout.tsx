"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSidebarStore } from "@/shared/store/sidebar.store";
import SidebarSkeleton from "@/features/navigation/sidebar/SidebarSkeleton";
import { useEdgeSwipe } from "@/shared/hooks/useEdgeSwipe";
import {
  useFindBarStore,
  useSearchOverlayStore,
} from "@/shared/store/search.store";
import { useMigrateAnonBoards } from "@/shared/hooks/useMigrateAnonBoards";

// Lazy load Sidebar to prevent blocking initial render
const Sidebar = dynamic(
  () => import("@/features/navigation/sidebar/Sidebar"),
  {
    ssr: false,
    loading: () => <SidebarSkeleton />,
  }
);

// Lazy load overlays - not needed for initial paint
const SearchOverlay = dynamic(
  () => import("@/features/search/SearchOverlay"),
  { ssr: false }
);
const FindBar = dynamic(
  () => import("@/features/search/FindBar"),
  { ssr: false }
);

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  /**
   * When true, paints a solid app background behind the entire
   * authenticated area (used for long rich‑text pages).
   */
  blankBackground?: boolean;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  blankBackground = false,
}) => {
  const { isSidebarOpen, sidebarWidth, toggleSidebar, isMobile } = useSidebarStore();

  // Migrate anonymous boards after OAuth sign-in
  useMigrateAnonBoards();

  // Enable left‑edge swipe to open sidebar on mobile browsers
  useEdgeSwipe(() => {
    if (!isSidebarOpen) toggleSidebar();
  });

  // Keyboard shortcut for toggling the sidebar (Cmd + "/")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "/") {
        e.preventDefault();
        toggleSidebar();
      }
      // Open global search: Cmd/Ctrl+K or Cmd/Ctrl+P (when not typing in an input)
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const meta = isMac ? e.metaKey : e.ctrlKey;
      const kKey = e.key.toLowerCase() === "k";
      const pKey = e.key.toLowerCase() === "p";
      const fKey = e.key.toLowerCase() === "f";
      const active = document.activeElement as HTMLElement | null;
      const inEditable =
        !!active &&
        (active.isContentEditable ||
          ["input", "textarea"].includes(active.tagName.toLowerCase()));
      if (meta && (kKey || pKey) && !inEditable) {
        e.preventDefault();
        useSearchOverlayStore.getState().open("");
      }
      // In-page find: Cmd/Ctrl+F — show find bar and do not open global search
      if (meta && fKey) {
        // Allow inside editors too; but do not trigger browser default
        e.preventDefault();
        const findStore = useFindBarStore.getState();
        if (!findStore.isOpen) findStore.open();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div
      className={`relative flex h-screen ${
        blankBackground ? "bg-base-100" : ""
      }`}
    >
      <Sidebar />
      <main
        className="flex-1 overflow-auto overflow-x-hidden flex flex-col min-h-0"
        style={{
          marginLeft: isSidebarOpen && !isMobile ? `${sidebarWidth}px` : "0",
          width:
            isSidebarOpen && !isMobile
              ? `calc(100% - ${sidebarWidth}px)`
              : "100%",
          transition: "margin-left 0.3s ease-in-out, width 0.3s ease-in-out",
        }}
      >
        {children}
      </main>
      <SearchOverlay />
      <FindBar />
      {/* Global undo/redo controls can be mounted here when re-enabled */}
    </div>
  );
};

export default AuthenticatedLayout;
