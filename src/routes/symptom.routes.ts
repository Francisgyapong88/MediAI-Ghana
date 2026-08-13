import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { listSymptoms } from "../controllers/symptom.controller";

export const symptomRouter = Router();

symptomRouter.get("/", requireAuth, listSymptoms);