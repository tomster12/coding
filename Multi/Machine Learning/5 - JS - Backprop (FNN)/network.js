
class Network {

  constructor(inputShape=null, name=null) {
    // Initialize variables
    this.inputShape = inputShape;
    this.name = name;
    this.layers = [];
    this.cachedOutputs = [];
  }


  propogate(input) {
    // Return early if input is set and mismatched
    if (this.inputShape == null
      || this.inputShape[0] != input.cols
      || this.inputShape[1] != input.rows
    ) {
      console.error("inputShape mismatch " + this.inputShape + " != shape of (" + input + ")");
      return false;
    }

    // Propogate input through layers
    let current = input;
    this.cachedOutputs = [ input ];
    for (let layer of this.layers) {
      current = layer.propogate(current);
      this.cachedOutputs.push(current);
    }
    return current;
  }


  add(layer) {
    // Put layer on end and handle weights
    if (this.layers.length > 0)
      layer.setInputShape(this.layers[this.layers.length - 1].outputShape);
    else if (this.inputShape != null)
      layer.setInputShape(this.inputShape);
    this.layers.push(layer);
  }


  logLayers() {
    // Top line and title
    console.groupC("%c\tNeural Network", "font-size:17px");
    if (this.name != null) console.logC("%c\t" + this.name, "font-size:15px");

    // Log info about each layer
    let shapes = [];
    for (let layer of this.layers) shapes.push({ name: layer.name, shape: layer.shapeToString() });
    console.tableC(shapes);

    // Show individual weights in groups
    console.groupC("%c\tWeights", "font-size:15px");
    for (let layer of this.layers) {
      console.groupC("%c  " + layer.name, "font-size:13px");
      console.logC(layer.weights.toString());
      console.groupEndC();
    }
    console.groupEndC();
    console.groupEndC();
  }


  getLayerShape(layer) {
    // Return shape of a given layer
    if (layer == 0) return this.inputShape;
    else if ((layer - 1) < this.layers.length) return this.layers[layer - 1].outputShape;
  }
}


class Dense {

  constructor(outputSize, activation=actvFuncs.tanh, weightRange=[ -1, 1 ], name="Dense") {
    // Initialize variables
    this.inputShape = null;
    this.outputShape = [1, outputSize, 1];
    this.activation = activation;
    this.weightRange = weightRange;
    this.name = name;
    this.weights = null;
  }


  setInputShape(inputShape) {
    // Set input shape
    if (inputShape[0] > 1 || inputShape[2] > 1) console.error("inputShape " + inputShape + " invalid for Dense layer");
    this.inputShape = inputShape;

    // Create random weights (including bias)
    this.weights = new Matrix2(this.outputShape[1], this.inputShape[1] + 1, this.weightRange[0], this.weightRange[1]);
  }


  propogate(input) {
    // Set input shape as first data that passes through
    if (this.inputShape == null) this.setInputShape([input.cols, input.rows]);
    else if (input.cols != 1 || input.rows != this.inputShape[1]) {
      console.error("inputShape mismatch: " + input.cols + "," + input.rows + " : " + this.inputShape);
      return;
    }

    // Propogate input through weights (including bias)
    let withBias = new Matrix2([...input.data, [1]]);
    let output = this.weights.cross(withBias);
    output.mapData(this.activation.func);
    return output;
  }


  shapeToString() {
    // Return this shape in string version
    return this.inputShape[1] + " -> " + this.outputShape[1];
  }
}


class DenseNetworkTrainer {

  constructor(net) {
    // Initialize variables
    this.net = net;
    this.errorData = [];

    // Setup momentum arrays and neuron drv memoization
    this.pWeightDeltas = this.createWeightDrvList();
    this.resetNeuronDrvMem();
  }


  createWeightDrvList() {
    // Create a matrix same size as all layer weights
    let weightDrvs = [];
    for (let layer of this.net.layers)
      weightDrvs.push(new Matrix2(layer.weights.rows, layer.weights.cols));
    return weightDrvs;
  }


  resetNeuronDrvMem() {
    // Initialize neuron derivative memoization
    this.mem_drvErrToNeuronIn = [];
    for (let layer of this.net.layers)
      this.mem_drvErrToNeuronIn.push(new Array(layer.inputShape[1]));
    this.mem_drvErrToNeuronIn.push(new Array(this.net.layers[this.net.layers.length - 1].outputShape[1]));
  }


  train(settings, debug=false) {
    // Repeat training on training data
    let errorData = [];
    for (let i = 0; i < settings.trainingData.length; i++) {
      let trainingData = settings.trainingData[i];

      // Calculate predicted output / values and error
      let input = new Matrix2(trainingData.input);
      let expectedOutput = new Matrix2(trainingData.expectedOutput);
      let predictedOutput = this.net.propogate(input);
      let predictedValues = this.net.cachedOutputs;
      let error = this.calculateError(predictedOutput, expectedOutput);
      errorData.push(error);

      // Log Progress
      if (debug) {
        console.logC(" ");
        console.groupCollapsedC("Training " + i + ": " + error);
        console.groupCollapsedC("Input");
        console.logC(input.toString());
        console.groupEndC();
        console.groupCollapsedC("Expected");
        console.logC(expectedOutput.toString());
        console.groupEndC();
        console.groupCollapsedC("Predicted");
        console.logC(predictedOutput.toString());
        console.groupEndC();
      }

      // Backpropogate based on the predicted values
      this.backPropagate({
        expectedOutput: expectedOutput,
        predictedValues: predictedValues,
        learningRate: settings.learningRate,
        momentumRate: settings.momentumRate
      }, debug);

      // Log Progress
      if (debug) console.groupEndC();
    }

    // Check if average below preset value
    let average = errorData.reduce((v, acc) => acc + v, 0) / errorData.length;
    if (average < 0.005) return { finished: true, error: this.errorData };

    // Return error data out
    this.errorData = [...this.errorData, ...errorData];
    if (this.errorData.length > 200) this.errorData = this.errorData.splice(this.errorData.length - 200);
    return { finished: false, error: this.errorData };
  }


  backPropagate(settings, debug) {
    // Reset neuron memoization and setup weight diffs
    this.resetNeuronDrvMem();
    let weightDrvs = this.createWeightDrvList();

    // Calculate weight derivatives for all weights
    // (δE / δWᵢⱼ) = (δE / δoⱼ) * (δoⱼ / δnetⱼ) * (δnetⱼ / δWᵢⱼ)
    for (let i = this.net.layers.length - 1; i >= 0; i--) {
      for (let row = 0; row < this.net.layers[i].weights.rows; row++) {
        for (let col = 0; col < this.net.layers[i].weights.cols; col++) {
          let derivative = this.drvErrToWeight(settings, [i, col, row]);
          if (debug) console.logC("Calculated for " + [i, row, col] + ":\t" + derivative);
          weightDrvs[i].setVal(row, col, derivative);
        }
      }

      // Update weights based on weight derivatives
      let weightDeltas = weightDrvs[i].multiply(-settings.learningRate);
      let deltaMomentum = this.pWeightDeltas[i].multiply(settings.momentumRate);
      this.net.layers[i].weights = this.net.layers[i].weights.add(weightDeltas).add(deltaMomentum);
      this.pWeightDeltas[i] = weightDeltas;
    }
  }


  drvNeuronOutToIn(layer, value) {
    // Derive the specific layers activation function
    return this.net.layers[layer - 1].activation.drv(value);
  }


  drvErrToWeight(settings, weight) {
    // (δE / δWᵢⱼ) = (δE / δnetⱼ) * (δnetⱼ / δWᵢⱼ)
    // Return derivative of error wrt weight (accounting for bias)
    if (weight[1] == (this.net.layers[weight[0]].inputShape[1])) var prevNeuronOut = 1.0;
    else var prevNeuronOut = settings.predictedValues[weight[0]].getVal(weight[1], 0);
    let drvErrToNextNeuronIn = this.drvErrToNeuronIn(settings, [weight[0] + 1, weight[2]]);
    let drvErrToWeight = prevNeuronOut * drvErrToNextNeuronIn;
    return drvErrToWeight;
  }


  drvErrToNeuronIn(settings, neuron) {
    // return early if already calculated
    if (this.mem_drvErrToNeuronIn[neuron[0]][neuron[1]] != null)
      return this.mem_drvErrToNeuronIn[neuron[0]][neuron[1]];

    // (δE / δnetⱼ) = (δE / δoⱼ) * (δoⱼ / δnetᵢⱼ) = δⱼ
    // Calculate derivative
    let neuronOutput = settings.predictedValues[neuron[0]].getVal(neuron[1], 0);
    let drvErrToNeuronOut = this.drvErrToNeuronOut(settings, neuron);
    let drvNeuronOutToIn = this.drvNeuronOutToIn(neuron[0], neuronOutput);
    let drvErrToNeuronIn = drvErrToNeuronOut * drvNeuronOutToIn;
    this.mem_drvErrToNeuronIn[neuron[0]][neuron[1]] = drvErrToNeuronIn;
    return drvErrToNeuronIn;
  }


  drvErrToNeuronOut(settings, neuron) {
    // If output then directly derive error function
    // (δE / δoⱼ) = (δE / δy)
    if (neuron[0] == this.net.layers.length)
      return this.drvErrToOutput(settings, neuron[1]);

    // Sum weighted derivatives of neuron inputs
    // (δE / δoⱼ) = Σ(δWᵢⱼ * δₗ)
    let drvErrToNeuronOut = 0;
    for (let i = 0; i < this.net.layers[neuron[0]].outputShape[1]; i++) {
      let weight = this.net.layers[neuron[0]].weights.getVal(i, neuron[1]);
      let drvErrToNextNeuronIn = this.drvErrToNeuronIn(settings, [neuron[0] + 1, i]);
      drvErrToNeuronOut += weight * drvErrToNextNeuronIn;
    }

    // Return summed weighted derivatives
    return drvErrToNeuronOut;
  }


  drvErrToOutput(settings, neuron) {
    // Return the derivative of the error wrt output
    // DrvError = (y - t)
    let predicted = settings.predictedValues[settings.predictedValues.length - 1].getVal(neuron, 0);
    let expected = settings.expectedOutput.getVal(neuron, 0);
    return (predicted - expected);
  }


  calculateError(prediction, actual) {
    // Calculate the error of a prediction
    // Error = 1/2 * Σ(t - y) ^ 2
    let tot = 0;
    for (let i = 0; i < prediction.rows; i++)
      tot += (actual.getVal(i, 0) - prediction.getVal(i, 0)) * (actual.getVal(i, 0) - prediction.getVal(i, 0));
    return 0.5 * tot;
  }
}

actvFuncs = {}

actvFuncs.sigmoid = {}
actvFuncs.sigmoid.func = x => 1 / (1 + Math.exp(-x));
actvFuncs.sigmoid.drv = x => actvFuncs.sigmoid.func(x) * (1 - actvFuncs.sigmoid.func(x));
actvFuncs.sigmoid.outputRange = [0, 1];

actvFuncs.tanh = {};
actvFuncs.tanh.func = x => (Math.exp(2 * x) - 1) / (Math.exp(2 * x) + 1);
actvFuncs.tanh.drv = x => 1 - actvFuncs.tanh.func(x) * actvFuncs.tanh.func(x);
actvFuncs.tanh.outputRange = [-1, 1];

actvFuncs.reLU = {};
actvFuncs.reLU.func = x => max(x, 0);
actvFuncs.reLU.drv = x => (x <= 0) ? (0) : (1);
actvFuncs.reLU.outputRange = [0, null];