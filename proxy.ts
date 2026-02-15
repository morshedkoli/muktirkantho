import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const TOKEN_NAME = "mk_admin_token";
const encoder = new TextEncoder();

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths (login page)
  if (pathname === "/admin/login") {
    // If user is already logged in and tries to access login page, redirect to dashboard
    const token = request.cookies.get(TOKEN_NAME)?.value;
    if (token) {
      try {
        const secret = process.env.JWT_SECRET;
        if (secret) {
          await jwtVerify(token, encoder.encode(secret));
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        }
      } catch {
        // Token invalid, allow access to login
      }
    }
    return NextResponse.next();
  }

  // Check if accessing admin routes (excluding login)
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(TOKEN_NAME)?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret) {
      // Redirect to login if no token or secret
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token
      const { payload } = await jwtVerify(token, encoder.encode(secret));
      if (payload.role !== "admin") {
        throw new Error("Invalid role");
      }
      return NextResponse.next();
    } catch {
      // Token invalid, clear cookie and redirect to login
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete(TOKEN_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
