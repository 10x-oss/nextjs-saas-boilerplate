"use client";

import React from "react";

interface BetterIconProps {
  children: React.ReactNode;
}

const BetterIcon = ({ children }: BetterIconProps) => {
  return (
    <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-primary/20 text-primary">
      {children}
    </div>
  );
};

export default BetterIcon;
