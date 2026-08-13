/**
 * Frozen feature contract for SYMPTOM_MAP v1 (ml/symptom_map_v1.csv,
 * model_tfjs/model.json). This is the exact order the 29-length input
 * vector must be built in — it is what the classifier was trained on.
 *
 * This list is INTENTIONALLY a hardcoded, versioned constant rather than
 * a live query against the symptoms table. The vector order is a
 * contract with the frozen model artifact, not a live database view —
 * if the enabled-symptom set in the database ever changes, that must
 * produce a NEW symptom-map version and a re-trained/re-verified model,
 * not a silent reordering of this array.
 *
 * Sourced from symptom_map_v1.csv: the 29 rows with enabled=True,
 * sorted alphabetically by source_feature (matching how the training
 * pipeline built its columns).
 */
export const SYMPTOM_MAP_V1_FEATURE_ORDER: readonly string[] = [
  "abdominal_pain",
  "belly_pain",
  "blurred_and_distorted_vision",
  "breathlessness",
  "chest_pain",
  "chills",
  "constipation",
  "cough",
  "diarrhoea",
  "excessive_hunger",
  "fast_heart_rate",
  "fatigue",
  "headache",
  "high_fever",
  "increased_appetite",
  "irregular_sugar_level",
  "lethargy",
  "malaise",
  "muscle_pain",
  "nausea",
  "obesity",
  "phlegm",
  "polyuria",
  "restlessness",
  "rusty_sputum",
  "sweating",
  "toxic_look_(typhos)",
  "vomiting",
  "weight_loss",
];

/**
 * Builds the model's 29-length binary input vector from a set of
 * selected symptom names. Any name not in SYMPTOM_MAP_V1_FEATURE_ORDER
 * (e.g. a disabled symptom slipping through) is silently ignored here —
 * callers must reject disabled/unknown symptoms BEFORE calling this, at
 * the validation layer, so a bad name never reaches the model instead of
 * producing a wrong-but-plausible-looking prediction.
 */
export function encodeSymptomVector(selectedSymptomNames: readonly string[]): number[] {
  const selected = new Set(selectedSymptomNames);
  return SYMPTOM_MAP_V1_FEATURE_ORDER.map((feature) => (selected.has(feature) ? 1 : 0));
}