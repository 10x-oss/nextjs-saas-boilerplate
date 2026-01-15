import React from "react";
import { getServerSession } from "next-auth";
import AppShell from "@/app/AppShell";
import authOptions from "@/shared/auth/authOptions";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return <AppShell initialSession={session}>{children}</AppShell>;
}
