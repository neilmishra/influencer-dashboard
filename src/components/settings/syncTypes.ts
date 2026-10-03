import type { PlatformSyncOutcome } from "@/lib/social-sync/sync";

export interface SyncActionState {
  outcomes: PlatformSyncOutcome[];
  error: string | null;
}

export const initialSyncActionState: SyncActionState = {
  outcomes: [],
  error: null,
};