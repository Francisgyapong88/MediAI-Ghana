import { prisma } from "./config/prisma";

const MODEL_HASH = "466256a95657ce1ec93cdcffc0993503cb53b4118981d204312a8b89e032b39c";
const SYMPTOM_MAP_HASH = "99ee022b7650a7fc81b4f9ffbb1911c675d39de8c115754c1dbcd841fb1881b1";

async function main() {
  const model = await prisma.aiModel.upsert({
    where: { version: "v1.0.0" },
    update: { isActive: true, hash: MODEL_HASH },
    create: {
      version: "v1.0.0",
      description:
        "4-class TensorFlow.js classifier (29 input features -> 16 hidden units -> 4-class softmax output: Diabetes mellitus, Malaria, Pneumonia, Typhoid fever). Conformance-tested against the Python-trained model: 96/96 test cases matched (max probability difference ~1e-7).",
      isActive: true,
      hash: MODEL_HASH,
    },
  });

  const symptomMap = await prisma.symptomMap.upsert({
    where: { version: "v1.0.0" },
    update: { isActive: true, hash: SYMPTOM_MAP_HASH },
    create: {
      version: "v1.0.0",
      description:
        "35 master symptoms (29 enabled, in-scope for the classifier; 6 disabled) sourced from symptom_map_v1.csv, frozen alongside AiModel v1.0.0.",
      isActive: true,
      hash: SYMPTOM_MAP_HASH,
    },
  });

  await prisma.aiModel.updateMany({
    where: { version: { not: "v1.0.0" } },
    data: { isActive: false },
  });
  await prisma.symptomMap.updateMany({
    where: { version: { not: "v1.0.0" } },
    data: { isActive: false },
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
