"use client";

import { useMemo } from "react";
import { Crisp } from "crisp-sdk-web";
import { usePathname } from "next/navigation";
import { SupportIcon } from "@/shared/svgs";
import {
  CRISP_WEBSITE_ID,
  getCrispRoutes,
  normalizeRoute,
} from "@/shared/utils/crisp";

// Use this button if chat is hidden on some routes. NEXT_PUBLIC_CRISP_ROUTES in .env has routes set where Crisp will be shown.
// If Crisp is not enabled, it will open the support email in the default email client.

const ButtonSupport = ({ showTextOnSmall = false }) => {
  const pathname = usePathname();
  const crispRoutes = useMemo(() => getCrispRoutes(), []);
  const normalizedPathname = normalizeRoute(pathname || "/");
  const crispAvailableHere =
    Boolean(CRISP_WEBSITE_ID) && crispRoutes.includes(normalizedPathname);
  const handleClick = () => {
    if (crispAvailableHere && CRISP_WEBSITE_ID) {
      if (!Crisp.isCrispInjected()) {
        Crisp.configure(CRISP_WEBSITE_ID);
      }
      Crisp.chat.show();
      Crisp.chat.open();
      return;
    }

    if (process.env["NEXT_PUBLIC_SUPPORT_EMAIL"]) {
      window.open(
        `mailto:${process.env["NEXT_PUBLIC_SUPPORT_EMAIL"]}?subject=Need help with ${process.env["NEXT_PUBLIC_APP_NAME"] ?? "zAxis"}`,
        "_blank"
      );
    }
  };

  return (
    <button
      className="btn btn-sm"
      onClick={handleClick}
      data-tooltip-id="tooltip"
      data-tooltip-content="Talk to support"
      title="Chat with support"
    >
      <SupportIcon />
      {showTextOnSmall && "Support"}
    </button>
  );
};

export default ButtonSupport;
