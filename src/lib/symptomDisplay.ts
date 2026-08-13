// Display-only metadata. The vocabulary itself comes from the server
// (FR-04); this map only decides labels and grouping on screen.
// Labels sourced directly from ml/symptom_map_v1.csv (application_term
// column) to stay in sync with the real, frozen symptom vocabulary the
// classifier was trained on. Includes all 35 master symptoms (29 enabled,
// 6 disabled) so any symptom the server returns has a correct label.
export const DISPLAY: Record<string, { label: string; category: string }> = {
  abdominal_pain: { label: 'Abdominal Pain', category: 'Gastrointestinal' },
  belly_pain: { label: 'Belly Pain', category: 'Gastrointestinal' },
  blurred_and_distorted_vision: { label: 'Blurred and Distorted Vision', category: 'Neurological' },
  breathlessness: { label: 'Breathlessness', category: 'Respiratory' },
  chest_pain: { label: 'Chest Pain', category: 'Respiratory' },
  chills: { label: 'Chills', category: 'General' },
  constipation: { label: 'Constipation', category: 'Gastrointestinal' },
  cough: { label: 'Cough', category: 'Respiratory' },
  dehydration: { label: 'Excessive Thirst', category: 'General' },
  diarrhoea: { label: 'Diarrhoea', category: 'Gastrointestinal' },
  excessive_hunger: { label: 'Excessive Hunger', category: 'Metabolic' },
  fast_heart_rate: { label: 'Fast Heart Rate', category: 'Cardiovascular' },
  fatigue: { label: 'Fatigue', category: 'General' },
  headache: { label: 'Headache', category: 'Neurological' },
  high_fever: { label: 'High Fever', category: 'General' },
  increased_appetite: { label: 'Increased Appetite', category: 'Metabolic' },
  irregular_sugar_level: { label: 'Irregular Sugar Level', category: 'Metabolic' },
  joint_pain: { label: 'Joint Pain', category: 'Musculoskeletal' },
  lethargy: { label: 'Lethargy', category: 'General' },
  loss_of_appetite: { label: 'Loss of Appetite', category: 'Metabolic' },
  malaise: { label: 'Malaise', category: 'General' },
  muscle_pain: { label: 'Muscle Pain', category: 'Musculoskeletal' },
  muscle_weakness: { label: 'Body Weakness', category: 'Musculoskeletal' },
  nausea: { label: 'Nausea', category: 'Gastrointestinal' },
  obesity: { label: 'Obesity', category: 'Metabolic' },
  phlegm: { label: 'Phlegm', category: 'Respiratory' },
  polyuria: { label: 'Polyuria', category: 'Metabolic' },
  restlessness: { label: 'Restlessness', category: 'Neurological' },
  runny_nose: { label: 'Runny Nose', category: 'Respiratory' },
  rusty_sputum: { label: 'Rusty Sputum', category: 'Respiratory' },
  sweating: { label: 'Sweating', category: 'General' },
  throat_irritation: { label: 'Sore Throat', category: 'Respiratory' },
  'toxic_look_(typhos)': { label: 'Toxic Look (Typhos)', category: 'General' },
  vomiting: { label: 'Vomiting', category: 'Gastrointestinal' },
  weight_loss: { label: 'Weight Loss', category: 'Metabolic' },
}

export function display(name: string) {
  return (
    DISPLAY[name] ?? {
      label: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      category: 'Other',
    }
  )
}