export type SyncErrorCode =
  | "NOT_CONNECTED"
  | "TOKEN_EXPIRED"
  | "TOKEN_REVOKED"
  | "PERMISSION_DENIED"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INVALID_RESPONSE"
  | "PROVIDER_ERROR";

export class PlatformSyncError extends Error {
  constructor(
    readonly code: SyncErrorCode,
    message: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "PlatformSyncError";
  }
}

export function safeSyncMessage(error: unknown): { code: string; message: string } {
  if (error instanceof PlatformSyncError) {
    return { code: error.code, message: error.message };
  }
  return {
    code: "PROVIDER_ERROR",
    message: "The platform could not be synced right now. Try again later.",
  };
}