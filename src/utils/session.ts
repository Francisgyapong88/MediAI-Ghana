import crypto from "node:crypto";
import { Response } from "express";
export const SESSION_COOKIE_NAME = "mediai_session";
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15-minute sliding inactivity timeout
export interface SessionPayload {
  /** user id */
  sub: number;
  role: string;
  /** timestamp (ms) of last activity */
  iat: number;
}
function sign(data: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing required environment variable: SESSION_SECRET");
  }
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}
/** Encode + sign a session payload into a single cookie-safe string. */
export function createSessionToken(payload: Omit<SessionPayload, "iat">): string {
  const full: SessionPayload = { ...payload, iat: Date.now() };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  const signature = sign(body);
  return `${body}.${signature}`;
}
/**
 * Verify a session token's signature and inactivity timeout.
 * Returns the decoded payload if valid, otherwise null.
 */
export function readSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expectedSignature = sign(body);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }
  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const age = Date.now() - payload.iat;
  if (age > SESSION_TIMEOUT_MS) {
    return null; // inactivity timeout exceeded
  }
  return payload;
}
/** Set the session cookie (HTTP-only, SameSite, secure in production). */
export function setSessionCookie(res: Response, payload: Omit<SessionPayload, "iat">): void {
  const token = createSessionToken(payload);
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TIMEOUT_MS,
    path: "/",
  });
}
/** Clear the session cookie on logout. */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}