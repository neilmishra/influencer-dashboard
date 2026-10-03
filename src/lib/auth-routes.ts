import type { Role } from "@/generated/prisma/enums";

export function dashboardRouteForRole(role: Role) {
  switch (role) {
    case "BRAND":
      return "/dashboard/brand";
    case "CREATOR":
    case "ADMIN":
      return "/";
  }
}