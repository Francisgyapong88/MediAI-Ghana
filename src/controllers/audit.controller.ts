import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function listAuditLogs(_req: Request, res: Response): Promise<void> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 100, // cap it — this is a demo/prototype, not a paginated log viewer
    // Resolve the actor so the audit view can show account and role rather
    // than a bare foreign key. userId is nullable: an unauthenticated
    // attempt still writes a row, and that row has no actor.
    include: { user: { include: { role: true } } },
  });
  res.status(200).json(logs);
}