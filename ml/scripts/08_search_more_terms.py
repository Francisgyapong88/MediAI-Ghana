import pandas as pd

df = pd.read_csv("data/raw/dataset.csv")
for col in df.select_dtypes(include="str").columns:
    df[col] = df[col].str.strip()

symptom_cols = [c for c in df.columns if c.startswith("Symptom_")]
all_symptoms = set()
for col in symptom_cols:
    all_symptoms.update(df[col].dropna().unique())

all_symptoms = sorted(all_symptoms)

# Broader search: body, sore, drink, dry, dehydrat
search_terms = ["body", "sore", "drink", "dry", "dehydrat", "excess"]

for term in search_terms:
    matches = [s for s in all_symptoms if term in s.lower()]
    print(f"'{term}':", matches)

print()
print("Full list of all 131 symptoms for manual review:")
for s in all_symptoms:
    print(s)