import pandas as pd

df = pd.read_csv("data/raw/dataset.csv")

# Find every unique Disease value that contains "iabet" (case-insensitive),
# and show it with repr() so hidden spaces become visible
matches = df["Disease"].unique()
for val in matches:
    if "iabet" in val.lower():
        print(repr(val))