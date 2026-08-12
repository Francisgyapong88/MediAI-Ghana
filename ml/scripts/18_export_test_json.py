import pandas as pd
import json

test = pd.read_csv("data/test_encoded.csv")
feature_cols = [c for c in test.columns if c != "Disease"]

X_test = test[feature_cols].values.tolist()

with open("tfjs_test/test_features.json", "w") as f:
    json.dump(X_test, f)

print("Exported", len(X_test), "test cases to tfjs_test/test_features.json")