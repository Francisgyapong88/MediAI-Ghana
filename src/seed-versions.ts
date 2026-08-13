import { prisma } from "./config/prisma";

async function main() {
  const model = await prisma.aiModel.upsert({
    where: { version: "v0.1.0-mock" },
    update: { isActive: true },
    create: {
      version: "v0.1.0-mock",
      description: "Placeholder mock model — not a real trained classifier. Replace on Day 5.",
      isActive: true,
    },
  });

  const symptomMap = await prisma.symptomMap.upsert({
    where: { version: "v0.1.0-mock" },
    update: { isActive: true },
    create: {
      version: "v0.1.0-mock",
      description: "Placeholder symptom map — not yet the real frozen mapping from Member 1.",
      isActive: true,
    },
  });

  console.log("Seeded AI model:", model);
  console.log("Seeded symptom map:", symptomMap);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });