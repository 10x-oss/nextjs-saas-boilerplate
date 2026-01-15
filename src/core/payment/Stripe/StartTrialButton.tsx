"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

/** Button opens Stripe Checkout so the user can upgrade to a paid plan. */
type PlanOption = {
  id: string;
  label: string;
  description?: string;
  priceSummary?: string;
  savingsLabel?: string;
};

export default function StartTrialButton({
  label = "Upgrade now",
  className = "btn btn-primary w-full",
  priceId,
  planOptions = [],
}: {
  label?: string;
  className?: string;
  priceId?: string;
  planOptions?: PlanOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { data: session } = useSession();

  const defaultPriceId = priceId ?? planOptions[0]?.id;

  if (!defaultPriceId) {
    throw new Error("StartTrialButton requires at least one priceId");
  }

  const redirectToSignIn = () => {
    signIn("google", {
      callbackUrl: typeof window !== "undefined" ? window.location.href : undefined,
      prompt: "select_account",
    });
  };

  const ensureAuthenticated = () => {
    if (session?.user?.id) {
      return true;
    }
    redirectToSignIn();
    return false;
  };

  const executeCheckout = async (targetPriceId: string) => {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        credentials: "include", // ensure auth cookies travel with the request
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: targetPriceId }),
      });
      if (res.status === 401) {
        setLoading(false);
        redirectToSignIn();
        return;
      }
      if (!res.ok) {
        const errorPayload = await res.json().catch(() => ({}));
        const message =
          (errorPayload as { error?: string }).error ||
          "Failed to create checkout session";
        throw new Error(message);
      }

      const { url } = (await res.json()) as { url: string };
      router.push(url); // full redirect to Stripe
    } catch (err) {
      console.error(err);
      alert("Unable to start checkout — please try again.");
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (!ensureAuthenticated()) {
      return;
    }

    if (planOptions.length > 1) {
      setIsPickerOpen(true);
      return;
    }

    await executeCheckout(defaultPriceId);
  };

  const handlePlanSelect = async (targetPriceId: string) => {
    if (!ensureAuthenticated()) {
      return;
    }
    setIsPickerOpen(false);
    await executeCheckout(targetPriceId);
  };

  const handleClosePicker = () => {
    setIsPickerOpen(false);
  };

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={handleClick}
        className={className}
      >
        {loading ? "Redirecting…" : label}
      </button>

      {planOptions.length > 1 && isPickerOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-base-100 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">Choose your plan</h2>
            <p className="mt-1 text-sm text-base-content/70">
              Select the billing cadence that works best for you.
            </p>

            <div className="mt-6 space-y-3">
              {planOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handlePlanSelect(option.id)}
                  className="w-full rounded-lg border border-base-300 px-4 py-3 text-left transition hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-base-content">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-sm text-base-content/70">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {(option.priceSummary || option.savingsLabel) && (
                      <div className="text-right">
                        {option.priceSummary && (
                          <div className="text-base font-semibold text-base-content">
                            {option.priceSummary}
                          </div>
                        )}
                        {option.savingsLabel && (
                          <div className="text-xs font-medium text-success">
                            {option.savingsLabel}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleClosePicker}
              className="btn btn-sm btn-ghost mt-6"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
