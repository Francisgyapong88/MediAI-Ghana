import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score

train = pd.read_csv("data/train_encoded.csv")
val = pd.read_csv("data/val_encoded.csv")

feature_cols = [c for c in train.columns if c != "Disease"]

X_train, y_train = train[feature_cols], train["Disease"]
X_val, y_val = val[feature_cols], val["Disease"]

model = LogisticRegression(max_iter=1000, random_state=42)
model.fit(X_train, y_train)

predictions = model.predict(X_val)

accuracy = accuracy_score(y_val, predictions)
macro_f1 = f1_score(y_val, predictions, average="macro")

print("Validation accuracy:", round(accuracy, 4))
print("Validation macro-F1:", round(macro_f1, 4))