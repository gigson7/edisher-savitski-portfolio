import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

// ─── Constants ────────────────────────────────────────────────────────────────

const COOKIE_NAME = "admin-session";
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Public admin routes that do NOT require authentication
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Allow public admin routes through without auth
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Check for session cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the JWT
  let payload: Awaited<ReturnType<typeof jwtVerify>>["payload"];
  try {
    const result = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
    payload = result.payload;
  } catch {
    // Invalid or expired token — redirect to login
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Rolling session refresh ───────────────────────────────────────────────
  // If the token is past 50% of its 7-day lifetime, issue a fresh one.
  const iat = payload.iat as number | undefined;
  const exp = payload.exp as number | undefined;

  if (typeof iat === "number" && typeof exp === "number") {
    const lifetime = exp - iat;
    const elapsed = Math.floor(Date.now() / 1000) - iat;

    if (elapsed > lifetime / 2) {
      const newToken = await new SignJWT({
        userId: payload.userId,
        email: payload.email,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .setIssuedAt()
        .sign(getJwtSecret());

      const response = NextResponse.next();
      response.cookies.set(COOKIE_NAME, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_DURATION_SECONDS,
        path: "/",
      });
      return response;
    }
  }

  // Token is valid and within first half of lifetime — pass through
  return NextResponse.next();
}

// ─── Route Matcher ────────────────────────────────────────────────────────────

export const config = {
  matcher: ["/admin/:path*"],
};
