"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { z } from "zod";
import authOptions from "@/shared/auth/authOptions";
import prisma from "@/shared/utils/database.utils";
import { getStripe } from "@/shared/utils/stripe.utils";

// ─────────────────────────────────────────────────────────────────────────────
// Response Types
// ─────────────────────────────────────────────────────────────────────────────

type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─────────────────────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────────────────────

const updateUserSettingsSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
  image: z.string().url("Invalid image URL").optional(),
  onboardingCompleted: z.boolean().optional(),
});

export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Server Actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update user settings
 *
 * @example
 * ```tsx
 * import { updateUserSettings } from "@/app/actions/user.actions";
 *
 * // In a client component:
 * const result = await updateUserSettings({ name: "New Name" });
 * if (result.success) {
 *   console.log("Updated:", result.data);
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export async function updateUserSettings(
  input: UpdateUserSettingsInput
): Promise<ActionResponse<{ id: string; name: string | null }>> {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // 2. Validate input
    const parseResult = updateUserSettingsSchema.safeParse(input);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { success: false, error: errorMessage };
    }

    const validatedData = parseResult.data;

    // 3. Perform the update
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.image !== undefined && { image: validatedData.image }),
        ...(validatedData.onboardingCompleted !== undefined && {
          onboardingCompleted: validatedData.onboardingCompleted,
        }),
      },
      select: {
        id: true,
        name: true,
      },
    });

    // 4. Revalidate cached data
    revalidatePath("/settings");
    revalidatePath("/dashboard");

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("[user.actions] updateUserSettings error:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

/**
 * Delete user account
 *
 * Permanently deletes the user's account and all associated data.
 * If a Stripe subscription exists, it will be cancelled first.
 *
 * @example
 * ```tsx
 * import { deleteAccount } from "@/app/actions/user.actions";
 *
 * // In a client component with confirmation:
 * const handleDelete = async () => {
 *   if (!confirm("Are you sure? This cannot be undone.")) return;
 *
 *   const result = await deleteAccount();
 *   if (result.success) {
 *     // Redirect to home or sign-out
 *     window.location.href = "/";
 *   } else {
 *     console.error("Error:", result.error);
 *   }
 * };
 * ```
 */
export async function deleteAccount(): Promise<ActionResponse> {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // 2. Fetch user data before deletion
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
      return { success: false, error: "User not found" };
    }

    // 3. Cancel Stripe subscription if present (best-effort)
    if (user.subscriptionId) {
      try {
        const stripe = getStripe();
        await stripe.subscriptions.cancel(user.subscriptionId);
      } catch (err) {
        console.warn("[user.actions] Failed to cancel Stripe subscription:", err);
        // Continue with deletion - subscription cancellation is best-effort
      }
    }

    // 4. Delete user (cascades to related records via Prisma schema)
    await prisma.user.delete({ where: { id: userId } });

    // 5. Revalidate all user-related paths
    revalidatePath("/");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("[user.actions] deleteAccount error:", error);
    return { success: false, error: "Failed to delete account" };
  }
}
