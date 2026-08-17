import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// TEMPORARY SEED ENDPOINT - remove after use
healthRouter.get("/seed-supervisor", async (_req, res) => {
  try {
    const role = await prisma.role.upsert({
      where: { name: "SUPERVISOR_AUDITOR" },
      update: {},
      create: { name: "SUPERVISOR_AUDITOR" },
    });

    const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
    const user = await prisma.user.upsert({
      where: { username: "supervisor1" },
      update: { passwordHash, roleId: role.id },
      create: { username: "supervisor1", passwordHash, roleId: role.id },
    });

    res.status(200).json({ success: true, username: user.username });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});