import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { verifyPassword } from "../utils/password";
import { setSessionCookie, clearSessionCookie } from "../utils/session";
import { writeAuditLog } from "../utils/audit";

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body ?? {};

  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "ValidationError", message: "Username is required." });
    return;
  }
  if (!password || typeof password !== "string") {
    res.status(400).json({ error: "ValidationError", message: "Password is required." });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { username },
    include: { role: true },
  });

  if (!user) {
    void writeAuditLog({ action: "LOGIN_FAILURE", resource: "auth", outcome: "FAILURE" });
    res.status(401).json({ error: "InvalidCredentials", message: "Invalid username or password." });
    return;
  }

  if (user.status !== "ACTIVE") {
    void writeAuditLog({ userId: user.id, action: "LOGIN_FAILURE", resource: "auth", outcome: "FAILURE" });
    res.status(401).json({ error: "AccountNotActive", message: "This account is not active." });
    return;
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    void writeAuditLog({ userId: user.id, action: "LOGIN_FAILURE", resource: "auth", outcome: "FAILURE" });
    res.status(401).json({ error: "InvalidCredentials", message: "Invalid username or password." });
    return;
  }

  setSessionCookie(res, { sub: user.id, role: user.role.name });

  void writeAuditLog({ userId: user.id, action: "LOGIN_SUCCESS", resource: "auth", outcome: "SUCCESS" });

  res.status(200).json({ id: user.id, username: user.username, role: user.role.name });
}

export function logout(req: Request, res: Response): void {
  clearSessionCookie(res);
  void writeAuditLog({ userId: req.user?.id, action: "LOGOUT", resource: "auth", outcome: "SUCCESS" });
  res.status(200).json({ message: "Logged out." });
}

export function me(req: Request, res: Response): void {
  res.status(200).json(req.user);
}