import { prisma } from "../config/prisma";

interface AuditEntry {
  userId?: number | null;
  action: string;
  resource?: string;
  resourceId?: string;
  outcome: "SUCCESS" | "FAILURE" | "DENIED";
}

/**
 * Write an audit event. Never throws — a logging failure must not break the
 * request it's describing, but we surface it to the console so it isn't
 * silently lost.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        outcome: entry.outcome,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log entry:", entry, err);
  }
}