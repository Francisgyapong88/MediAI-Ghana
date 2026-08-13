import { prisma } from "./config/prisma";

// The full application vocabulary, sourced directly from
// ml/symptom_map_v1.csv (35 master symptoms: 29 enabled, in-scope for the
// 4-disease classifier; 6 permanently disabled — no valid model evidence,
// Chapter Three §3.6). Row order matches the CSV; do not hand-edit this
// list — regenerate it from the CSV if the map ever changes, so the
// database vocabulary can never drift out of sync with what the model
// was actually trained on.
const SYMPTOMS: { name: string; isEnabled: boolean }[] = [
  { name: "abdominal_pain", isEnabled: true },
  { name: "belly_pain", isEnabled: true },
  { name: "blurred_and_distorted_vision", isEnabled: true },
  { name: "breathlessness", isEnabled: true },
  { name: "chest_pain", isEnabled: true },
  { name: "chills", isEnabled: true },
  { name: "constipation", isEnabled: true },
  { name: "cough", isEnabled: true },
  { name: "dehydration", isEnabled: false },
  { name: "diarrhoea", isEnabled: true },
  { name: "excessive_hunger", isEnabled: true },
  { name: "fast_heart_rate", isEnabled: true },
  { name: "fatigue", isEnabled: true },
  { name: "headache", isEnabled: true },
  { name: "high_fever", isEnabled: true },
  { name: "increased_appetite", isEnabled: true },
  { name: "irregular_sugar_level", isEnabled: true },
  { name: "joint_pain", isEnabled: false },
  { name: "lethargy", isEnabled: true },
  { name: "loss_of_appetite", isEnabled: false },
  { name: "malaise", isEnabled: true },
  { name: "muscle_pain", isEnabled: true },
  { name: "muscle_weakness", isEnabled: false },
  { name: "nausea", isEnabled: true },
  { name: "obesity", isEnabled: true },
  { name: "phlegm", isEnabled: true },
  { name: "polyuria", isEnabled: true },
  { name: "restlessness", isEnabled: true },
  { name: "runny_nose", isEnabled: false },
  { name: "rusty_sputum", isEnabled: true },
  { name: "sweating", isEnabled: true },
  { name: "throat_irritation", isEnabled: false },
  { name: "toxic_look_(typhos)", isEnabled: true },
  { name: "vomiting", isEnabled: true },
  { name: "weight_loss", isEnabled: true },
];

async function main() {
  for (const { name, isEnabled } of SYMPTOMS) {
    await prisma.symptom.upsert({
      where: { name },
      update: { isEnabled },
      create: { name, isEnabled },
    });
  }
  const enabledCount = SYMPTOMS.filter((s) => s.isEnabled).length;
  console.log(`Seeded ${SYMPTOMS.length} symptoms (${enabledCount} enabled, ${SYMPTOMS.length - enabledCount} disabled).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });