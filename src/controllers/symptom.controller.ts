import { Request, Response } from "express";
import { prisma } from "../config/prisma";

/**
 * Serves the application vocabulary from the frozen SYMPTOM_MAP (FR-04).
 * Disabled terms are returned too, not filtered out, so the exclusion in
 * Chapter Three §3.6 is visible in the UI and testable rather than absent.
 */
export async function listSymptoms(_req: Request, res: Response): Promise<void> {
  const [symptoms, activeMap] = await Promise.all([
    prisma.symptom.findMany({
      select: { id: true, name: true, isEnabled: true },
      orderBy: { name: "asc" },
    }),
    prisma.symptomMap.findFirst({ where: { isActive: true } }),
  ]);

  if (!activeMap) {
    // Fail closed — never serve a vocabulary that isn't tied to a map version.
    res.status(503).json({
      error: "ServiceUnavailable",
      message: "No active symptom-map version is configured.",
    });
    return;
  }

  res.status(200).json({ mapVersion: activeMap.version, symptoms });
}