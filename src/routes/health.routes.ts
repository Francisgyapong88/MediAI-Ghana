import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

import { Router } from "express";
import { testRawConnection } from "../config/prisma";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// TEMPORARY DIAGNOSTIC - remove after debugging
healthRouter.get("/db-test", async (_req, res) => {
  const result = await testRawConnection();
  res.status(200).json(result);
});