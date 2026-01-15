import React from "react";
import AppShell from "@/app/AppShell";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell initialSession={null}>{children}</AppShell>;
}
