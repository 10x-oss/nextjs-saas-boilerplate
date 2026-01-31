import "server-only";
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Stripe is not configured. Missing STRIPE_SECRET_KEY.");
    }
    stripeInstance = new Stripe(secretKey);
  }
  return stripeInstance;
}
