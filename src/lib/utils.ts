import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  options?: { compact?: boolean; currency?: string },
): string {
  const currency = options?.currency ?? "USD";
  if (!Number.isFinite(value)) return "$0";

  if (options?.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

export function formatNumber(
  value: number,
  options?: { compact?: boolean; digits?: number },
): string {
  if (!Number.isFinite(value)) return "0";

  if (options?.compact) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: options.digits ?? 1,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: options?.digits ?? 0,
  }).format(value);
}

export function formatPercent(
  value: number,
  options?: { alreadyPercent?: boolean; digits?: number },
): string {
  if (!Number.isFinite(value)) return "0%";
  const percent = options?.alreadyPercent ? value : value * 100;
  return `${percent.toFixed(options?.digits ?? 1)}%`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export type RouteContext = "creators_list" | "campaigns_list" | "campaign_detail" | "default";

export function getRouteContext(pathname: string): RouteContext {
  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    return "default";
  }
  if (pathname === "/creators" || pathname.startsWith("/creators/")) {
    return "creators_list";
  }
  if (pathname === "/campaigns" || pathname.startsWith("/campaigns/")) {
    // If it's a detail page like /campaigns/[id] and not just /campaigns or /campaigns/new
    // Actually the instruction just says "If path includes /campaigns -> return 'campaigns_list'"
    // But they mentioned 'campaign_detail'. I'll handle detail explicitly if there's a third segment, otherwise campaigns_list.
    // Or I'll just check if it matches a UUID pattern or generic detail path.
    // Let's just do:
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "campaigns" && segments.length > 1 && segments[1] !== "new") {
      return "campaign_detail";
    }
    return "campaigns_list";
  }
  return "default";
}

