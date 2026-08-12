import pandas as pd

df = pd.read_csv("data/subset_4label.csv")

# Missing values: how many cells are empty (NaN) across the whole table?
missing_count = df.isnull().sum().sum()
print("Total missing-value cells:", missing_count)
print()
print("Missing values per column:")
print(df.isnull().sum())
print()

# Exact duplicate rows: rows that are 100% identical across every column
exact_dupes = df.duplicated().sum()
print("Exact duplicate rows:", exact_dupes)