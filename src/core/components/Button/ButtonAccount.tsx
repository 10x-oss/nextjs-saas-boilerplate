/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { axiosInstance, handleApiError } from "@/shared/utils/api.utils";
import {
  ChevronDownIcon,
  CreditCardIcon,
  SignOutIcon,
  TrashIcon,
} from "@/shared/svgs";

const ButtonAccount = () => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [offsetX, setOffsetX] = useState(0);
  // Delete account modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!open) {
      setOffsetX(0);
      return;
    }

    const adjustPosition = () => {
      if (!menuRef.current) return;
      const rect = menuRef.current.getBoundingClientRect();
      let newOffsetX = 0;
      const margin = 8;
      if (rect.left < margin) {
        newOffsetX = margin - rect.left;
      } else if (rect.right > window.innerWidth - margin) {
        newOffsetX = window.innerWidth - margin - rect.right;
      }
      setOffsetX(newOffsetX);
    };

    adjustPosition();
    window.addEventListener("resize", adjustPosition);
    return () => window.removeEventListener("resize", adjustPosition);
  }, [open]);

  if (status === "unauthenticated") return null;

  const handleSignOut = async () => {
    const signOutResult = await signOut({
      redirect: false,
      callbackUrl: process.env["NEXT_PUBLIC_BASE_URL"] || "/",
    });

    await queryClient.clear();

    const resolveBase = (input?: string) => {
      if (!input) return undefined;
      try {
        const parsed = new URL(input);
        return parsed.origin + parsed.pathname.replace(/\/$/, "");
      } catch {
        return undefined;
      }
    };

    const browserOrigin =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const fallbackBase =
      resolveBase(process.env["NEXT_PUBLIC_BASE_URL"]) || browserOrigin;

    if (!fallbackBase) {
      window.location.href = "/";
      return;
    }

    const resolveUrl = (value?: string) => {
      if (!value) return undefined;
      try {
        return new URL(value, fallbackBase).toString();
      } catch {
        return undefined;
      }
    };

    const defaultTarget =
      resolveUrl(process.env["NEXT_PUBLIC_CALLBACK_URL"]) ||
      new URL("/", fallbackBase).toString();

    const targetUrl = resolveUrl(signOutResult?.url) || defaultTarget;

    window.location.href = targetUrl; // full reload to guest context
  };

  const handleBilling = async () => {
    setIsLoading(true);
    try {
      // Return to post-portal page which refreshes the session before redirecting back
      const currentPath = window.location.pathname + window.location.search;
      const returnUrl = `${window.location.origin}/stripe/post-portal?returnTo=${encodeURIComponent(currentPath)}`;
      const { data } = await axiosInstance.post("/stripe/create-portal", {
        returnUrl,
      });
      window.location.href = data.url;
    } catch (error) {
      handleApiError(error);
    }
    setIsLoading(false);
  };

  // const toggleThemeMode = async () => {
  //   const newTheme = theme === "light" ? "dark" : "light";
  //   setTheme(newTheme);
  //   await updateSettings({ theme: newTheme });
  // };

  // const toggleTextOnlyMode = async () => {
  //   await updateSettings({ textOnlyMode: !settings?.textOnlyMode });
  // };

  // const toggleTheaterMode = async () => {
  //   await updateSettings({ theaterMode: !settings?.theaterMode });
  // };

  // const handleRefresh = () => window.location.reload();


  const toggleOpen = () => setOpen((prev) => !prev);

  const canConfirmDelete = deleteConfirm.trim().toUpperCase() === "DELETE";

  const handleDeleteAccount = async () => {
    if (!canConfirmDelete || deleteLoading) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Unable to delete account");
      }
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setDeleteError(msg);
      setDeleteLoading(false);
    }
  };

  return (
    <div
      className="relative z-10"
      onBlur={(e) => {
        // Close if clicked outside
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="btn btn-ghost btn-sm gap-2 text-base-content hover:text-base-content/80"
        onClick={toggleOpen}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "Account"}
            className="w-6 h-6 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-base-300 flex items-center justify-center text-base-content">
            {(session?.user?.name?.charAt(0) ||
              session?.user?.email?.charAt(0)) ??
              "A"}
          </div>
        )}

        {!isMobile && (
          <span className="font-medium">
            {session?.user?.name || "Account"}
          </span>
        )}

        {isLoading ? (
          <span className="loading loading-spinner loading-xs text-base-content" />
        ) : (
          <ChevronDownIcon
            className={`w-5 h-5 duration-200 ${
              open ? "transform rotate-180 opacity-70" : "opacity-50"
            }`}
          />
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          style={{ transform: `translateX(calc(-50% + ${offsetX}px))` }}
          className="absolute bottom-full left-1/2 w-screen max-w-xs mb-3 bg-base-100 rounded-xl shadow-xl ring-1 ring-base-content ring-opacity-5 p-1 transition transform origin-bottom"
          role="menu"
        >
          <div className="flex flex-col space-y-1 text-sm">
            {/* <AccountAction
              icon={<RefreshIcon className="w-5 h-5" />}
              label="Refresh"
              onClick={handleRefresh}
              className="text-primary"
            />  */}
            {/* <AccountAction
              icon={
                theme === "light" ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )
              }
              label={theme === "light" ? "Dark Mode" : "Light Mode"}
              onClick={toggleThemeMode}
              className="text-primary"
            /> */}
            {/* <AccountAction
              icon={<TextIcon className="w-5 h-5" />}
              label={settings?.textOnlyMode ? "Normal Mode" : "Text Only Mode"}
              onClick={toggleTextOnlyMode}
              className="text-primary"
            /> */}
            {/* <AccountAction
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 2h16a2 2 0 012 2v10.5c0 1.379-1.121 2.5-2.5 2.5H8.618l-5.55 4.44A1 1 0 012 20.5V4a2 2 0 012-2z" />
                </svg>
              }
              label={
                settings?.theaterMode
                  ? "Disable Theater Mode"
                  : "Enable Theater Mode"
              }
              onClick={toggleTheaterMode}
              className="text-primary"
            /> */}
            {/* <AccountAction
              icon={<TrashIcon className="w-5 h-5" />}
              label="Delete All Feed"
              onClick={handleDeleteAllFeed}
              className="text-error"
            /> */}
          <AccountAction
            icon={<CreditCardIcon className="w-5 h-5" />}
            label="Billing"
            onClick={handleBilling}
            className="text-primary"
          />
          <AccountAction
            icon={<TrashIcon className="w-5 h-5" />}
            label="Delete account"
            onClick={() => {
              setOpen(false);
              setDeleteOpen(true);
            }}
            className="text-error"
          />
          <AccountAction
            icon={<SignOutIcon className="w-5 h-5" />}
            label="Sign out"
            onClick={handleSignOut}
            className="text-primary"
          />
          </div>
        </div>
      )}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-[10000] grid place-items-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl glass-panel p-5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold">Delete account</h4>
                <p className="text-sm text-gray-500">
                  Please type DELETE to confirm. This cannot be undone.
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  if (!deleteLoading) {
                    setDeleteOpen(false);
                    setDeleteConfirm("");
                    setDeleteError(null);
                  }
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {deleteError && (
              <div className="alert alert-error mt-4">
                <span>{deleteError}</span>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder={`Type DELETE to confirm`}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                disabled={deleteLoading}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    if (!deleteLoading) {
                      setDeleteOpen(false);
                      setDeleteConfirm("");
                      setDeleteError(null);
                    }
                  }}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-error"
                  onClick={handleDeleteAccount}
                  disabled={!canConfirmDelete || deleteLoading}
                >
                  {deleteLoading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Confirm Deletion"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AccountActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void | Promise<void>;
  className: string;
}

const AccountAction = ({ icon, label, onClick, className }: AccountActionProps) => (
  <button
    type="button"
    title="Account Action"
    onClick={onClick}
    className={`btn btn-ghost justify-start gap-2 w-full ${className}`}
    role="menuitem"
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default ButtonAccount;
