"use server";

import { revalidatePath } from "next/cache";
import { requireDashboardRole } from "@/lib/require-dashboard-role";
import { safeSyncMessage } from "@/lib/social-sync/errors";
import { syncCreatorPlatforms } from "@/lib/social-sync/sync";
import type { SyncActionState } from "@/components/settings/syncTypes";

export async function syncCreatorPlatformsAction(
  previousState: SyncActionState,
  formData: FormData,
): Promise<SyncActionState> {
  if (!formData.has("sync")) return previousState;
  const session = await requireDashboardRole("CREATOR");
  try {
    const outcomes = await syncCreatorPlatforms(session.user.id);
    if (outcomes.some((outcome) => outcome.status === "synced")) {
      revalidatePath("/settings");
      revalidatePath("/p/[handle]", "page");
    }
    return { outcomes, error: null };
  } catch (error) {
    const safeError = safeSyncMessage(error);
    return { outcomes: [], error: safeError.message };
  }
}