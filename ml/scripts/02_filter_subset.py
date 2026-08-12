import pandas as pd

# Load the raw dataset
df = pd.read_csv("data/raw/dataset.csv")

# Strip leading/trailing whitespace from every text (object) column.
# The raw file has hidden spaces (e.g. "Diabetes " and " skin_rash") which
# would otherwise cause silent filtering/mapping errors.
for col in df.select_dtypes(include="object").columns:
    df[col] = df[col].str.strip()

# Map the raw dataset labels to your project's full clinical names
label_map = {
    "Malaria": "Malaria",
    "Typhoid": "Typhoid fever",
    "Pneumonia": "Pneumonia",
    "Diabetes": "Diabetes mellitus"
}

# Keep only rows whose Disease is one of our 4 target diseases
subset = df[df["Disease"].isin(label_map.keys())].copy()

# Rename to the full clinical names used in the project
subset["Disease"] = subset["Disease"].map(label_map)

# Report what we got
print("Subset shape (rows, columns):", subset.shape)
print()
print("Row count per disease in the subset:")
print(subset["Disease"].value_counts())

# Save the filtered subset for the next step
subset.to_csv("data/subset_4label.csv", index=False)
print()
print("Saved to data/subset_4label.csv")