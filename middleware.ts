import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    if (isAdminRoute && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/profile/:path*",
    "/profile",
    "/search/:path*",
    "/search",
    "/admin/:path*",
    "/recipes/:path*",
    "/planner/:path*",
    "/planner",
    "/favorites/:path*",
    "/favorites",
    "/chat/:path*",
    "/chat",
  ],
};
