import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token as any;

    if (pathname.startsWith("/owner-dashboard")) {
      if (token?.role !== "OWNER") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: { authorized: () => true },
  }
);

export const config = {
  matcher: ["/owner-dashboard/:path*", "/dashboard/:path*", "/messages/:path*", "/feed/:path*", "/feed"],
};
