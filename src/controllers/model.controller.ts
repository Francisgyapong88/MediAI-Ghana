import { Request, Response } from "express";
import { prisma } from "../config/prisma";

/**
 * Exposes the active model row so the UI can report the version it is
 * actually configured against, rather than a hardcoded string (FR-06).
 */
export async function getActiveModel(_req: Request, res: Response): Promise<void> {
  const model = await prisma.aiModel.findFirst({ where: { isActive: true } });

  if (!model) {
    res.status(503).json({
      error: "ServiceUnavailable",
      message: "No active model version is configured.",
    });
    return;
  }

  res.status(200).json(model);
}
export async function listModels(_req: Request, res: Response): Promise<void> {
  const models = await prisma.aiModel.findMany({ orderBy: { id: "desc" } });
  res.status(200).json(models);
}