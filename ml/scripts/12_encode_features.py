import pandas as pd

# The 29 enabled symptoms (from our SYMPTOM_MAP, in-scope for the 4 diseases)
symptom_map = pd.read_csv("symptom_map_v1.csv")
enabled_symptoms = sorted(symptom_map[symptom_map["enabled"] == True]["source_feature"].tolist())
print("Number of enabled symptom features:", len(enabled_symptoms))

def encode(filepath, outpath):
    df = pd.read_csv(filepath)
    symptom_cols = [c for c in df.columns if c.startswith("Symptom_")]

    # Build a 0/1 column for each enabled symptom
    encoded = pd.DataFrame(0, index=df.index, columns=enabled_symptoms)
    for col in symptom_cols:
        for symptom in enabled_symptoms:
            mask = df[col] == symptom
            encoded.loc[mask, symptom] = 1

    encoded.insert(0, "Disease", df["Disease"])
    encoded.to_csv(outpath, index=False)
    print(f"Saved {outpath} -> shape {encoded.shape}")
    return encoded

train_enc = encode("data/train.csv", "data/train_encoded.csv")
val_enc = encode("data/val.csv", "data/val_encoded.csv")
test_enc = encode("data/test.csv", "data/test_encoded.csv")

print()
print("Sample of encoded training data:")
print(train_enc.head(3))