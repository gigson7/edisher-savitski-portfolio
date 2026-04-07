import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify, decodeJwt } from "jose";
import { cookies } from "next/headers";
import * as crypto from "crypto";
import { prisma } from "./prisma";

// ─── Constants ───────────────────────────────────────────────────────────────

const COOKIE_NAME = "admin-session";
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days
const BCRYPT_COST = 12;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

// ─── Password Utilities ───────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_COST);
}

export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return compare(password, hashed);
}

// ─── Session / JWT ────────────────────────────────────────────────────────────

export async function createSession(
  userId: number,
  email: string
): Promise<string> {
  const secret = getJwtSecret();
  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_DURATION_SECONDS)
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<{
  userId: number;
  email: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const userId = payload.userId;
    const email = payload.email;

    if (typeof userId !== "number" || typeof email !== "string") return null;

    return { userId, email };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return { success: false, error: "Invalid email or password" };
    }

    await createSession(user.id, user.email);
    return { success: true };
  } catch {
    return { success: false, error: "An error occurred. Please try again." };
  }
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function createPasswordResetToken(
  email: string
): Promise<string | null> {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return null;

  // Invalidate all prior unused tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { adminUserId: user.id, used: false },
    data: { used: true },
  });

  // Generate a random token and store its SHA-256 hash
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      adminUserId: user.id,
      expiresAt,
    },
  });

  return rawToken;
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Atomically consume the token — only succeeds if valid, unused, and not expired
    const updated = await prisma.passwordResetToken.updateMany({
      where: {
        tokenHash,
        used: false,
        expiresAt: { gt: new Date() },
      },
      data: { used: true },
    });

    if (updated.count === 0) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    // Find the token record to get the user id
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    const newPasswordHash = await hashPassword(newPassword);
    await prisma.adminUser.update({
      where: { id: tokenRecord.adminUserId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true };
  } catch {
    return { success: false, error: "An error occurred. Please try again." };
  }
}

// ─── Session Refresh ──────────────────────────────────────────────────────────

export async function refreshSessionIfNeeded(
  token: string
): Promise<string | null> {
  try {
    // Decode without verifying expiry to inspect claims
    const payload = decodeJwt(token);

    const iat = payload.iat;
    const exp = payload.exp;
    const userId = payload.userId;
    const email = payload.email;

    if (
      typeof iat !== "number" ||
      typeof exp !== "number" ||
      typeof userId !== "number" ||
      typeof email !== "string"
    ) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const midpoint = iat + (exp - iat) / 2;

    // Only refresh if past the 50% mark of the token's lifetime
    if (now < midpoint) {
      return null;
    }

    // Issue a fresh token (no cookie set here — caller should handle via createSession
    // or directly, since this is called from middleware which can't use cookies() directly)
    const secret = getJwtSecret();
    const newToken = await new SignJWT({ userId, email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(now)
      .setExpirationTime(now + SESSION_DURATION_SECONDS)
      .sign(secret);

    return newToken;
  } catch {
    return null;
  }
}
