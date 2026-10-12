import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ApiError } from "./api";
import { connectDB } from "./db";
import User from "@/models/User";

const COOKIE_NAME = "token";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new ApiError(503, "Server auth is not configured.");
  return new TextEncoder().encode(secret);
}

// Signs a JWT and stores it in an httpOnly cookie (JavaScript in the browser cannot read it).
export async function setSessionCookie(user) {
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user._id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SEVEN_DAYS,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE_NAME);
}

// Returns the logged-in user (fresh from the database) or null.
export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const key = secretKey();
  let userId;
  try {
    const { payload } = await jwtVerify(token, key);
    userId = payload.sub;
  } catch {
    return null; // expired or tampered token
  }

  await connectDB();
  const user = await User.findById(userId);
  if (!user || user.isSuspended) return null;
  return user;
}

// Use at the top of every protected API route. `roles` must list every allowed role.
export async function requireUser(roles) {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Please log in to continue.");
  if (roles && !roles.includes(user.role)) {
    throw new ApiError(403, "You do not have permission to do that.");
  }
  return user;
}

// Only these fields are ever sent to the browser (never passwordHash).
export function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    organizationName: user.organizationName,
    phone: user.phone,
    address: user.address,
    isVerified: user.isVerified,
  };
}
