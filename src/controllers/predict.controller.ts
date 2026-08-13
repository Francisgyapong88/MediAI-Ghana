import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { writeAuditLog } from "../utils/audit";

/**
 * Abstention rule (Chapter Three §3.7, FR-05).
 *
 * MIN_SYMPTOMS gates pre-inference: sparse input is refused without invoking
 * the classifier, per the §3.11.1 alternate flow.
 *
 * ABSTENTION_THRESHOLD gates post-inference. THIS VALUE IS A PLACEHOLDER and
 * must be replaced with the threshold selected from training/validation
 * evidence only — never from test outcomes. Record the chosen value, the
 * validation run it came from, and the date in the project record before
 * reporting any result in Chapter Four.
 */
const MIN_SYMPTOMS = 2;
const ABSTENTION_THRESHOLD = 0.5;

export async function predict(req: Request, res: Response): Promise<void> {
  const { assessmentId } = req.body ?? {};

  if (typeof assessmentId !== "number") {
    res.status(400).json({ error: "ValidationError", message: "assessmentId is required." });
    return;
  }

  void writeAuditLog({
    userId: req.user!.id,
    action: "PREDICTION_REQUEST",
    resource: "assessment",
    resourceId: String(assessmentId),
    outcome: "SUCCESS",
  });

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { assessmentSymptoms: true },
  });

  if (!assessment || assessment.createdBy !== req.user!.id) {
    res.status(404).json({ error: "NotFound", message: "Assessment not found." });
    return;
  }

  const [activeModel, activeMap, malaria] = await Promise.all([
    prisma.aiModel.findFirst({ where: { isActive: true } }),
    prisma.symptomMap.findFirst({ where: { isActive: true } }),
    prisma.disease.findUnique({ where: { name: "malaria" } }),
  ]);

  if (!activeModel || !activeMap || !malaria) {
    // Fail closed — never fabricate a result if versioning/reference data isn't set up.
    res.status(503).json({
      error: "ServiceUnavailable",
      message: "No active model, symptom-map version, or reference disease data is configured.",
    });
    return;
  }

  // ---- Pre-inference gate: sparse input is refused without running the model.
  if (assessment.assessmentSymptoms.length < MIN_SYMPTOMS) {
    const session = await prisma.predictionSession.create({
      data: {
        assessmentId,
        modelId: activeModel.id,
        mapId: activeMap.id,
        status: "INSUFFICIENT_INFORMATION",
      },
    });

    void writeAuditLog({
      userId: req.user!.id,
      action: "PREDICTION_ABSTAINED",
      resource: "assessment",
      resourceId: String(assessmentId),
      outcome: "SUCCESS",
    });

    res.status(200).json({
      status: session.status,
      modelVersion: activeModel.version,
      symptomMapVersion: activeMap.version,
      reason: `Fewer than ${MIN_SYMPTOMS} supported symptoms were supplied. The classifier was not invoked.`,
      results: [],
    });
    return;
  }

  // ---- Inference. STILL A MOCK: the score below is hardcoded, not predicted.
  const topScore = 0.87;
  const topDiseaseId = malaria.id;

  // ---- Post-inference gate: a weak result abstains rather than forcing a label.
  if (topScore < ABSTENTION_THRESHOLD) {
    const session = await prisma.predictionSession.create({
      data: {
        assessmentId,
        modelId: activeModel.id,
        mapId: activeMap.id,
        status: "INSUFFICIENT_INFORMATION",
      },
    });

    void writeAuditLog({
      userId: req.user!.id,
      action: "PREDICTION_ABSTAINED",
      resource: "assessment",
      resourceId: String(assessmentId),
      outcome: "SUCCESS",
    });

    res.status(200).json({
      status: session.status,
      modelVersion: activeModel.version,
      symptomMapVersion: activeMap.version,
      reason: "The model output did not reach the documented abstention threshold. No label is reported.",
      results: [],
    });
    return;
  }

  const session = await prisma.predictionSession.create({
    data: {
      assessmentId,
      modelId: activeModel.id,
      mapId: activeMap.id,
      status: "COMPLETED",
    },
  });

  const result = await prisma.predictionResult.create({
    data: { sessionId: session.id, diseaseId: topDiseaseId, score: topScore, rank: 1 },
    include: { disease: true },
  });

  void writeAuditLog({
    userId: req.user!.id,
    action: "PREDICTION_COMPLETED",
    resource: "assessment",
    resourceId: String(assessmentId),
    outcome: "SUCCESS",
  });

  res.status(200).json({
    status: session.status,
    modelVersion: activeModel.version,
    symptomMapVersion: activeMap.version,
    results: [{ label: result.disease.name, score: result.score, rank: result.rank }],
  });
}