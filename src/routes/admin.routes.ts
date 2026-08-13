import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { listUsers, createUser, updateUserStatus, updateUserRole } from "../controllers/admin.controller";

export const adminRouter = Router();

// Every route here is admin-only — enforced server-side per FR-08.
adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.get("/users", listUsers);
adminRouter.post("/users", createUser);
adminRouter.patch("/users/:id/status", updateUserStatus);
adminRouter.patch("/users/:id/role", updateUserRole);