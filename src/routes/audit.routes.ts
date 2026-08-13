import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { listAuditLogs } from "../controllers/audit.controller";

export const auditRouter = Router();

// Only admins and the supervisor/auditor role should see the audit trail —
// this is the RBAC boundary your Chapter One spec calls out explicitly.
auditRouter.get("/", requireAuth, requireRole("ADMIN", "SUPERVISOR_AUDITOR"), listAuditLogs);