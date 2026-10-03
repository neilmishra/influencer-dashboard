import type { UserRole } from "@/generated/prisma/enums";

export function dashboardRouteForRole(role: UserRole) {
  switch (role) {
    case "BRAND":
      return "/dashboard/brand";
    case "CREATOR":
    case "ADMIN":
      return "/";
  }
}