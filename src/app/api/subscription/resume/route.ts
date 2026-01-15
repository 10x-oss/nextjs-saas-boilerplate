import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/shared/auth/authOptions";
import { getStripe } from "@/shared/utils/stripe.utils";
import prisma from "@/shared/utils/database.utils";

export const POST = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId } = (await req.json()) as {
      subscriptionId: string;
    };
    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Missing subscriptionId" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Verify the subscription belongs to the current user via customer match
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { id: true, customerId: true },
    });
    if (!user?.customerId || sub.customer !== user.customerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resumed = await stripe.subscriptions.resume(subscriptionId);

    // Best-effort sync to DB for immediate UX; webhooks provide eventual consistency
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus:
            resumed.status === "active" ? "active" : (resumed.status as any),
        },
      });
    } catch (_) {
      // ignore; webhook will reconcile
    }

    return NextResponse.json({ status: resumed.status });
  } catch (err) {
    console.error("[resume] Error:", err);
    return NextResponse.json(
      { error: "Failed to resume subscription" },
      { status: 500 }
    );
  }
};


