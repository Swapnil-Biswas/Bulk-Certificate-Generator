import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
    const isAdmin = req.nextUrl.pathname.startsWith("/admin");

    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check for approval status for non-admins
    if (token.role !== "ADMIN" && token.approvalStatus !== "APPROVED") {
      // Redirect to login with a specific error code
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "PendingApproval");
      return NextResponse.redirect(url);
    }

    if (isAdmin && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
