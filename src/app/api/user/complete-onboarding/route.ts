import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/shared/auth/authOptions";
import prisma from "@/shared/utils/database.utils";
import { withMiddleware } from "@/app/api/_middleware";
import { capturePosthogEvent, flushPosthog } from "@/lib/posthog/server";
import { ANALYTICS_EVENTS } from "@/shared/analytics/events";

export const POST = withMiddleware(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const variant = body && typeof body.variant === "string" ? body.variant : undefined;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompleted: true },
  });

  await capturePosthogEvent({
    distinctId: session.user.id,
    event: ANALYTICS_EVENTS.ONBOARDING_COMPLETE,
    properties: { variant },
  });
  await flushPosthog();

  return NextResponse.json({ success: true });
});

