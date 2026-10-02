import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const isPublicRoute =
    pathname === "/signup" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/p/") ||
    pathname === "/campaigns" ||
    /^\/api\/campaigns\/[^/]+\/apply$/.test(pathname);

  if (!request.auth && !isPublicRoute) {
    return NextResponse.redirect(new URL("/signup", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};