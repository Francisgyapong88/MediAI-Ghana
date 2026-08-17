import { Router } from "express";
import { prisma } from "../config/prisma";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// TEMPORARY FIX ENDPOINT - remove after use
healthRouter.get("/fix-symptom-names", async (_req, res) => {
  try {
    const renames: Record<string, string> = {
      "Abdominal Pain": "abdominal_pain",
      "Belly Pain": "belly_pain",
      "Blurred And Distorted Vision": "blurred_and_distorted_vision",
      "Breathlessness": "breathlessness",
      "Chest Pain": "chest_pain",
      "Chills": "chills",
      "Constipation": "constipation",
      "Cough": "cough",
      "Diarrhoea": "diarrhoea",
      "Excessive Hunger": "excessive_hunger",
      "Fast Heart Rate": "fast_heart_rate",
      "Fatigue": "fatigue",
      "Headache": "headache",
      "High Fever": "high_fever",
      "Increased Appetite": "increased_appetite",
      "Irregular Sugar Level": "irregular_sugar_level",
      "Lethargy": "lethargy",
      "Malaise": "malaise",
      "Muscle Pain": "muscle_pain",
      "Nausea": "nausea",
      "Obesity": "obesity",
      "Phlegm": "phlegm",
      "Polyuria": "polyuria",
      "Restlessness": "restlessness",
      "Rusty Sputum": "rusty_sputum",
      "Sweating": "sweating",
      "Toxic Look (Typhos)": "toxic_look_(typhos)",
      "Vomiting": "vomiting",
      "Weight Loss": "weight_loss",
      "Runny Nose": "runny_nose",
      "Joint Pain": "joint_pain",
      "Loss of Appetite": "loss_of_appetite",
      "Body Weakness": "muscle_weakness",
      "Sore Throat": "throat_irritation",
      "Excessive Thirst": "dehydration",
    };
    const updated = [];
    for (const [oldName, newName] of Object.entries(renames)) {
      const symptom = await prisma.symptom.findUnique({ where: { name: oldName } });
      if (symptom) {
        await prisma.symptom.update({ where: { id: symptom.id }, data: { name: newName } });
        updated.push(`${oldName} -> ${newName}`);
      }
    }
    res.status(200).json({ success: true, updatedCount: updated.length, updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});