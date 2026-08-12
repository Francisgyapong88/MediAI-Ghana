import pandas as pd

df = pd.read_csv("data/subset_4label.csv")
symptom_cols = [c for c in df.columns if c.startswith("Symptom_")]

# Build a signature per row: the SET of symptoms present (order doesn't matter),
# combined with the disease label (so a malaria case and a typhoid case with
# coincidentally similar symptoms are never merged into one group)
def make_signature(row):
    symptoms = frozenset(row[symptom_cols].dropna())
    return (row["Disease"], symptoms)

df["signature"] = df.apply(make_signature, axis=1)

# Assign each unique signature a group ID
unique_sigs = {sig: i for i, sig in enumerate(df["signature"].unique())}
df["group_id"] = df["signature"].map(unique_sigs)

print("Total rows:", len(df))
print("Total unique mapped-signature groups:", df["group_id"].nunique())
print()
print("Rows per group (top 10 largest groups):")
print(df["group_id"].value_counts().head(10))
print()
print("Groups per disease:")
print(df.groupby("Disease")["group_id"].nunique())

df.to_csv("data/subset_with_groups.csv", index=False)
print()
print("Saved to data/subset_with_groups.csv")