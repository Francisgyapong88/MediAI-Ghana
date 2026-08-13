import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/password";
import { writeAuditLog } from "../utils/audit";

const VALID_ROLE_NAMES = ["ADMIN", "EVALUATOR", "SUPERVISOR_AUDITOR"];
const VALID_STATUSES = ["ACTIVE", "INACTIVE", "LOCKED"];

export async function listUsers(_req: Request, res: Response): Promise<void> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      role: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(users);
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const { username, password, role } = req.body ?? {};

  if (!username || typeof username !== "string") {
    res.status(400).json({ error: "ValidationError", message: "Username is required." });
    return;
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "ValidationError", message: "Password must be at least 8 characters." });
    return;
  }
  if (!role || !VALID_ROLE_NAMES.includes(role)) {
    res.status(400).json({ error: "ValidationError", message: `Role must be one of: ${VALID_ROLE_NAMES.join(", ")}` });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    res.status(409).json({ error: "Conflict", message: "That username is already taken." });
    return;
  }

  const roleRow = await prisma.role.findUniqueOrThrow({ where: { name: role } });
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, passwordHash, roleId: roleRow.id, status: "ACTIVE" },
    select: {
      id: true,
      username: true,
      status: true,
      createdAt: true,
      role: { select: { name: true } },
    },
  });

  void writeAuditLog({
    userId: req.user!.id,
    action: "USER_CREATED",
    resource: "user",
    resourceId: String(user.id),
    outcome: "SUCCESS",
  });

  res.status(201).json(user);
}

export async function updateUserStatus(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { status } = req.body ?? {};

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ValidationError", message: "Invalid user id." });
    return;
  }
  if (!status || !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: "ValidationError", message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "NotFound", message: "User not found." });
    return;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      username: true,
      status: true,
      role: { select: { name: true } },
    },
  });

  void writeAuditLog({
    userId: req.user!.id,
    action: "USER_STATUS_CHANGED",
    resource: "user",
    resourceId: String(id),
    outcome: "SUCCESS",
  });

  res.status(200).json(updated);
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { role } = req.body ?? {};

  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ValidationError", message: "Invalid user id." });
    return;
  }
  if (!role || !VALID_ROLE_NAMES.includes(role)) {
    res.status(400).json({ error: "ValidationError", message: `Role must be one of: ${VALID_ROLE_NAMES.join(", ")}` });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "NotFound", message: "User not found." });
    return;
  }

  const roleRow = await prisma.role.findUniqueOrThrow({ where: { name: role } });
  const updated = await prisma.user.update({
    where: { id },
    data: { roleId: roleRow.id },
    select: {
      id: true,
      username: true,
      status: true,
      role: { select: { name: true } },
    },
  });

  void writeAuditLog({
    userId: req.user!.id,
    action: "USER_ROLE_CHANGED",
    resource: "user",
    resourceId: String(id),
    outcome: "SUCCESS",
  });

  res.status(200).json(updated);
}