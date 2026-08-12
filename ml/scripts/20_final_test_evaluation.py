import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.metrics import confusion_matrix, precision_recall_fscore_support
from sklearn.preprocessing import LabelEncoder
import math

ABSTENTION_THRESHOLD = 0.5

model = tf.keras.models.load_model("model_v1.keras")

test = pd.read_csv("data/test_encoded.csv")
feature_cols = [c for c in test.columns if c != "Disease"]
X_test = test[feature_cols].values.astype("float32")

label_encoder = LabelEncoder()
label_encoder.fit(test["Disease"])
y_true = label_encoder.transform(test["Disease"])
class_names = list(label_encoder.classes_)

probs = model.predict(X_test)
top_prob = np.max(probs, axis=1)
y_pred = np.argmax(probs, axis=1)

# Apply abstention rule
abstained_mask = top_prob < ABSTENTION_THRESHOLD
accepted_mask = ~abstained_mask

print("=" * 60)
print("ABSTENTION SUMMARY")
print("=" * 60)
print(f"Threshold used: top predicted probability < {ABSTENTION_THRESHOLD}")
print(f"Cases abstained: {abstained_mask.sum()} / {len(y_true)} ({100*abstained_mask.sum()/len(y_true):.1f}%)")
print(f"Cases accepted: {accepted_mask.sum()} / {len(y_true)} ({100*accepted_mask.sum()/len(y_true):.1f}%)")

# Confusion matrix (only on ACCEPTED cases, since abstained cases have no prediction to score)
y_true_accepted = y_true[accepted_mask]
y_pred_accepted = y_pred[accepted_mask]

cm = confusion_matrix(y_true_accepted, y_pred_accepted, labels=range(len(class_names)))
print()
print("=" * 60)
print("CONFUSION MATRIX (rows=actual, columns=predicted)")
print("=" * 60)
cm_df = pd.DataFrame(cm, index=class_names, columns=class_names)
print(cm_df)

# Per-class precision, recall, F1
precision, recall, f1, support = precision_recall_fscore_support(
    y_true_accepted, y_pred_accepted, labels=range(len(class_names)), zero_division=0
)

# Specificity per class: TN / (TN + FP)
specificity = []
total = cm.sum()
for i in range(len(class_names)):
    tp = cm[i, i]
    fn = cm[i, :].sum() - tp
    fp = cm[:, i].sum() - tp
    tn = total - tp - fn - fp
    spec = tn / (tn + fp) if (tn + fp) > 0 else 0
    specificity.append(spec)

print()
print("=" * 60)
print("PER-CLASS METRICS")
print("=" * 60)
metrics_df = pd.DataFrame({
    "Class": class_names,
    "Precision": precision,
    "Recall": recall,
    "Specificity": specificity,
    "F1": f1
})
print(metrics_df.to_string(index=False))

macro_precision = precision.mean()
macro_recall = recall.mean()
macro_specificity = np.mean(specificity)
macro_f1 = f1.mean()

print()
print("Macro-average -> Precision:", round(macro_precision,4), "Recall:", round(macro_recall,4),
      "Specificity:", round(macro_specificity,4), "F1:", round(macro_f1,4))

# Overall accuracy + 95% CI (on accepted cases, standard Wald interval)
n = len(y_true_accepted)
correct = (y_true_accepted == y_pred_accepted).sum()
accuracy = correct / n
se = math.sqrt(accuracy * (1 - accuracy) / n)
ci_low = max(0, accuracy - 1.96 * se)
ci_high = min(1, accuracy + 1.96 * se)

print()
print("=" * 60)
print("SUMMARY TEST PERFORMANCE")
print("=" * 60)
print(f"Test set size (denominator): {len(y_true)}")
print(f"Accepted cases evaluated: {n}")
print(f"Correct predictions (numerator): {correct}")
print(f"Overall accuracy: {accuracy:.4f}")
print(f"95% CI for accuracy: [{ci_low:.4f}, {ci_high:.4f}]")
print(f"Macro-F1: {macro_f1:.4f}")

# Save everything for later use
np.save("final_confusion_matrix.npy", cm)
metrics_df.to_csv("final_per_class_metrics.csv", index=False)
print()
print("Saved final_confusion_matrix.npy and final_per_class_metrics.csv")