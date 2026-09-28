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
