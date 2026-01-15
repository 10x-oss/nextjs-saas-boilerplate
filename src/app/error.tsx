"use client";

import Link from "next/link";
import ButtonSupport from "@/core/components/Button/ButtonSupport";
import { RefreshIcon, HomeIcon } from "@/shared/svgs";
import { ErrorIllustration } from "@/shared/svgs/ErrorIllustration";

// A simple error boundary to show a nice error page if something goes wrong (Error Boundary)
// Users can contanct support, go to the main page or try to reset/refresh to fix the error
export default function Error({ error, reset }) {
  return (
    <div className="h-screen w-full flex flex-col justify-center items-center text-center gap-6 p-6">
      <div className="p-6 bg-white rounded-xl">
        <ErrorIllustration className="w-36 h-36 md:w-64 md:h-64" />
      </div>

      <p className="font-medium md:text-xl md:font-semibold">
        Something went wrong 🥲
      </p>

      <p className="text-red-500">{error?.message}</p>

      <div className="flex flex-wrap gap-4 justify-center">
        <button className="btn btn-sm" onClick={reset}>
          <RefreshIcon className="w-5 h-5" />
          Refresh
        </button>

        <ButtonSupport />

        <Link href="/" className="btn btn-sm">
          <HomeIcon className="w-5 h-5" />
          Home
        </Link>
      </div>
    </div>
  );
}
