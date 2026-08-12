import pandas as pd

df = pd.read_csv("data/subset_4label.csv")

symptom_cols = [c for c in df.columns if c.startswith("Symptom_")]

# Gather every unique symptom value across all 17 symptom columns
all_symptoms = set()
for col in symptom_cols:
    values = df[col].dropna().unique()
    all_symptoms.update(values)

all_symptoms = sorted(all_symptoms)
print("Number of unique symptoms in the 4-disease subset:", len(all_symptoms))
print()
for s in all_symptoms:
    print(s)