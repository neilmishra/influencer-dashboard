import "server-only";
import { PlatformSyncError } from "@/lib/social-sync/errors";

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new PlatformSyncError("TIMEOUT", "The platform request timed out.");
    }
    throw new PlatformSyncError("NETWORK_ERROR", "Could not reach the platform API.");
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const root = record(payload);
    const providerError = record(root?.error);
    const rawErrorCode = typeof root?.error === "string" ? root.error : null;
    const providerCode = providerError?.code ?? root?.error_code ?? rawErrorCode;
    const providerMessage = typeof providerError?.message === "string"
      ? providerError.message
      : typeof root?.error_description === "string"
        ? root.error_description
        : "";
    const authFailure = response.status === 401 || providerCode === 190 ||
      providerCode === "invalid_grant" ||
      /access token.{0,30}(expired|invalid|revoked)/i.test(providerMessage);

    if (response.status === 429) {
      const retryAfterHeader = response.headers.get("retry-after");
      const retryAfter = retryAfterHeader && /^\d+$/.test(retryAfterHeader)
        ? Number(retryAfterHeader)
        : undefined;
      throw new PlatformSyncError(
        "RATE_LIMITED",
        "The platform is rate-limiting requests. Try syncing again later.",
        retryAfter,
      );
    }
    if (authFailure) {
      throw new PlatformSyncError("TOKEN_REVOKED", "Reconnect this platform to continue syncing.");
    }
    if (response.status === 403) {
      throw new PlatformSyncError("PERMISSION_DENIED", "The connected account lacks the required permissions.");
    }
    throw new PlatformSyncError("PROVIDER_ERROR", "The platform rejected the sync request.");
  }

  const parsed = record(payload);
  if (!parsed) {
    throw new PlatformSyncError("INVALID_RESPONSE", "The platform returned an invalid response.");
  }
  return payload as T;
}

export function requireRecord(value: unknown, message = "The platform returned incomplete data.") {
  const parsed = record(value);
  if (!parsed) throw new PlatformSyncError("INVALID_RESPONSE", message);
  return parsed;
}

export function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}