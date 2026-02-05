"use client";

import { useState } from "react";
import { axiosInstance, handleApiError } from "@/shared/utils/api.utils";
import { CheckoutIcon } from "@/shared/svgs";

interface ButtonCheckoutProps {
  priceId: string;
}

// This component is used to create Stripe Checkout Sessions
// It calls the /api/stripe/create-checkout-session route with the priceId, successUrl and cancelUrl
// It assumes the user is logged in but you can remove this logic on the API route
const ButtonCheckout = ({ priceId }: ButtonCheckoutProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const { data } = await axiosInstance.post(
        "/stripe/create-checkout-session",
        {
          priceId,
          successUrl: window.location.href,
          cancelUrl: window.location.href,
        }
      );

      window.location.href = data.url;
    } catch (error) {
      handleApiError(error);
    }

    setIsLoading(false);
  };

  return (
    <button
      className="btn btn-primary btn-block group"
      onClick={() => handlePayment()}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : (
        <CheckoutIcon />
      )}
      Get Started
    </button>
  );
};

export default ButtonCheckout;
