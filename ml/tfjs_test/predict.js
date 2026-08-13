const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const path = require('path');

async function main() {
    const modelDir = path.join('..', 'model_tfjs');

    // Read model.json manually
    const modelJson = JSON.parse(fs.readFileSync(path.join(modelDir, 'model.json'), 'utf8'));
    const modelTopology = modelJson.modelTopology;
    const weightsManifest = modelJson.weightsManifest;

    // Collect the weight specs and concatenate the binary weight data
    let weightSpecs = [];
    let weightBuffers = [];
    for (const group of weightsManifest) {
        weightSpecs = weightSpecs.concat(group.weights);
        for (const p of group.paths) {
            weightBuffers.push(fs.readFileSync(path.join(modelDir, p)));
        }
    }
    const weightData = Buffer.concat(weightBuffers);

    // Build an in-memory IOHandler and load the model from it
    const handler = tf.io.fromMemory({
        modelTopology: modelTopology,
        weightSpecs: weightSpecs,
        weightData: weightData.buffer.slice(weightData.byteOffset, weightData.byteOffset + weightData.byteLength)
    });

    const model = await tf.loadLayersModel(handler);
    console.log('Model loaded successfully');

    // Load the same 96 test cases used in Python
    const testFeatures = JSON.parse(fs.readFileSync('test_features.json', 'utf8'));

    const inputTensor = tf.tensor2d(testFeatures);
    const predictions = model.predict(inputTensor);
    const predictionsArray = await predictions.array();

    fs.writeFileSync('tfjs_predictions.json', JSON.stringify(predictionsArray));

    console.log('Saved', predictionsArray.length, 'predictions from TF.js model');
    console.log('First 3 rows:');
    console.log(predictionsArray.slice(0, 3));
}

main().catch(err => console.error('Error:', err));