import tensorflow as tf
from tensorflow import keras
import tensorflowjs as tfjs

# Rebuild the EXACT same architecture used during training
# (29 input features -> 16 hidden units -> 4-class output)
model = keras.Sequential([
    keras.layers.Input(shape=(29,)),
    keras.layers.Dense(16, activation="relu"),
    keras.layers.Dense(4, activation="softmax")
])

# Load the trained weights (not architecture) from the .h5 file
model.load_weights("model_v1.h5")

print("Weights loaded successfully")
model.summary()

# Now export directly to TensorFlow.js using the Python API
# (bypasses the command-line tool's file-format assumptions entirely)
tfjs.converters.save_keras_model(model, "model_tfjs")
print("Exported to model_tfjs/")