import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import prisma from "@/shared/utils/database.utils";
import { User } from "@prisma/client";

export async function withProtectedRoute(): Promise<User> {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      customerId: true,
      subscriptionStatus: true,
      subscriptionId: true,
      priceId: true,
      onboardingCompleted: true,
      hasLifetimeAccess: true,
      uuid: true,
      createdAt: true,
      updatedAt: true,
      trialEndDate: true,
      trialStartDate: true,
      subscribedAt: true,
      subscriptionEndDate: true,
      paymentFingerprint: true,
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Lifetime access users bypass all subscription checks
  if (user.hasLifetimeAccess) {
    return user;
  }

  const hasActiveSubscription = user.subscriptionStatus === "active";

  // Free tier users (status: "new") can access the app with board limits
  // No need to redirect them

  if (!hasActiveSubscription && user.subscriptionStatus !== "new") {
    redirect("/stripe/subscription-expired");
  }

  return user;
}
