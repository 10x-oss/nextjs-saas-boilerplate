"use client";

import React, { useEffect, useState } from "react";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  /**
   * When true, paints a solid app background behind the entire
   * authenticated area.
   */
  blankBackground?: boolean;
}

/**
 * Authenticated layout wrapper for protected pages.
 * Provides a simple responsive layout with optional sidebar support.
 *
 * Customize this component to add:
 * - Navigation sidebar
 * - Top navigation bar
 * - Global search overlay
 * - Mobile-responsive menu
 */
const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  blankBackground = false,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarWidth = 256; // px

  // Keyboard shortcut for toggling the sidebar (Cmd + "/")
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "/") {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={`relative flex h-screen ${
        blankBackground ? "bg-base-100" : ""
      }`}
    >
      {/* Sidebar placeholder - add your navigation here */}
      {isSidebarOpen && (
        <aside
          className="fixed left-0 top-0 h-full bg-base-200 border-r border-base-300 z-40"
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold">Navigation</h2>
            {/* Add your sidebar content here */}
          </div>
        </aside>
      )}

      <main
        className="flex-1 overflow-auto overflow-x-hidden flex flex-col min-h-0"
        style={{
          marginLeft: isSidebarOpen ? `${sidebarWidth}px` : "0",
          width: isSidebarOpen ? `calc(100% - ${sidebarWidth}px)` : "100%",
          transition: "margin-left 0.3s ease-in-out, width 0.3s ease-in-out",
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default AuthenticatedLayout;
