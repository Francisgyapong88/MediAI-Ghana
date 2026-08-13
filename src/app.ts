import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";
import { attachSession } from "./middleware/auth";
import { requireAuth, requireRole } from "./middleware/auth";
import { assessmentRouter } from "./routes/assessment.routes";
import { predictRouter } from "./routes/predict.routes";
import { auditRouter } from "./routes/audit.routes";
import { adminRouter } from "./routes/admin.routes";
import { bloodPressureRouter } from "./routes/bloodPressure.routes";
import { symptomRouter } from "./routes/symptom.routes";
import { modelRouter } from "./routes/model.routes";
export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: "http://localhost:8443", credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan("dev"));
  app.use(attachSession);

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);

  app.get("/api/admin/ping", requireAuth, requireRole("ADMIN"), (_req, res) => {
    res.status(200).json({ message: "Admin access confirmed." });
  });

  app.use("/api/assessments", assessmentRouter);
  app.use("/api/predict", predictRouter);
  app.use("/api/audit-logs", auditRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/blood-pressure", bloodPressureRouter);
  app.use("/api/symptoms", symptomRouter);
  app.use("/api/model", modelRouter);
  return app;
}