import { Router } from "express";
import { prisma } from "../config/prisma";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// TEMPORARY FIX ENDPOINT - remove after use
healthRouter.get("/fix-disease-names", async (_req, res) => {
  try {
    const renames: Record<string, string> = {
      "Malaria": "malaria",
      "Typhoid fever": "typhoid_fever",
      "Pneumonia": "pneumonia",
      "Diabetes mellitus": "diabetes_mellitus",
    };
    const updated = [];
    for (const [oldName, newName] of Object.entries(renames)) {
      const disease = await prisma.disease.findUnique({ where: { name: oldName } });
      if (disease) {
        await prisma.disease.update({ where: { id: disease.id }, data: { name: newName } });
        updated.push(`${oldName} -> ${newName}`);
      }
    }
    const all = await prisma.disease.findMany();
    res.status(200).json({ success: true, updated, currentNames: all.map((d) => d.name) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});