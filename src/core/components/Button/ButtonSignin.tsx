"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/shared/toast";
import Image from "next/image";
import { logEvent } from "@/shared/utils/analytics";

interface ButtonSigninProps {
  text?: string;
  extraStyle?: string;
}

const ButtonSignin = ({ text = "Join the Beta", extraStyle }: ButtonSigninProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const handleClick = async () => {
    if (isLoading) {
      toast.info("Checking your session, please wait…");
      return;
    }

    if (status === "authenticated") {
      toast.info("Already authenticated, redirecting...");
      router.push(process.env["NEXT_PUBLIC_CALLBACK_URL"] || "/");
      return;
    }

    logEvent("gated_action_triggered", { action: "signin" });
    try {
      await signIn("google", {
        callbackUrl: process.env["NEXT_PUBLIC_CALLBACK_URL"] || "/",
        prompt: "select_account",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to sign in: ${error.message}`);
      } else {
        toast.error("Failed to sign in: An unknown error occurred");
      }
    }
  };

  if (status === "authenticated") {
    return (
      <Link
        href={process.env["NEXT_PUBLIC_CALLBACK_URL"] || "/"}
        className={`btn btn-primary ${extraStyle ? extraStyle : ""}`}
      >
        {session.user?.image ? (
          <Image
            src={session.user?.image}
            alt={session.user?.name || "Account"}
            className="w-6 h-6 rounded-full shrink-0"
            referrerPolicy="no-referrer"
            width={24}
            height={24}
          />
        ) : (
          <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
            {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
          </span>
        )}
        {session.user?.name || session.user?.email || "Account"}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`btn btn-primary ${extraStyle ? extraStyle : ""}`}
      onClick={handleClick}
      aria-label={text}
      disabled={isLoading}
      aria-disabled={isLoading}
    >
      {isLoading ? "Checking session…" : text}
    </button>
  );
};

export default ButtonSignin;
