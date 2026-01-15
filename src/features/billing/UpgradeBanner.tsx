"use client";

import Link from "next/link";
import { Zap, X } from "lucide-react";
import { useState } from "react";
import { useBoardUsage } from "@/shared/hooks/useBoardUsage";

export default function UpgradeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data, isLoading } = useBoardUsage();

  if (isLoading || !data || dismissed) {
    return null;
  }

  // Only show for free users approaching or at limit (4-5 boards)
  if (data.isPaid || data.current < 4) {
    return null;
  }

  const isAtLimit = data.current >= (data.limit || 5);
  const remaining = data.remaining || 0;

  return (
    <div className="mx-4 mb-3 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-3 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 btn btn-ghost btn-xs btn-square"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="flex items-start gap-2 mb-2">
        <div className="p-1.5 bg-indigo-500/20 rounded">
          <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 pr-6">
          <h4 className="font-semibold text-sm mb-0.5">
            {isAtLimit ? "Board limit reached" : `${remaining} board${remaining === 1 ? '' : 's'} remaining`}
          </h4>
          <p className="text-xs text-base-content/60 leading-relaxed">
            {isAtLimit
              ? "Upgrade to Pro for unlimited boards at $7/month"
              : "Upgrade to Pro for unlimited boards"}
          </p>
        </div>
      </div>

      <Link
        href="/pricing"
        className="btn btn-primary btn-xs w-full"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}
