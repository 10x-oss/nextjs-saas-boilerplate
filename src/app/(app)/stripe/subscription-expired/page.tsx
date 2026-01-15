import StartTrialButton from "@/core/payment/Stripe/StartTrialButton";
import ButtonAccount from "@/core/components/Button/ButtonAccount";

export default function SubscriptionExpired() {
  const monthlyPriceId = process.env.STRIPE_PRICE_ID_BASIC;
  const yearlyPriceId = process.env.STRIPE_PRICE_ID_YEARLY;

  if (!monthlyPriceId) {
    throw new Error("STRIPE_PRICE_ID_BASIC env var is required");
  }

  const planOptions = [
    {
      id: monthlyPriceId,
      label: "Monthly billing",
      description: "Billed monthly",
      priceSummary: "$8.95 / month",
    },
    ...(yearlyPriceId
      ? [
          {
            id: yearlyPriceId,
            label: "Annual billing",
            description: "Billed annually",
            priceSummary: "$59.95 / year",
            savingsLabel: "Save 40%",
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-red-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Subscription Has Ended
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We&apos;re sorry to see you go. Reactivate your subscription to regain
              access to all premium features.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Instant Access
                  </h3>
                  <p className="text-gray-600">
                    Get back to work immediately after reactivation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    All Features Restored
                  </h3>
                  <p className="text-gray-600">
                    Full access to all premium tools and capabilities
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 text-blue-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Data Preserved
                  </h3>
                  <p className="text-gray-600">
                    All your previous work and settings remain intact
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="text-center">
                <div className="space-y-4">
                  <StartTrialButton
                    priceId={monthlyPriceId}
                    planOptions={planOptions}
                    label="Renew Subscription"
                  />
                  <ButtonAccount />
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Your data is safe and ready for your return
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Need help? Contact our support team for assistance</p>
        </div>
      </div>
    </main>
  );
}
