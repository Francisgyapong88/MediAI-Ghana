import pandas as pd

df = pd.read_csv("data/raw/dataset.csv")
for col in df.select_dtypes(include="str").columns:
    df[col] = df[col].str.strip()

symptom_cols = [c for c in df.columns if c.startswith("Symptom_")]
all_symptoms = set()
for col in symptom_cols:
    all_symptoms.update(df[col].dropna().unique())

all_symptoms = sorted(all_symptoms)

# Search terms based on the 6 disabled symptoms named in Chapters One/Three
search_terms = ["weak", "thirst", "nose", "nasal", "joint", "throat", "appetite"]

print("Candidate matches for the 6 disabled symptoms:")
for term in search_terms:
    matches = [s for s in all_symptoms if term in s.lower()]
    print(f"  '{term}':", matches)