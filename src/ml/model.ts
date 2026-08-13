import * as tf from "@tensorflow/tfjs";
import fs from "fs";
import path from "path";

let loadedModel: tf.LayersModel | null = null;

/**
 * Loads model.json + its weight file from disk into memory.
 * Called once at server startup (see server.ts) and cached in
 * `loadedModel` — every prediction request reuses the same instance
 * rather than reloading the model from disk each time.
 */
export async function loadModel(): Promise<tf.LayersModel> {
  if (loadedModel) {
    return loadedModel;
  }

  const modelDir = path.join(__dirname, "model_tfjs");
  const modelJsonPath = path.join(modelDir, "model.json");
  const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, "utf-8"));

  const weightFileName = modelJson.weightsManifest[0].paths[0];
  const weightBuffer = fs.readFileSync(path.join(modelDir, weightFileName));

  const weightData = weightBuffer.buffer.slice(
    weightBuffer.byteOffset,
    weightBuffer.byteOffset + weightBuffer.byteLength
  );

  loadedModel = await tf.loadLayersModel(
    tf.io.fromMemory({
      modelTopology: modelJson.modelTopology,
      weightSpecs: modelJson.weightsManifest[0].weights,
      weightData,
    })
  );

  console.log("[ml] Model loaded:", loadedModel.inputs[0].shape, "->", loadedModel.outputs[0].shape);

  return loadedModel;
}

/**
 * Runs a single 29-length feature vector through the loaded model and
 * returns the raw probability for each of the 4 classes, in the
 * model's native output order: [Diabetes mellitus, Malaria, Pneumonia,
 * Typhoid fever].
 */
export async function runInference(featureVector: number[]): Promise<number[]> {
  const model = await loadModel();
  const inputTensor = tf.tensor2d([featureVector]);
  const outputTensor = model.predict(inputTensor) as tf.Tensor;
  const probabilities = await outputTensor.data();

  inputTensor.dispose();
  outputTensor.dispose();

  return Array.from(probabilities);
}
