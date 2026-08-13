import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { writeAuditLog } from "../utils/audit";

/**
 * Plausibility bounds for optional vital signs (FR-03 boundary cases).
 * PLACEHOLDER RANGES — these are measurement-plausibility limits, not
 * clinical reference ranges, and must be confirmed against the approved
 * project record before Chapter Four reports any boundary-case evidence.
 */
const VITAL_RANGES = {
  temperatureC: { min: 30, max: 45, label: "Temperature (°C)" },
  heartRate: { min: 20, max: 250, label: "Heart rate (bpm)" },
  respiratoryRate: { min: 5, max: 80, label: "Respiratory rate (breaths/min)" },
} as const;

function validateVital(
  value: unknown,
  key: keyof typeof VITAL_RANGES,
): { ok: true; value: number | null } | { ok: false; message: string } {
  if (value === undefined || value === null || value === "") return { ok: true, value: null };
  if (typeof value !== "number" || Number.isNaN(value)) {
    return { ok: false, message: `${VITAL_RANGES[key].label} must be a number.` };
  }
  const { min, max, label } = VITAL_RANGES[key];
  if (value < min || value > max) {
    return { ok: false, message: `${label} must be between ${min} and ${max}.` };
  }
  return { ok: true, value };
}

export async function createAssessment(req: Request, res: Response): Promise<void> {
  const { age, sex, symptoms, temperatureC, heartRate, respiratoryRate } = req.body ?? {};

  if (typeof age !== "number" || age <= 0) {
    res.status(400).json({ error: "ValidationError", message: "A valid age is required." });
    return;
  }
  if (!sex || !["MALE", "FEMALE", "OTHER"].includes(sex)) {
    res.status(400).json({ error: "ValidationError", message: "Sex must be MALE, FEMALE, or OTHER." });
    return;
  }
  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    res.status(400).json({ error: "ValidationError", message: "At least one symptom is required." });
    return;
  }

  // Only allow symptoms that exist AND are enabled — unsupported terms are
  // rejected outright rather than silently accepted (Chapter Three §3.6).
  const symptomRows = await prisma.symptom.findMany({
    where: { name: { in: symptoms }, isEnabled: true },
  });
  const foundNames = new Set(symptomRows.map((s) => s.name));
  const unsupported = symptoms.filter((s: string) => !foundNames.has(s));
  if (unsupported.length > 0) {
    res.status(400).json({
      error: "UnsupportedSymptom",
      message: `The following symptoms are not supported: ${unsupported.join(", ")}`,
    });
    return;
  }

  // Vital signs are optional, but if supplied they must be plausible.
  const temp = validateVital(temperatureC, "temperatureC");
  const hr = validateVital(heartRate, "heartRate");
  const rr = validateVital(respiratoryRate, "respiratoryRate");

  for (const v of [temp, hr, rr]) {
    if (!v.ok) {
      res.status(400).json({ error: "ValidationError", message: v.message });
      return;
    }
  }

  const userId = req.user!.id;

  const patient = await prisma.patient.create({
    data: { age, sex, isSynthetic: true, createdBy: userId },
  });

  const visit = await prisma.patientVisit.create({
    data: { patientId: patient.id },
  });

  const assessment = await prisma.assessment.create({
    data: {
      visitId: visit.id,
      createdBy: userId,
      temperatureC: temp.ok ? temp.value : null,
      heartRate: hr.ok ? hr.value : null,
      respiratoryRate: rr.ok ? rr.value : null,
    },
  });

  await prisma.assessmentSymptom.createMany({
    data: symptomRows.map((s) => ({ assessmentId: assessment.id, symptomId: s.id })),
  });

  void writeAuditLog({
    userId,
    action: "ASSESSMENT_CREATED",
    resource: "assessment",
    resourceId: String(assessment.id),
    outcome: "SUCCESS",
  });

  const full = await prisma.assessment.findUnique({
    where: { id: assessment.id },
    include: {
      visit: { include: { patient: true } },
      assessmentSymptoms: { include: { symptom: true } },
    },
  });

  res.status(201).json(full);
}

export async function listAssessments(req: Request, res: Response): Promise<void> {
  const assessments = await prisma.assessment.findMany({
    where: { createdBy: req.user!.id },
    orderBy: { createdAt: "desc" },
    include: {
      visit: { include: { patient: true } },
      assessmentSymptoms: { include: { symptom: true } },
      // model and map are included so every displayed output carries its
      // versioning provenance (FR-06).
      predictionSessions: {
        include: { model: true, map: true, results: { include: { disease: true } } },
      },
    },
  });
  res.status(200).json(assessments);
}

export async function getAssessment(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "ValidationError", message: "Invalid assessment id." });
    return;
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      visit: { include: { patient: true } },
      assessmentSymptoms: { include: { symptom: true } },
      predictionSessions: {
        include: { model: true, map: true, results: { include: { disease: true } } },
      },
    },
  });

  if (!assessment || assessment.createdBy !== req.user!.id) {
    res.status(404).json({ error: "NotFound", message: "Assessment not found." });
    return;
  }

  res.status(200).json(assessment);
}