import numpy as np
import json

# Load Python predictions
python_preds = np.load("conformance_python_predictions.npy")

# Load TF.js predictions
with open("tfjs_test/tfjs_predictions.json") as f:
    tfjs_preds = np.array(json.load(f))

print("Python predictions shape:", python_preds.shape)
print("TF.js predictions shape:", tfjs_preds.shape)

# Check the maximum absolute difference across all values
max_diff = np.max(np.abs(python_preds - tfjs_preds))
print("Maximum absolute difference across all predictions:", max_diff)

# Define a tolerance and check how many predictions match within it
tolerance = 1e-4
close_enough = np.all(np.abs(python_preds - tfjs_preds) < tolerance, axis=1)
num_matching = np.sum(close_enough)
num_mismatched = len(close_enough) - num_matching

print(f"Tolerance used: {tolerance}")
print(f"Matching cases (within tolerance): {num_matching} / {len(close_enough)}")
print(f"Mismatched cases: {num_mismatched}")

# Also check: do both models agree on the PREDICTED CLASS (not just probabilities)?
python_classes = np.argmax(python_preds, axis=1)
tfjs_classes = np.argmax(tfjs_preds, axis=1)
class_matches = np.sum(python_classes == tfjs_classes)
print(f"Predicted-class agreement: {class_matches} / {len(python_classes)}")