import pandas as pd
import numpy as np
import tensorflow as tf

model = tf.keras.models.load_model("model_v1.keras")

# Use the test set as our fixed conformance case set
test = pd.read_csv("data/test_encoded.csv")
feature_cols = [c for c in test.columns if c != "Disease"]
X_test = test[feature_cols].values.astype("float32")

predictions = model.predict(X_test)

# Save raw probability outputs for comparison
np.save("conformance_python_predictions.npy", predictions)
print("Saved", predictions.shape, "predictions from Python model")
print("First 3 rows of probabilities:")
print(predictions[:3])