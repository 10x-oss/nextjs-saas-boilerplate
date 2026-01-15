"use client";

import { useState, useRef } from "react";
import {
  ChevronDownIcon,
  FireIcon,
  GiftIcon,
  AcademicCapIcon,
} from "@/shared/svgs";

const ButtonPopover = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative z-10"
      ref={containerRef}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <button
        className="btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Popover Button
        <ChevronDownIcon
          className={`w-5 h-5 duration-200 opacity-50 ${
            open ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute left-0 z-10 mt-3 w-screen max-w-sm lg:max-w-3xl transform bg-base-100 rounded-lg shadow-lg ring-1 ring-base-content ring-opacity-5 p-4 transition"
          role="menu"
        >
          <div className="relative grid gap-4 lg:grid-cols-2">
            <div
              className="text-sm flex items-center gap-3 p-2 cursor-pointer hover:bg-base-200 rounded-lg duration-200"
              role="menuitem"
            >
              <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-lg bg-orange-500/20">
                <FireIcon />
              </span>
              <div>
                <p className="font-bold">Get Started</p>
                <p className="opacity-70">Loreum ipseum de la madre de papa</p>
              </div>
            </div>
            <div
              className="text-sm flex items-center gap-3 p-2 cursor-pointer hover:bg-base-200 rounded-lg duration-200"
              role="menuitem"
            >
              <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-lg bg-yellow-500/20">
                <GiftIcon />
              </span>
              <div>
                <p className="font-bold">Rewards</p>
                <p className="opacity-70">
                  Loreum ipseum de el papi de la mama
                </p>
              </div>
            </div>
            <div
              className="text-sm flex items-center gap-3 p-2 cursor-pointer hover:bg-base-200 rounded-lg duration-200"
              role="menuitem"
            >
              <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-lg bg-green-500/20">
                <AcademicCapIcon />
              </span>
              <div>
                <p className="font-bold">Academics</p>
                <p className="opacity-70">Loreum ipseum de la madre de papa</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonPopover;
