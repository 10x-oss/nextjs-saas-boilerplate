import { redirect } from "next/navigation";

/**
 * When a user cancels out of Stripe Checkout we simply send them back home.
 * Any in-app banners (e.g., trial banner) will continue to prompt them.
 */
export default function StripeCancelPage() {
  redirect("/home");
}
