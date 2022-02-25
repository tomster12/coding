
class FNN {

  // #region - Formats

  //      Weights
  //  List of 2d matrices

  //      Biases
  //  List of flat 2d matrices

  //      inputs / prop layer
  // flat 2d matrix

  //      outputs
  // List of lists

  //      Neuron derivatives
  //  List of lists

  // #endregion


  // #region - Setup

  constructor(layerSizes_, weightRange_, bias_, activationFunctions_) {
    // Main setup
    this.layerSizes = layerSizes_;
    this.weightRange = weightRange_;
    this.bias = bias_;
    this.activationFunctions = activationFunctions_
      || new Array(this.layerSizes.length).fill([tanh, drvTanh]);

    // Setup weight array
    this.weights = new Array(this.layerSizes.length - 1).fill(null).map((_v, i) =>
      new Matrix2(this.layerSizes[i], this.layerSizes[i + 1], this.weightRange[0], this.weightRange[1]));
    this.prevWeightDeltas = new Array(this.layerSizes.length - 1).fill(null).map((_v, i) =>
      new Matrix2(this.layerSizes[i], this.layerSizes[i + 1], 0, 0));

    // Setup Bias array
    if (this.bias) {
      this.biasWeights = new Array(this.layerSizes.length - 1).fill(null).map((_v, i) =>
        new Matrix2(1, this.layerSizes[i + 1], this.weightRange[0], this.weightRange[1]));
    }
  }


  getOutputRange() {
    // Return the range of the outputs
    return this.activationFunctions[this.activationFunctions.length - 1][0].outputRange;
  }

  // #endregion


  // #region - Main

  predict(inputs) {
    // Return if inputs length isnt same as layer 0 length
    if (inputs.length != this.layerSizes[0]) return null;

    // Predict output by propogating inputs with weights
    let outputs = this.getOutputs(inputs);
    return outputs[outputs.length - 1];
  }


  getOutputs(inputs) {
    // Return if inputs length isnt same as layer 0 length
    if (inputs.length != this.layerSizes[0]) return null;

    // Get outputs by propogating inputs with weights
    let outputs = [];
    let currentLayer = new Matrix2([inputs]);
    outputs.push(currentLayer.getRowList(0));
    for (let wtLyr = 0; wtLyr < this.weights.length; wtLyr++) {
      let nextLayer = currentLayer.cross(this.weights[wtLyr]);
      if (this.bias) nextLayer = nextLayer.add(this.biasWeights[wtLyr]);
      nextLayer.mapData((v, _r, _c) => (this.neuronNetToOut(wtLyr + 1, v)));
      currentLayer = nextLayer;
      outputs.push(currentLayer.getRowList(0));
    }
    return outputs;
  }


  neuronNetToOut(layer, value) {
    // Run through the given layer activation function
    return this.activationFunctions[layer][0](value);
  }

  // #endregion
}


class FNNBackprop extends FNN {

  // #region - Main

  constructor(layerSizes_, weightRange_, bias_, activationFunctions_) {
    super(layerSizes_, weightRange_, bias_, activationFunctions_);

    // Setup momentum arrays
    this.prevWeightDeltas = new Array(this.layerSizes.length - 1).fill(null).map((_v, i) =>
      new Matrix2(this.layerSizes[i], this.layerSizes[i + 1], 0, 0));
    if (this.bias) {
      this.prevBiasWeightDeltas = new Array(this.layerSizes.length - 1).fill(null).map((_v, i) =>
        new Matrix2(1, this.layerSizes[i + 1], 0, 0));
    }

    // Neuron derivative memoization
    this.drvENeuronNetMem = new Array(this.layerSizes.length).fill(null).map((_v, i) =>
      new Array(this.layerSizes[i]).fill(null));
  }


  train(settings) {
    // Train FNN using data amount times
    let errorData = [];
    for (let i = 0; i < settings.amount; i++) {
      for (let o = 0; o < settings.trainingData.length; o++) {
        let predictedOutputs = this.getOutputs(settings.trainingData[o][0]);
        errorData.push(this.calculateError(
          predictedOutputs[predictedOutputs.length - 1],
          settings.trainingData[o][1]));
        this.backPropagate({
          expectedOutputs: settings.trainingData[o][1],
          predictedOutputs: predictedOutputs,
          learningRate: settings.learningRate,
          momentumRate: settings.momentumRate
        });
      }
    }
    return errorData;
  }


  backPropagate(settings) {
    // Reset neuron and setup weight derivatives
    this.drvENeuronNetMem = this.drvENeuronNetMem.map((v) => v.fill(null));
    let weightDerivatives = new Array(this.layerSizes.length - 1).fill([])
      .map((_v, i) => new Matrix2(this.layerSizes[i], this.layerSizes[i + 1], 0, 0));

    // Calculate weight derivatives
    // (δE / δWᵢⱼ) = (δE / δoⱼ) * (δoⱼ / δnetⱼ) * (δnetⱼ / δWᵢⱼ)
    for (let i = weightDerivatives.length - 1; i >= 0; i--) {
      for (let row = 0; row < weightDerivatives[i].rows; row++) {
        for (let col = 0; col < weightDerivatives[i].cols; col++) {
          let derivative = this.drvEWeight(settings, [i, row, col]);
          weightDerivatives[i].setVal(row, col, derivative);
        }
      }

      // Update weights based on weight derivatives
      let weightDeltas = weightDerivatives[i].multiply(-settings.learningRate);
      let deltaMomentum = this.prevWeightDeltas[i].multiply(settings.momentumRate);
      this.weights[i] = this.weights[i].add(weightDeltas).add(deltaMomentum);
      this.prevWeightDeltas[i] = weightDeltas;

      // Update biasWeights based on neuron derivatives - format first
      if (this.bias) {
        let currentDrvENeuronNetMem = new Matrix2([this.drvENeuronNetMem[i + 1]]);
        let biasWeightDeltas = currentDrvENeuronNetMem.multiply(-settings.learningRate);
        let biasDeltaMomentum = this.prevBiasWeightDeltas[i].multiply(settings.momentumRate);
        this.biasWeights[i] = this.biasWeights[i].add(biasWeightDeltas).add(biasDeltaMomentum);
        this.prevBiasWeightDeltas[i] = biasWeightDeltas;
      }
    }
  }


  drvNeuronOutWRTNet(layer, value) {
    // Derived the specific layers activation function
    return this.activationFunctions[layer][1](value);
  }


  drvEWeight(settings, weight) {
    // (δE / δWᵢⱼ) = (δE / δnetⱼ) * (δnetⱼ / δWᵢⱼ)
    // Return derivative of error wrt weight
    let prevNeuronOut = settings.predictedOutputs[weight[0]][weight[1]];
    let drvENextNeuronNet = this.drvENeuronNet(settings, [weight[0] + 1, weight[2]]);
    let drECurrentWeight = prevNeuronOut * drvENextNeuronNet;
    return drECurrentWeight;
  }

  drvENeuronNet(settings, neuron) {
    // Derivative already calculated
    let drvECurrentNeuronNet;
    if (this.drvENeuronNetMem[neuron[0]][neuron[1]] != null) {
      drvECurrentNeuronNet = this.drvENeuronNetMem[neuron[0]][neuron[1]];

    // (δE / δnetⱼ) = (δE / δoⱼ) * (δoⱼ / δnetᵢⱼ) = δⱼ
    // Calculate derivative
    } else {
      let neuronOutput = settings.predictedOutputs[neuron[0]][neuron[1]];
      let drvECurrentNeuronOut = this.drvENeuronOut(settings, neuron);
      let drvOutCurrentNeuronNet = this.drvNeuronOutWRTNet(neuron[0], neuronOutput);
      drvECurrentNeuronNet = drvECurrentNeuronOut * drvOutCurrentNeuronNet;
      this.drvENeuronNetMem[neuron[0]][neuron[1]] = drvECurrentNeuronNet;
    }

    // Return derivative
    return drvECurrentNeuronNet;
  }

  drvENeuronOut(settings, neuron) {
    // Directly derive error function
    // (δE / δoⱼ) = (δE / δy)
    let drvECurrentNeuronOut;
    if (neuron[0] == this.layerSizes.length - 1) {
      drvECurrentNeuronOut = this.drvEOutput(settings, neuron[1]);

    // Sum weighted derivatives of neuron inputs
    // (δE / δoⱼ) = Σ(δWᵢⱼ * δₗ)
    } else {
      drvECurrentNeuronOut = 0;
      for (let i = 0; i < this.layerSizes[neuron[0] + 1]; i++) {
        let weight = this.weights[neuron[0]].getVal(neuron[1], i);
        let drvENextNeuronNet = this.drvENeuronNet(settings, [neuron[0] + 1, i]);
        drvECurrentNeuronOut += weight * drvENextNeuronNet;
      }
    }

    // Return derivative
    return drvECurrentNeuronOut;
  }

  drvEOutput(settings, neuronNetd) {
    // Return the derivative of the error wrt output
    // DrvError = (y - t)
    let predicted = settings.predictedOutputs[settings.predictedOutputs.length - 1][neuronNetd];
    let expected = settings.expectedOutputs[neuronNetd];
    return (predicted - expected);
  }


  calculateError(prediction, actual) {
    // Calculate the error of a prediction
    // Error = 1/2 * Σ(t - y) ^ 2
    let tot = 0;
    for (let i = 0; i < prediction.length; i++)
      tot += (actual[i] - prediction[i]) * (actual[i] - prediction[i]);
    return 0.5 * tot;
  }

  // #endregion
}


class FNNTrainer {

  // #region - Main

  constructor(net_, learningRate_, momentumRate_) {
    // Initialize variables
    this.net = net_;
    this.isTraining = false;
    this.learningRate = learningRate_;
    this.momentumRate = momentumRate_;
    this.trainingData = null;
    this.errorData = [];
  }


  setTrainingData(trainingData_) {
    // Set the training data
    this.trainingData = trainingData_
  }


  train(amount) {
    // Train the FNN with default value
    let errorData = this.net.train({
      amount: amount,
      trainingData: this.trainingData,
      learningRate: this.learningRate,
      momentumRate: this.momentumRate });
    this.errorData = this.errorData.concat(errorData);
  }


  update() {
    // e - Remove all training data
    if (input.keys.clicked[69]) this.trainingData = [];

    // tab - Start training
    else if (input.keys.clicked[32]) this.isTraining = !this.isTraining;

    // Train if told to
    if (this.isTraining) this.train(1);

    // Stop training if average error is low
    let tot = 0;
    for (let i = 0; i < 10; i++)
      tot += this.errorData[max(this.errorData.length - 1 - i, 0)];
    if ((tot / 10) < 0.01) this.isTraining = false;
  }

  // #endregion
}


class FNNVisualizer {

  // #region - Setup

  constructor(net_, netTrain_, netView_) {
    // Initialize variables
    this.net = net_;
    this.netTrain = netTrain_;
    this.netView = netView_;

    this.sampledOutputs = new Array(this.net.layerSizes.length).fill(null).map(
      (_v, i) => new Array(this.net.layerSizes[i]).fill(null).map(
        (_v) => new Matrix2(this.netView.quality, this.netView.quality, 0, 0)));
  }


  setOutput2t1T(pos, size) {
    // Set variable
    this.output2t1T = { pos, size };
  }


  setInternal2t1T(pos, size) {
    // Set variable
    this.internal2t1T = { pos, size };
  }


  setErrorT(pos, size) {
    // Set variable
    this.errorT = { pos, size };
  }

  // #endregion


  // #region - Main

  update() {
    // Update sampledOutputs
    this.updateSampledOutputs();

    // q / e - Add training data if has trainer
    if (this.netTrain != null && (input.keys.clicked[81] || input.keys.clicked[87])) {
      let input0 = map(
        constrain(mouseX, this.output2t1T.pos.x, this.output2t1T.pos.x + this.output2t1T.size.x),
        this.output2t1T.pos.x, this.output2t1T.pos.x + this.output2t1T.size.x,
        this.netView.start.x, this.netView.end.x);

      let input1 = map(
        constrain(mouseY, this.output2t1T.pos.y, this.output2t1T.pos.y + this.output2t1T.size.y),
        this.output2t1T.pos.y, this.output2t1T.pos.y + this.output2t1T.size.y,
        this.netView.start.y, this.netView.end.y);

      let output = (input.keys.clicked[81] ? net.getOutputRange()[0] : net.getOutputRange()[1]);
      this.netTrain.trainingData.push([ [ input0, input1 ], [ output ] ]);
    }
  }


  show() {
    if (this.output2t1T != null) this.drawOutput2t1();
    if (this.internal2t1T != null) this.drawInternal2t1();
    if (this.errorT != null) this.drawError();
  }


  updateSampledOutputs() {
    // For every prediction point
    for (let x = 0; x < this.netView.quality; x++) {
      for (let y = 0; y < this.netView.quality; y++) {
        let input0 = map(x, 0, this.netView.quality, this.netView.start.x, this.netView.end.x);
        let input1 = map(y, 0, this.netView.quality, this.netView.start.x, this.netView.end.y);
        let netOutputs = net.getOutputs([input0, input1]);

        // Update each neurons matrix
        for (let i = 0; i < net.layerSizes.length; i++) {
          for (let o = 0; o < net.layerSizes[i]; o++) {
            this.sampledOutputs[i][o].setVal(y, x, netOutputs[i][o]);
          }
        }
      }
    }
  }


  drawOutput2t1() {
    // Draw matrix
    this.drawMatrix2(
      this.output2t1T.pos, this.output2t1T.size,
      this.sampledOutputs[this.sampledOutputs.length - 1][0], 1);

    // Draw training data if has trainer
    if (this.netTrain != null) {
      for (let data of this.netTrain.trainingData) {
        strokeWeight(2);
        stroke(0);
        fill(this.netOutputColor(net, data[1][0]));
        let px = this.output2t1T.pos.x + map(data[0][0], this.netView.start.x, this.netView.end.x, 0, this.output2t1T.size.x);
        let py = this.output2t1T.pos.y + map(data[0][1], this.netView.start.y, this.netView.end.y, 0, this.output2t1T.size.y);
        ellipse(px, py, 15, 15);
      }
    }
  }


  drawInternal2t1() {
    // Draw background
    noStroke();
    fill(255);
    rect(this.internal2t1T.pos.x, this.internal2t1T.pos.y, this.internal2t1T.size.x, this.internal2t1T.size.y);

    // Main variables
    let border = 50;
    let maxLength = this.sampledOutputs.reduce((p, v) => (p.length > v.length ? p : v)).length;
    let dx = (this.sampledOutputs.length > 1) ? (this.internal2t1T.size.x - border * 2) / (this.sampledOutputs.length - 1) : 0;
    let dy = (maxLength > 1) ? (this.internal2t1T.size.y - border * 2) / (maxLength - 1) : 0;
    let sx = 40;
    let sy = 40;
    let getCx = (ni) => ((this.internal2t1T.pos.x + border) + (ni * dx));
    let getCy = (ni, no) => ((this.internal2t1T.pos.y + this.internal2t1T.size.y / 2) + (no - (this.sampledOutputs[ni].length - 1) / 2) * dy);

    // For each neuron
    for (let i = 0; i < this.sampledOutputs.length; i++) {
      for (let o = 0; o < this.sampledOutputs[i].length; o++) {
        let cx = getCx(i);
        let cy = getCy(i, o);
        let px = cx - sx / 2;
        let py = cy - sy / 2;

        // Draw connections
        if (i < this.sampledOutputs.length - 1) {
          for (let p = 0; p < this.sampledOutputs[i + 1].length; p++) {
            let ocx = getCx(i + 1);
            let ocy = getCy(i + 1, p);
            stroke(this.netOutputColor(this.net, this.net.weights[i].getVal(o, p)));
            strokeWeight(max(abs(this.net.weights[i].getVal(o, p)), 0.1));
            line(cx, cy, ocx, ocy);
          }
        }

        // Draw background
        strokeWeight(2);
        stroke(0);
        fill(255);
        rect(px, py, sx, sy);

        // Draw predictionArray
        this.drawMatrix2({ x: px, y: py }, { x: sx, y: sy }, this.sampledOutputs[i][o], 8);
      }
    }
  }


  drawError() {
    // Draw error if has trainer
    let data = this.netTrain.errorData || [];
    let showAmount = data.length;
    let border = 20;

    noStroke();
    fill(255);
    rect(this.errorT.pos.x, this.errorT.pos.y, this.errorT.size.x, this.errorT.size.y);
    stroke(0);
    line(this.errorT.pos.x + border, this.errorT.pos.y + border,
      this.errorT.pos.x + border, this.errorT.pos.y + this.errorT.size.y - border);
    line(this.errorT.pos.x + border, this.errorT.pos.y + this.errorT.size.y - border,
      this.errorT.pos.x + this.errorT.size.x - border, this.errorT.pos.y + this.errorT.size.y - border);

    // If enough data to draw line
    if (data.length > 1) {
      let startIndex = max(data.length - showAmount, 0);
      let showAmountLim = min(showAmount, data.length);

      // Draw the data
      let toShow = data.slice(startIndex, startIndex + showAmountLim);
      let xDif = (this.errorT.size.x - border * 2) / (toShow.length - 1);
      let dataMax = data.reduce((p, v) => (p > v ? p : v));
      for (let i = 0; i < toShow.length - 1; i++) {
        line(this.errorT.pos.x + border + (i) * xDif,
          this.errorT.pos.y + this.errorT.size.y - border - (toShow[i] / dataMax) * (this.errorT.size.y - border * 2),
          this.errorT.pos.x + border + (i + 1) * xDif,
          this.errorT.pos.y + this.errorT.size.y - border - (toShow[i + 1] / dataMax) * (this.errorT.size.y - border * 2));
      }

      // Draw labels
      textSize(12);
      noStroke();
      fill(0);
      textAlign(LEFT);
      text(startIndex,
        this.errorT.pos.x + border,
        this.errorT.pos.y + this.errorT.size.y - border + 15);
      text(dataMax,
        this.errorT.pos.x + border,
        this.errorT.pos.y + border - 4);
      textAlign(RIGHT);
      text(startIndex + showAmountLim,
        this.errorT.pos.x + this.errorT.size.x - border,
        this.errorT.pos.y + this.errorT.size.y - border + 15);
    }
  }


  drawMatrix2(start, size, mat, interval) {
    // Draw a matrix
    noStroke();
    fill(255);
    rect(start.x, start.y, size.x, size.y);
    let dx = interval * size.x / mat.cols;
    let dy = interval * size.y / mat.rows;
    noStroke();
    for (let y = 0; y < mat.rows; y++) {
      for (let x = 0; x < mat.cols; x++) {
        if (x % interval == 0 && y % interval == 0) {
          fill(this.netOutputColor(net, mat.getVal(y, x)));
          rect(start.x + dx * x / interval, start.y + dy * y / interval, dx, dy);
        }
      }
    }
  }


  netOutputColor(net, value) {
    // Lerp color based on net output range TODO change
    let colorAmount = map(value, net.getOutputRange()[0], net.getOutputRange()[1], 0, 1);
    return lerpColor(color("#e0b33f"), color("#609cda"), colorAmount);
  }

  // #endregion
}


// #region - Activation functions

function sigmoid(value) {
  // Sigmoid function
  return 1 / (1 + Math.exp(-value));
}
function drvSigmoid(value) {
  // Derivative of sigmoid function
  return sigmoid(value) * (1 - sigmoid(value));
}
sigmoid.outputRange = [0, 1];


function tanh(value) {
  // Tanh function
  return (Math.exp(2 * value) - 1) / (Math.exp(2 * value) + 1);
}
function drvTanh(value) {
  // Derivative of tanh function
  return 1 - tanh(value) * tanh(value);
}
tanh.outputRange = [-1, 1];


function reLU(value) {
  // ReLU function
  return max(value, 0);
}
function drvReLU(value) {
  // Derivative of ReLU function
  return (value <= 0) ? (0) : (1);
}
reLU.outputRange = [0, null];

// #endregion
