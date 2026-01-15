"use client";

import { Fragment } from "react";
import { CloseIcon } from "@/shared/svgs";
import StartTrialButton from "@/core/payment/Stripe/StartTrialButton";
import Link from "next/link";

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardCount: number;
  limit: number;
  isGrandfathered?: boolean;
}

export default function UpgradePromptModal({
  isOpen,
  onClose,
  boardCount,
  limit,
  isGrandfathered = false,
}: UpgradePromptModalProps) {
  if (!isOpen) return null;

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC ||
                          process.env.STRIPE_PRICE_ID_BASIC || "";
  const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY ||
                         process.env.STRIPE_PRICE_ID_YEARLY || "";

  const planOptions = [
    {
      id: monthlyPriceId,
      label: "Monthly",
      description: "$7/month",
    },
    {
      id: yearlyPriceId,
      label: "Yearly",
      description: "$84/year (save $0)",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-base-100 rounded-2xl shadow-2xl p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          title="Close modal"
          className="absolute top-4 right-4 btn btn-square btn-ghost btn-sm"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            {isGrandfathered
              ? "You've reached your board limit"
              : "You've hit the free tier limit"}
          </h2>

          <p className="text-center text-base-content/70 text-sm">
            {isGrandfathered ? (
              <>
                You have <span className="font-semibold">{boardCount} boards</span> from
                before the limit was introduced. Upgrade to Pro to create unlimited boards.
              </>
            ) : (
              <>
                You&apos;ve created <span className="font-semibold">{boardCount} boards</span>.
                Upgrade to Pro for $7/month to create unlimited boards.
              </>
            )}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-base-200 rounded-xl p-4">
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-base-content/60">
              What you&apos;ll get with Pro:
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  <strong>Unlimited boards</strong> — Create as many boards as you need
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  <strong>All premium features</strong> — Advanced tools and integrations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  <strong>Priority support</strong> — Get help when you need it
                </span>
              </li>
            </ul>
          </div>

          <StartTrialButton
            priceId={monthlyPriceId}
            planOptions={planOptions}
            label="Upgrade to Pro"
            className="btn btn-primary btn-block"
          />

          <div className="text-center">
            <Link
              href="/boards/manage"
              className="text-sm text-base-content/60 hover:text-base-content underline"
              onClick={onClose}
            >
              Or delete a board to stay on the free tier
            </Link>
          </div>
        </div>

        <p className="text-xs text-center text-base-content/50 mt-6">
          Cancel anytime. No long-term commitments.
        </p>
      </div>
    </div>
  );
}
