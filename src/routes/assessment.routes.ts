import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { createAssessment, listAssessments, getAssessment } from "../controllers/assessment.controller";

export const assessmentRouter = Router();

assessmentRouter.use(requireAuth);

// Creation is a mutation — the read-only role is refused server-side (FR-10).
assessmentRouter.post("/", requireRole("EVALUATOR", "ADMIN"), createAssessment);
assessmentRouter.get("/", listAssessments);
assessmentRouter.get("/:id", getAssessment);