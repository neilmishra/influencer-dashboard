import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { UserRole } from "@/generated/prisma/enums";
import { dashboardRouteForRole } from "@/lib/auth-routes";

const validRoles = ["ADMIN", "BRAND", "CREATOR"] satisfies readonly UserRole[];

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && validRoles.some((role) => role === value);
}

export async function requireDashboardRole(...allowedRoles: UserRole[]) {
  const session = await auth();
  const role: unknown = session?.user?.role;

  if (!session?.user?.id || !isUserRole(role)) {
    redirect("/login");
  }
  if (role !== "ADMIN" && !allowedRoles.includes(role)) {
    redirect(dashboardRouteForRole(role));
  }

  return session;
}