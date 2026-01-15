/* ------------------------------------------------------------------
   src/core/components/Button/ButtonCTA.tsx
   – Modern, professional call-to-action button shown when user is not authenticated
------------------------------------------------------------------- */
"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";

/**
 * Professional CTA button for unauthenticated users with modern styling.
 *
 * Props
 *  text       – button label (default: "Sign Up / Log In")
 *  size       – button size: 'sm', 'md', or 'lg'
 *  variant    – button style: 'primary', 'secondary', or 'outline'
 *  fullWidth  – whether button should take full width of container
 *  className  – extra Tailwind classes if needed
 */
const ButtonCTA = ({
  text = "Sign Up / Log In",
  size = "md",
  variant = "primary",
  fullWidth = false,
  className = "",
}: {
  text?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline";
  fullWidth?: boolean;
  className?: string;
}) => {
  const { status } = useSession(); // 'loading' | 'authenticated' | 'unauthenticated'
  const [loading, setLoading] = useState(false);

  // If somehow rendered while already authed, hide quietly
  if (status === "authenticated") return null;

  const handleClick = async () => {
    setLoading(true);
    // Direct Google OAuth sign-in; callback defaults to home
    await signIn("google", {
      callbackUrl: process.env["NEXT_PUBLIC_CALLBACK_URL"] || "/",
      prompt: "select_account",
    });
    setLoading(false);
  };

  // Map size prop to button sizes
  const sizeClasses = {
    sm: "btn-sm px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "btn-lg px-6 py-3",
  }[size];

  // Map variant prop to button styles
  const variantClasses = {
    primary: "btn-primary bg-gradient-to-r from-primary to-primary/90 text-primary-content shadow-md hover:shadow-lg",
    secondary: "btn-secondary bg-gradient-to-r from-secondary to-secondary/90 text-secondary-content shadow-sm hover:shadow-md",
    outline: "btn-outline border-2 hover:bg-base-200/50 hover:border-primary",
  }[variant];

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={text}
      className={`
        btn ${sizeClasses} ${variantClasses} 
        ${fullWidth ? 'w-full' : ''} 
        justify-center items-center gap-2
        transition-all duration-200 ease-in-out
        rounded-lg font-medium
        hover:scale-[1.02] active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
        disabled:opacity-70 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <>
          <span className="relative z-10">{text}</span>
        </>
      )}
    </button>
  );
};

export default ButtonCTA;
