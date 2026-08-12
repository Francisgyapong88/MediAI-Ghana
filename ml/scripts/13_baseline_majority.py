import pandas as pd
from sklearn.metrics import accuracy_score, f1_score

train = pd.read_csv("data/train_encoded.csv")
val = pd.read_csv("data/val_encoded.csv")

# The "model": always predict the most common class in training data
majority_class = train["Disease"].mode()[0]
print("Majority class:", majority_class)

# Apply this constant prediction to every validation row
predictions = [majority_class] * len(val)
actual = val["Disease"]

accuracy = accuracy_score(actual, predictions)
macro_f1 = f1_score(actual, predictions, average="macro")

print("Validation accuracy:", round(accuracy, 4))
print("Validation macro-F1:", round(macro_f1, 4))