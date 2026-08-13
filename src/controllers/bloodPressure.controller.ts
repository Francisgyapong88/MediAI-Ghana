import { Request, Response } from "express";
import { writeAuditLog } from "../utils/audit";

/**
 * Permanently disabled feature gate (Chapter Three §3.3.3 / §3.11.1).
 * Blood-pressure classification/referral logic is out of scope until a
 * qualified clinical adviser approves a versioned specification. This route
 * exists ONLY so security testing has a real endpoint to attempt bypassing —
 * it must never return anything but a disabled response, for any role,
 * including ADMIN.
 */
const FEATURE_ENABLED = false; // never set true without the documented clinical approval this gates on

export function bloodPressureGate(req: Request, res: Response): void {
  void writeAuditLog({
    userId: req.user?.id,
    action: "DISABLED_FEATURE_BYPASS_ATTEMPT",
    resource: "blood-pressure",
    outcome: "DENIED",
  });

  if (!FEATURE_ENABLED) {
    res.status(403).json({
      error: "FeatureDisabled",
      message:
        "Blood-pressure classification is disabled pending documented clinical approval and is not available in this prototype.",
    });
    return;
  }

  // Unreachable while FEATURE_ENABLED is false — intentionally no logic exists beyond this point.
  res.status(501).json({ error: "NotImplemented" });
}