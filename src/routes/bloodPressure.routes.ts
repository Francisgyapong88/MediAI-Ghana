import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { bloodPressureGate } from "../controllers/bloodPressure.controller";

export const bloodPressureRouter = Router();

// Deliberately requireAuth ONLY — no role check — because the gate must
// reject every role identically, including ADMIN. The disabled response
// comes from the controller itself, not from an authorization boundary.
bloodPressureRouter.post("/", requireAuth, bloodPressureGate);