// Display-only metadata. The vocabulary itself comes from the server
// (FR-04); this map only decides labels and grouping on screen.
export const DISPLAY: Record<string, { label: string; category: string }> = {
  fever: { label: 'Fever', category: 'General' },
  chills: { label: 'Chills', category: 'General' },
  headache: { label: 'Headache', category: 'General' },
  fatigue: { label: 'Fatigue', category: 'General' },
  sweating: { label: 'Sweating / Diaphoresis', category: 'General' },
  muscle_pain: { label: 'Muscle Pain / Myalgia', category: 'General' },
  nausea: { label: 'Nausea', category: 'Gastrointestinal' },
  vomiting: { label: 'Vomiting', category: 'Gastrointestinal' },
  diarrhoea: { label: 'Diarrhoea', category: 'Gastrointestinal' },
  abdominal_pain: { label: 'Abdominal Pain', category: 'Gastrointestinal' },
  cough: { label: 'Cough', category: 'Respiratory' },
  shortness_breath: { label: 'Shortness of Breath', category: 'Respiratory' },
  chest_pain: { label: 'Chest Pain', category: 'Respiratory' },
  frequent_urination: { label: 'Frequent Urination', category: 'Metabolic' },
  weight_loss: { label: 'Unexplained Weight Loss', category: 'Metabolic' },
  blurred_vision: { label: 'Blurred Vision', category: 'Metabolic' },
}

export function display(name: string) {
  return (
    DISPLAY[name] ?? {
      label: name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      category: 'Other',
    }
  )
}