import pandas as pd

df = pd.read_csv("data/subset_4label.csv")
symptom_cols = [c for c in df.columns if c.startswith("Symptom_")]

# For each disease, get the set of symptoms it ever uses
disease_symptoms = {}
for disease in sorted(df["Disease"].unique()):
    subset = df[df["Disease"] == disease]
    symptoms = set()
    for col in symptom_cols:
        symptoms.update(subset[col].dropna().unique())
    disease_symptoms[disease] = symptoms
    print(f"{disease}: {len(symptoms)} unique symptoms")
    print(f"  {sorted(symptoms)}")
    print()

# Check pairwise overlap between diseases
diseases = list(disease_symptoms.keys())
print("Pairwise symptom overlap:")
for i in range(len(diseases)):
    for j in range(i+1, len(diseases)):
        d1, d2 = diseases[i], diseases[j]
        overlap = disease_symptoms[d1] & disease_symptoms[d2]
        print(f"  {d1} vs {d2}: {len(overlap)} shared symptoms -> {sorted(overlap)}")