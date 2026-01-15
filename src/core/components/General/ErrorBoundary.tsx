"use client";

import React from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import ButtonSupport from "../Button/ButtonSupport";
import { HomeIcon } from "@/shared/svgs";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
  }

  override render() {
    if (this.state.errorInfo) {
      return (
        <>
          <div className="h-screen w-full flex flex-col justify-center items-center text-center gap-6 p-6">
            <p className="font-medium">Something went wrong 🥲</p>

            <p className="text-red-500">{this.state.error?.message}</p>

            <ButtonSupport showTextOnSmall={true} />

            <Link href="/" className="btn btn-sm">
              <HomeIcon />
              Home
            </Link>

            <button className="btn btn-sm btn-ghost" onClick={() => signOut()}>
              Logout
            </button>
          </div>
        </>
      );
    }
    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
