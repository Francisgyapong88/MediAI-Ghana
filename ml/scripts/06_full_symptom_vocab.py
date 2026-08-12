import pandas as pd

# Load the FULL raw dataset (all 41 diseases, not the 4-label subset)
df = pd.read_csv("data/raw/dataset.csv")

# Strip whitespace the same way we did before
for col in df.select_dtypes(include="str").columns:
    df[col] = df[col].str.strip()

symptom_cols = [c for c in df.columns if c.startswith("Symptom_")]

all_symptoms = set()
for col in symptom_cols:
    values = df[col].dropna().unique()
    all_symptoms.update(values)

all_symptoms = sorted(all_symptoms)
print("Total unique symptoms across ALL 41 diseases:", len(all_symptoms))