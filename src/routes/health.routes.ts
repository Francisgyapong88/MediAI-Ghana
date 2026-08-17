import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// TEMPORARY SEED ENDPOINT - remove after use
healthRouter.get("/seed-quick", async (_req, res) => {
  try {
    const roleNames = ["ADMIN", "EVALUATOR", "SUPERVISOR_AUDITOR"];
    const roles: Record<string, number> = {};
    for (const name of roleNames) {
      const role = await prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      roles[name] = role.id;
    }

    const users = [
      { username: "admin", password: "ChangeMe123!", role: "ADMIN" },
      { username: "evaluator", password: "ChangeMe123!", role: "EVALUATOR" },
    ];

    const created = [];
    for (const u of users) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      const user = await prisma.user.upsert({
        where: { username: u.username },
        update: { passwordHash, roleId: roles[u.role] },
        create: { username: u.username, passwordHash, roleId: roles[u.role] },
      });
      created.push(user.username);
    }

    res.status(200).json({ success: true, roles: Object.keys(roles), users: created });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});