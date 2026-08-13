import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { predict } from "../controllers/predict.controller";
import { predictRateLimit } from "../middleware/rateLimit";

export const predictRouter = Router();

predictRouter.post("/", requireAuth, predictRateLimit, predict);