import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getActiveModel, listModels } from "../controllers/model.controller";

export const modelRouter = Router();

// /versions must be declared before the bare "/" route.
modelRouter.get("/versions", requireAuth, listModels);
modelRouter.get("/", requireAuth, getActiveModel);