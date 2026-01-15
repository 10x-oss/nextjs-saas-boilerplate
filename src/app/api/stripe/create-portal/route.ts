import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/shared/utils/stripe.utils";
import { getServerSession } from "next-auth";
import authOptions from "@/shared/auth/authOptions";
import prisma from "@/shared/utils/database.utils";
import { withMiddleware } from "@/app/api/_middleware";

export const GET = withMiddleware(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in." },
      { status: 401 }
    );
  }

  try {
    const stripe = getStripe();
    const { searchParams } = new URL(request.url);
    const returnUrl = searchParams.get("returnUrl") ?? process.env.BASE_URL!;
    if (!returnUrl.startsWith(process.env.BASE_URL!)) {
      return NextResponse.json({ error: "Invalid returnUrl" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { customerId: true },
    });
    if (!user?.customerId) {
      return NextResponse.json(
        { error: "No associated Stripe customer found." },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the portal session." },
      { status: 500 }
    );
  }
});

// Support POST as used by the client ButtonAccount component
export const POST = withMiddleware(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in." },
      { status: 401 }
    );
  }

  try {
    const stripe = getStripe();
    const { returnUrl } = (await request.json().catch(() => ({}))) as {
      returnUrl?: string;
    };
    const base = process.env.BASE_URL!;
    const safeReturn =
      returnUrl && returnUrl.startsWith(base) ? returnUrl : base;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { customerId: true },
    });
    if (!user?.customerId) {
      return NextResponse.json(
        { error: "No associated Stripe customer found." },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.customerId,
      return_url: safeReturn,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the portal session." },
      { status: 500 }
    );
  }
});
