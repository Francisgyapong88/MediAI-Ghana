import { prisma } from "./config/prisma";

// The four in-scope labels only — Chapter Three §3.3.3.
const DISEASES = ["malaria", "typhoid_fever", "pneumonia", "diabetes_mellitus"];

async function main() {
  for (const name of DISEASES) {
    await prisma.disease.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`Seeded ${DISEASES.length} diseases.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });