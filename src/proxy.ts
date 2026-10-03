import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";
import { dashboardRouteForRole } from "@/lib/auth-routes";

const validRoles = ["ADMIN", "BRAND", "CREATOR"] satisfies readonly Role[];
const roleRoutes: { prefix: string; roles: readonly Role[] }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/dashboard/brand", roles: ["BRAND"] },
  { prefix: "/dashboard/creator", roles: ["CREATOR"] },
  { prefix: "/brand", roles: ["BRAND"] },
  { prefix: "/campaigns/new", roles: ["BRAND"] },
  { prefix: "/creators", roles: ["BRAND"] },
  { prefix: "/creator", roles: ["CREATOR"] },
];

function isUserRole(value: unknown): value is Role {
  return typeof value === "string" && validRoles.some((role) => role === value);
}

function routeMatches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/newsletter" ||
    pathname.startsWith("/p/") ||
    pathname === "/campaigns" ||
    /^\/api\/campaigns\/[^/]+\/apply$/.test(pathname) ||
    /^\/api\/applications\/[^/]+\/status$/.test(pathname);

  if (isPublicRoute) return NextResponse.next();

  const user = request.auth?.user;
  if (!user?.id || !isUserRole(user.role)) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (pathname === "/" && user.role === "BRAND") {
    return NextResponse.redirect(new URL("/dashboard/brand", request.nextUrl));
  }

  const roleRoute = roleRoutes.find(({ prefix }) => routeMatches(pathname, prefix));
  if (roleRoute && user.role !== "ADMIN" && !roleRoute.roles.includes(user.role)) {
    return NextResponse.redirect(new URL(dashboardRouteForRole(user.role), request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};