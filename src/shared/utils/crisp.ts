/**
 * Shared helpers for configuring and displaying the Crisp chat widget.
 */
export const CRISP_WEBSITE_ID =
  process.env.NEXT_PUBLIC_CRISP_ID || "d7b1bc6a-eaa7-4bed-8ac1-a137ffbe4791";

const DEFAULT_ROUTES = ["/"];

export const normalizeRoute = (input?: string | null) => {
  if (!input || input === "/") {
    return "/";
  }

  return input.endsWith("/") ? input.slice(0, -1) : input;
};

export const getCrispRoutes = () => {
  const routes = process.env.NEXT_PUBLIC_CRISP_ROUTES?.split(",") || [];

  const normalizedRoutes = routes
    .map((route) => route.trim())
    .filter((route) => route.length > 0)
    .map((route) => normalizeRoute(route));

  if (normalizedRoutes.length === 0) {
    return DEFAULT_ROUTES;
  }

  return normalizedRoutes;
};
