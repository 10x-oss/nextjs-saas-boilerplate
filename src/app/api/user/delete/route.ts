import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/shared/auth/authOptions";
import prisma from "@/shared/utils/database.utils";
import { withMiddleware } from "@/app/api/_middleware";
import { getStripe } from "@/shared/utils/stripe.utils";

/**
 * DELETE /api/user/delete
 * Deletes the authenticated user's account and all associated data (cascades).
 * If a Stripe subscription exists, attempts to cancel it first.
 */
export const DELETE = withMiddleware(async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch subscription info before deletion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        subscriptionId: true,
        customerId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Best-effort cancel Stripe subscription if present
    try {
      if (user.subscriptionId) {
        const stripe = getStripe();
        await stripe.subscriptions.cancel(user.subscriptionId);
      }
    } catch (err) {
      console.warn("[user.delete] Failed to cancel Stripe subscription:", err);
      // continue – account deletion should still proceed
    }

    // Delete user (relational rows cascade via Prisma schema)
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[user.delete] Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
});


