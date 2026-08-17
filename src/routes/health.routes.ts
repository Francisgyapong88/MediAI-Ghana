import { Router } from "express";
import { prisma } from "../config/prisma";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// TEMPORARY SEED ENDPOINT - remove after use
healthRouter.get("/seed-diseases", async (_req, res) => {
  try {
    const diseaseNames = ["Malaria", "Typhoid fever", "Pneumonia", "Diabetes mellitus"];
    const created = [];
    for (const name of diseaseNames) {
      const disease = await prisma.disease.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      created.push(disease.name);
    }
    res.status(200).json({ success: true, diseases: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});