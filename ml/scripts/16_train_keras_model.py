import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, f1_score

# Reproducibility: fix the seed so results are consistent across runs
SEED = 42
np.random.seed(SEED)
tf.random.set_seed(SEED)

train = pd.read_csv("data/train_encoded.csv")
val = pd.read_csv("data/val_encoded.csv")

feature_cols = [c for c in train.columns if c != "Disease"]

X_train = train[feature_cols].values.astype("float32")
X_val = val[feature_cols].values.astype("float32")

# Encode disease labels as integers 0-3 (needed for the neural network)
label_encoder = LabelEncoder()
y_train = label_encoder.fit_transform(train["Disease"])
y_val = label_encoder.transform(val["Disease"])

print("Classes:", list(label_encoder.classes_))
print("Input features:", X_train.shape[1])

# Simple feedforward network: input -> 16 hidden units -> 4-class output
model = keras.Sequential([
    keras.layers.Input(shape=(X_train.shape[1],)),
    keras.layers.Dense(16, activation="relu"),
    keras.layers.Dense(4, activation="softmax")
])

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# Stop early if validation loss stops improving, to avoid overfitting
early_stop = keras.callbacks.EarlyStopping(
    monitor="val_loss", patience=10, restore_best_weights=True
)

history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=100,
    batch_size=16,
    callbacks=[early_stop],
    verbose=1
)

# Final validation metrics
val_pred_probs = model.predict(X_val)
val_pred = np.argmax(val_pred_probs, axis=1)

accuracy = accuracy_score(y_val, val_pred)
macro_f1 = f1_score(y_val, val_pred, average="macro")

print()
print("Final validation accuracy:", round(accuracy, 4))
print("Final validation macro-F1:", round(macro_f1, 4))
print("Epochs actually trained:", len(history.history["loss"]))

# Save the trained model for later steps (export, testing)
model.save("model_v1.keras")
print("Model saved to model_v1.keras")