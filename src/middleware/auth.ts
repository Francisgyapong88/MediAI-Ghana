import { NextFunction, Request, Response } from "express";
import { readSessionToken, setSessionCookie, SESSION_COOKIE_NAME } from "../utils/session";
import { writeAuditLog } from "../utils/audit";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
    }
  }
}

export function attachSession(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const payload = readSessionToken(token);

  if (payload) {
    req.user = { id: payload.sub, role: payload.role };
    setSessionCookie(res, { sub: payload.sub, role: payload.role });
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    void writeAuditLog({ action: "ACCESS_DENIED", resource: req.path, outcome: "DENIED" });
    res.status(401).json({ error: "Unauthorized", message: "Authentication is required." });
    return;
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      void writeAuditLog({ userId: req.user?.id, action: "ACCESS_DENIED", resource: req.path, outcome: "DENIED" });
      res.status(403).json({ error: "Forbidden", message: "You do not have permission to perform this action." });
      return;
    }
    next();
  };
}