// Simple Neural Network class extracted from cl-demo.html
// This is a vanilla JavaScript implementation with no external dependencies

export class SimpleNeuralNetwork {
  constructor(inputSize, hiddenLayers, neuronsPerLayer) {
    this.inputSize = inputSize;
    this.hiddenLayers = hiddenLayers;
    this.neuronsPerLayer = neuronsPerLayer;
    this.learningRate = 0.01;
    this.activationType = 'tanh';
    this.useBias = true;
    this.gridSize = 30;
    
    // Initialize network architecture
    this.weights = [];
    this.biases = [];
    
    // Input -> first hidden
    this.weights.push(this.initializeWeights(inputSize, neuronsPerLayer));
    this.biases.push(this.initializeWeights(1, neuronsPerLayer)[0]);
    
    // Hidden layers
    for (let i = 0; i < hiddenLayers - 1; i++) {
      this.weights.push(this.initializeWeights(neuronsPerLayer, neuronsPerLayer));
      this.biases.push(this.initializeWeights(1, neuronsPerLayer)[0]);
    }
    
    // Last hidden -> output
    this.weights.push(this.initializeWeights(neuronsPerLayer, 1));
    this.biases.push(this.initializeWeights(1, 1)[0]);
    
    // Tracking
    this.trainingLoss = [];
    this.testLoss = [];
    this.averageGradients = [];
    this.currentGradients = [];
    this.currentEpoch = 0;
    
    // Store the current training/test data
    this.currentTrainData = { data: [], labels: [] };
    this.currentTestData = { data: [], labels: [] };
  }
  
  initializeWeights(rows, cols) {
    const weights = [];
    for (let i = 0; i < rows; i++) {
      const rowWeights = [];
      for (let j = 0; j < cols; j++) {
        // He init
        rowWeights.push((Math.random() * 2 - 1) * Math.sqrt(2 / rows));
      }
      weights.push(rowWeights);
    }
    return weights;
  }
  
  setTrainTestData(trainData, testData) {
    this.currentTrainData = trainData;
    this.currentTestData = testData;
  }
  
  reset() {
    // Reset all weights
    this.weights = [];
    this.biases = [];
    
    // Reinitialize weights with the current architecture
    // Input -> first hidden
    this.weights.push(this.initializeWeights(this.inputSize, this.neuronsPerLayer));
    this.biases.push(this.initializeWeights(1, this.neuronsPerLayer)[0]);
    
    // Hidden layers
    for (let i = 0; i < this.hiddenLayers - 1; i++) {
      this.weights.push(this.initializeWeights(this.neuronsPerLayer, this.neuronsPerLayer));
      this.biases.push(this.initializeWeights(1, this.neuronsPerLayer)[0]);
    }
    
    // Last hidden -> output
    this.weights.push(this.initializeWeights(this.neuronsPerLayer, 1));
    this.biases.push(this.initializeWeights(1, 1)[0]);
    
    // Reset tracking variables
    this.trainingLoss = [];
    this.testLoss = [];
    this.averageGradients = [];
    this.currentEpoch = 0;
  }
  
  // Make a clone for history tracking
  clone() {
    const clone = new SimpleNeuralNetwork(this.inputSize, this.hiddenLayers, this.neuronsPerLayer);
    clone.weights = JSON.parse(JSON.stringify(this.weights));
    clone.biases = JSON.parse(JSON.stringify(this.biases));
    
    clone.trainingLoss = [...this.trainingLoss];
    clone.testLoss = [...this.testLoss];
    clone.averageGradients = JSON.parse(JSON.stringify(this.averageGradients));
    
    if (this.currentGradients && this.currentGradients.length > 0) {
      clone.currentGradients = JSON.parse(JSON.stringify(this.currentGradients));
    } else {
      clone.currentGradients = [];
      for (let l = 0; l < clone.weights.length; l++) {
        const layerGradients = [];
        for (let i = 0; i < clone.weights[l].length; i++) {
          const neuronGradients = Array(clone.weights[l][i].length).fill(0);
          layerGradients.push(neuronGradients);
        }
        clone.currentGradients.push(layerGradients);
      }
    }
    
    clone.currentEpoch = this.currentEpoch;
    clone.activationType = this.activationType;
    clone.learningRate = this.learningRate;
    clone.useBias = this.useBias;
    
    // Copy the train/test data too
    clone.currentTrainData = JSON.parse(JSON.stringify(this.currentTrainData));
    clone.currentTestData = JSON.parse(JSON.stringify(this.currentTestData));
    
    return clone;
  }
  
  // Activation functions
  activate(x, activationType = this.activationType) {
    switch (activationType) {
      case 'relu':
        return Math.max(0, x);
      case 'leakyRelu':
        return x > 0 ? x : 0.01 * x;
      case 'sigmoid':
        return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))));
      case 'tanh':
      default:
        return Math.tanh(x);
    }
  }
  
  activateDerivative(x, activationType = this.activationType) {
    switch (activationType) {
      case 'relu':
        return x > 0 ? 1 : 0;
      case 'leakyRelu':
        return x > 0 ? 1 : 0.01;
      case 'sigmoid':
        const s = 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, x))));
        return s * (1 - s);
      case 'tanh':
      default:
        const t = Math.tanh(x);
        return 1 - t * t;
    }
  }
  
  forwardWithDetails(inputs) {
    const activations = [inputs];
    const zValues = [];
    const batchSize = inputs.length;
    
    for (let l = 0; l < this.weights.length; l++) {
      const layerZValues = [];
      const layerActivations = [];
      
      for (let b = 0; b < batchSize; b++) {
        const currentInput = activations[l][b];
        const zs = [];
        const as = [];
        for (let j = 0; j < this.weights[l][0].length; j++) {
          let z = this.useBias ? this.biases[l][j] : 0;
          for (let i = 0; i < currentInput.length; i++) {
            z += currentInput[i] * this.weights[l][i][j];
          }
          zs.push(z);
          const a = (l === this.weights.length - 1)
            ? (1 / (1 + Math.exp(-z))) // final always sigmoid
            : this.activate(z);
          as.push(a);
        }
        layerZValues.push(zs);
        layerActivations.push(as);
      }
      zValues.push(layerZValues);
      activations.push(layerActivations);
    }
    return { activations, zValues };
  }
  
  forward(input) {
    const { activations, zValues } = this.forwardWithDetails([input]);
    return {
      activations: activations.map(layer => layer[0]),
      zValues: zValues.map(layer => layer[0])
    };
  }
  
  binaryCrossEntropy(yTrue, yPred) {
    const epsilon = 1e-7;
    let sum = 0;
    for (let i = 0; i < yTrue.length; i++) {
      const p = Math.max(epsilon, Math.min(1 - epsilon, yPred[i]));
      sum += -(yTrue[i] * Math.log(p) + (1 - yTrue[i]) * Math.log(1 - p));
    }
    return sum / yTrue.length;
  }
  
  // Single-sample style training
  trainOneEpoch(trainX, trainY, testX, testY, batchSize = 32) {
    const epochGradients = Array(this.weights.length).fill(0);
    let batchCount = 0;
    
    for (let i = 0; i < trainX.length; i += batchSize) {
      const batchEnd = Math.min(i + batchSize, trainX.length);
      for (let j = i; j < batchEnd; j++) {
        const { activations, zValues } = this.forward(trainX[j]);
        const { deltas, gradientMagnitudes } = this.backwardSingleSample(trainX[j], [trainY[j]], activations, zValues);
        // track gradient magnitudes
        gradientMagnitudes.forEach((g, idx) => {
          epochGradients[idx] += g;
        });
        batchCount++;
      }
    }
    const avgGradients = epochGradients.map(g => g / batchCount);
    this.averageGradients.push(avgGradients);
    
    // compute train loss
    let trainLossVal = 0;
    for (let i = 0; i < trainX.length; i++) {
      const { activations } = this.forward(trainX[i]);
      const pred = activations[activations.length - 1];
      trainLossVal += this.binaryCrossEntropy([trainY[i]], pred);
    }
    trainLossVal /= trainX.length;
    this.trainingLoss.push(trainLossVal);
    
    // compute test loss
    let testLossVal = 0;
    for (let i = 0; i < testX.length; i++) {
      const { activations } = this.forward(testX[i]);
      const pred = activations[activations.length - 1];
      testLossVal += this.binaryCrossEntropy([testY[i]], pred);
    }
    testLossVal /= testX.length;
    this.testLoss.push(testLossVal);
    
    this.currentEpoch++;
    
    return { trainLoss: trainLossVal, testLoss: testLossVal, avgGradients };
  }
  
  // Simple single-sample backward propagation
  backwardSingleSample(input, target, activations, zValues) {
    const outputLayer = activations.length - 1;
    const output = activations[outputLayer];
    const gradientMagnitudes = [];
    
    this.currentGradients = [];
    for (let l = 0; l < this.weights.length; l++) {
      const layerGradients = [];
      for (let i = 0; i < this.weights[l].length; i++) {
        const neuronGradients = Array(this.weights[l][i].length).fill(0);
        layerGradients.push(neuronGradients);
      }
      this.currentGradients.push(layerGradients);
    }
    
    // output error
    const outputError = [];
    for (let i = 0; i < output.length; i++) {
      const sigDeriv = output[i] * (1 - output[i]);
      outputError.push((output[i] - target[i]) * sigDeriv);
    }
    let currentError = outputError;
    const deltas = [];
    
    // backprop
    for (let l = this.weights.length - 1; l >= 0; l--) {
      const currentA = activations[l];
      const layerDelta = [];
      let layerGradMag = 0;
      
      for (let j = 0; j < this.weights[l][0].length; j++) {
        for (let i = 0; i < currentA.length; i++) {
          const grad = currentError[j] * currentA[i];
          if (!layerDelta[i]) layerDelta[i] = [];
          layerDelta[i][j] = grad;
          this.currentGradients[l][i][j] = grad;
          layerGradMag += Math.abs(grad);
          
          this.weights[l][i][j] -= this.learningRate * grad;
        }
        if (this.useBias) {
          this.biases[l][j] -= this.learningRate * currentError[j];
        }
      }
      gradientMagnitudes.unshift(layerGradMag / (currentA.length * this.weights[l][0].length));
      
      if (l > 0) {
        const nextError = [];
        for (let i = 0; i < currentA.length; i++) {
          let e = 0;
          for (let j = 0; j < currentError.length; j++) {
            e += currentError[j] * this.weights[l][i][j];
          }
          const z = zValues[l - 1][i];
          const dAct = this.activateDerivative(z);
          nextError.push(e * dAct);
        }
        currentError = nextError;
      }
      deltas.unshift(layerDelta);
    }
    return { deltas, gradientMagnitudes };
  }
  
  setLearningRate(rate) {
    this.learningRate = rate;
  }
  
  setActivationType(type) {
    this.activationType = type;
  }
  
  setUseBias(useBias) {
    this.useBias = useBias;
  }
}