import pandas as pd

# Load the raw dataset
df = pd.read_csv("data/raw/dataset.csv")

# Basic shape: how many rows, how many columns
print("Shape (rows, columns):", df.shape)
print()

# What are the column names?
print("Columns:", list(df.columns))
print()

# How many unique diseases are in here?
print("Number of unique diseases:", df["Disease"].nunique())
print()

# List every disease and how many rows it has
print("Row count per disease:")
print(df["Disease"].value_counts())