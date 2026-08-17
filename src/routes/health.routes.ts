import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// TEMPORARY SEED ENDPOINT - remove after use
healthRouter.get("/seed-quick", async (_req, res) => {
  try {
    const roleNames = ["ADMIN", "EVALUATOR", "SUPERVISOR_AUDITOR"];
    const roles: Record<string, number> = {};
    for (const name of roleNames) {
      const role = await prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      roles[name] = role.id;
    }

    const users = [
      { username: "admin", password: "ChangeMe123!", role: "ADMIN" },
      { username: "evaluator", password: "ChangeMe123!", role: "EVALUATOR" },
    ];
    const createdUsers = [];
    for (const u of users) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      const user = await prisma.user.upsert({
        where: { username: u.username },
        update: { passwordHash, roleId: roles[u.role] },
        create: { username: u.username, passwordHash, roleId: roles[u.role] },
      });
      createdUsers.push(user.username);
    }

    // Active AI model version
    const model = await prisma.aiModel.upsert({
      where: { version: "v1" },
      update: { isActive: true },
      create: {
        version: "v1",
        description: "MediAI Four-Class Classifier (Sequential: Input(29) -> Dense(16, ReLU) -> Dense(4, softmax))",
        isActive: true,
      },
    });

    // Active symptom map version
    const map = await prisma.symptomMap.upsert({
      where: { version: "v1" },
      update: { isActive: true },
      create: {
        version: "v1",
        description: "SYMPTOM_MAP v1 - 132 master vocabulary, 29 enabled for 4-disease scope, 6 disabled",
        isActive: true,
      },
    });

    // The 35 symptoms in the active application vocabulary (29 enabled + 6 disabled)
    const symptoms: { name: string; isEnabled: boolean }[] = [
      { name: "Abdominal Pain", isEnabled: true },
      { name: "Belly Pain", isEnabled: true },
      { name: "Blurred And Distorted Vision", isEnabled: true },
      { name: "Breathlessness", isEnabled: true },
      { name: "Chest Pain", isEnabled: true },
      { name: "Chills", isEnabled: true },
      { name: "Constipation", isEnabled: true },
      { name: "Cough", isEnabled: true },
      { name: "Diarrhoea", isEnabled: true },
      { name: "Excessive Hunger", isEnabled: true },
      { name: "Fast Heart Rate", isEnabled: true },
      { name: "Fatigue", isEnabled: true },
      { name: "Headache", isEnabled: true },
      { name: "High Fever", isEnabled: true },
      { name: "Increased Appetite", isEnabled: true },
      { name: "Irregular Sugar Level", isEnabled: true },
      { name: "Lethargy", isEnabled: true },
      { name: "Malaise", isEnabled: true },
      { name: "Muscle Pain", isEnabled: true },
      { name: "Nausea", isEnabled: true },
      { name: "Obesity", isEnabled: true },
      { name: "Phlegm", isEnabled: true },
      { name: "Polyuria", isEnabled: true },
      { name: "Restlessness", isEnabled: true },
      { name: "Rusty Sputum", isEnabled: true },
      { name: "Sweating", isEnabled: true },
      { name: "Toxic Look (Typhos)", isEnabled: true },
      { name: "Vomiting", isEnabled: true },
      { name: "Weight Loss", isEnabled: true },
      { name: "Runny Nose", isEnabled: false },
      { name: "Joint Pain", isEnabled: false },
      { name: "Loss of Appetite", isEnabled: false },
      { name: "Body Weakness", isEnabled: false },
      { name: "Sore Throat", isEnabled: false },
      { name: "Excessive Thirst", isEnabled: false },
    ];

    let symptomCount = 0;
    for (const s of symptoms) {
      await prisma.symptom.upsert({
        where: { name: s.name },
        update: { isEnabled: s.isEnabled },
        create: { name: s.name, isEnabled: s.isEnabled },
      });
      symptomCount++;
    }

    res.status(200).json({
      success: true,
      roles: Object.keys(roles),
      users: createdUsers,
      model: model.version,
      symptomMap: map.version,
      symptomsSeeded: symptomCount,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});