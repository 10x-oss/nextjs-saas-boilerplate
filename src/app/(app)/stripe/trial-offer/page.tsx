import StartTrialButton from "@/core/payment/Stripe/StartTrialButton";
import ButtonAccount from "@/core/components/Button/ButtonAccount";

export default function TrialOfferPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your 14-day trial is active
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore every premium feature while your trial runs. When you&apos;re
            ready to continue after day 14, pick the billing cadence that
            makes sense for you.
          </p>
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
                    Keep exploring
                  </h3>
                  <p className="text-gray-600">
                    You already have full access while your trial is active.
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
                    Upgrade when ready
                  </h3>
                  <p className="text-gray-600">
                    Choose monthly or annual billing whenever you&apos;re ready to
                    convert.
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
                    Billing starts immediately
                  </h3>
                  <p className="text-gray-600">
                    Subscribe early if you prefer—payment begins as soon as you
                    confirm checkout.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <div className="text-center">
                <div className="space-y-4">
                  <StartTrialButton
                    label="Choose billing plan"
                    priceId={monthlyPriceId}
                    planOptions={planOptions}
                  />
                  <ButtonAccount />
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Upgrading today charges immediately and ends your trial early.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            Have questions? Contact our support team and we&apos;ll help
            you decide when to upgrade.
          </p>
        </div>
      </div>
    </main>
  );
}
