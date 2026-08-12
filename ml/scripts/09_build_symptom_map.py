import pandas as pd

# Master vocabulary (all 132 symptoms across the dataset)
severity = pd.read_csv("data/raw/Symptom-severity.csv")
severity["Symptom"] = severity["Symptom"].str.strip()
master_symptoms = sorted(severity["Symptom"].unique())

# Symptoms actually relevant to our 4-disease active ML scope
subset = pd.read_csv("data/subset_4label.csv")
symptom_cols = [c for c in subset.columns if c.startswith("Symptom_")]
subset_symptoms = set()
for col in symptom_cols:
    subset_symptoms.update(subset[col].dropna().unique())

disabled_map = {
    "runny_nose": "Runny Nose",
    "joint_pain": "Joint Pain",
    "loss_of_appetite": "Loss of Appetite",
    "muscle_weakness": "Body Weakness",
    "throat_irritation": "Sore Throat",
    "dehydration": "Excessive Thirst (loose proxy, caveat noted)"
}

rows = []
for s in master_symptoms:
    in_scope = s in subset_symptoms
    is_disabled = s in disabled_map
    if is_disabled:
        rows.append({"source_feature": s, "application_term": disabled_map[s],
                     "enabled": False, "in_4disease_scope": in_scope})
    elif in_scope:
        rows.append({"source_feature": s, "application_term": s.replace("_", " ").title(),
                     "enabled": True, "in_4disease_scope": True})
    # symptoms outside the 4-disease scope AND not on the disabled list are
    # simply not part of this application's SYMPTOM_MAP at all (out of scope)

symptom_map = pd.DataFrame(rows)
symptom_map.to_csv("symptom_map_v1.csv", index=False)

print("Master vocabulary (source feature columns):", len(master_symptoms))
print("Enabled application terms (in 4-disease scope):", symptom_map["enabled"].sum())
print("Disabled/removed terms:", (~symptom_map["enabled"]).sum())
print("Total SYMPTOM_MAP entries:", len(symptom_map))
print()
print(symptom_map.to_string(index=False))