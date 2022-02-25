
// #region - Base

class NetInt {

  // Declare static variables
  static POSITIVE_COLOR = "#71c4ee";
  static NEGATIVE_COLOR = "#de79c7";
  static NEUTRAL_COLOR = "#cbcbcb";


  constructor(net) {
    // Initialize variables
    this.net = net;
    this.trainer = null;
    this.trainerSettings = null;
    this.trainerErrorGraph = null;
    this.objects = [];
  }


  update(view, interactable) {
    // Show all objects
    this.updateTrainer();
    for (let obj of this.objects) obj.update(view, interactable);
  }


  updateTrainer() {
    // Run trainer if exists
    if (this.trainer != null) {
      let result = this.trainer.train(this.trainerSettings, false);
      if (this.trainerErrorGraph != null) this.trainerErrorGraph.setValues(result.error);
    }
  }


  show(view) {
    // Show all objects
    for (let obj of this.objects) obj.showWeights(view);
    for (let obj of this.objects) obj.show(view);
  }


  addTrainer(learningRate, momentumRate, trainingData, errorGraph=null) {
    // Create a trainer
    this.trainer = new DenseNetworkTrainer(this.net);
    this.trainerSettings = { trainingData, learningRate, momentumRate };
    if (errorGraph != null) this.trainerErrorGraph = errorGraph;
  }
}


class NetIntObject {

  // Declare static variables
  static OUTLINE_COLOR = "#616161";
  static HOVER_OUTLINE_COLOR = "#bdbdbd";


  constructor(netInt, x, y, size) {
    // Initialize variables
    this.netInt = netInt;
    this.pos = { x, y };
    this.size = size;
    this.dragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.output = createGraphics(this.size, this.size);
  }


  update(view, interactable) {
    if (interactable) this.updateDragging(view);
  }


  updateDragging(view) {
    // Check whether lmb ontop
    if (input.mouse.clicked[LEFT]) {
      if (this.mouseOntop(view)) {
        this.dragging = true;
        this.dragOffset = { x: this.pos.x - view.getMouseX(), y: this.pos.y - view.getMouseY() };
      }

    // Stop dragging on mouse up
    } else if (!input.mouse.held[LEFT]) this.dragging = false;

    // Update position if dragging
    if (this.dragging) {
      this.pos.x = view.getMouseX() + this.dragOffset.x;
      this.pos.y = view.getMouseY() + this.dragOffset.y;
    }
  }


  show(view) {
    // Draw output and border
    view.getOutput().strokeWeight(4);
    if (this.mouseOntop(view)) view.getOutput().stroke(color(NetIntObject.HOVER_OUTLINE_COLOR));
    else view.getOutput().stroke(color(NetIntObject.OUTLINE_COLOR));
    view.getOutput().noFill();
    view.getOutput().image(this.output, this.pos.x, this.pos.y, this.size, this.size);
    view.getOutput().rect(this.pos.x, this.pos.y, this.size, this.size);
  }


  showWeights(view) {}


  mouseOntop(view) {
    // Check whether mouse is overtop
    return (
      view.mouseOntop()
      && view.getMouseX() > this.pos.x
      && view.getMouseX() <= (this.pos.x + this.size)
      && view.getMouseY() > this.pos.y
      && view.getMouseY() <= (this.pos.y + this.size)
    );
  }
}

// #endregion


// #region - Layer value graphs

class NetIntLayerValues extends NetInt {

  constructor(net, size, presetInputs) {
    super(net);

    // Initialize variables
    this.presetInputs = presetInputs;
    this.currentPreset = 0;
    this.buttons = [];

    // Create an object for each layer
    for (let layer = 0; layer < this.net.layers.length + 1; layer++) {
      let px = size * (0.5 + layer * 1.5);
      let py = size * 0.5;
      this.objects.push(new NetIntValuesDenseLayer(this, px, py, size, layer));
    }

    // Create visible weights between layers
    for (let layer = 0; layer < this.net.layers.length; layer++) {
      this.objects[layer].visibleWeights.push({ obj: this.objects[layer + 1] });
    }

    // Create buttons for changing preset inputs
    let b = 5;
    this.buttons.push(new Button(b, b, b * 4, b * 4, () => {
      this.currentPreset = (this.currentPreset + this.presetInputs.length - 1) % this.presetInputs.length;
    }));
    this.buttons.push(new Button(b * 6, b, b * 4, b * 4, () => {
      this.currentPreset = (this.currentPreset + 1) % this.presetInputs.length;
    }));
  }


  update(view, interactable) {
    // Update buttons
    for (let button of this.buttons) button.update(view, interactable);
    if (interactable) this.updateValues();

    super.update(view, interactable);
  }


  updateValues() {
    // Run the network on set inputs and update layers
    let output = this.net.propogate(new Matrix2(this.presetInputs[this.currentPreset]));
    for (let obj of this.objects) obj.updateValues(this.net);
  }


  show(view) {
    super.show(view);

    // Show buttons
    for (let button of this.buttons) button.show(view);
  }
}


class NetIntValuesDenseLayer extends NetIntObject {

  constructor(netInt, x, y, size, layer) {
    super(netInt, x, y, size);

    // Initialize variables
    this.size = size;
    this.layer = layer;
    this.output = createGraphics(size, size);
    this.values = [];
    this.visibleWeights = [];
  }


  updateValues(net) {
    // Update values based on network
    this.values = net.cachedOutputs[this.layer].getColList(0);
  }


  show(view) {
    // Show background
    this.output.background("#3d3d3d");

    // Show graph
    this.output.stroke(0);
    this.output.line(this.size * 0.1, this.size * 0.1, this.size * 0.1, this.size * 0.9);
    this.output.line(this.size * 0.1, this.size * 0.9, this.size * 0.9, this.size * 0.9);

    // Show values
    this.output.noStroke();
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i] >= 0) this.output.fill(NetInt.POSITIVE_COLOR);
      else this.output.fill(NetInt.NEGATIVE_COLOR);
      let bar = this.getBarInfo(i);
      this.output.rect(bar.px, bar.py, bar.sx, bar.sy);
    }

    super.show(view);
  }


  showWeights(view) {
    view.getOutput().stroke(NetInt.NEUTRAL_COLOR);
    view.getOutput().strokeWeight(this.size * 0.1);
    for (let weight of this.visibleWeights) {
      view.getOutput().line(
        this.pos.x + this.size * 0.5,
        this.pos.y + this.size * 0.5,
        weight.obj.pos.x + weight.obj.size * 0.5,
        weight.obj.pos.y + weight.obj.size * 0.5
      );
    }
  }


  getBarInfo(index) {
    // Get and then return position / size for each bar
    let sx = this.size * 0.8 / (this.values.length * 2 - 1);
    let px = this.size * 0.1 + sx * index * 2;

    if (this.values[index] >= 0) {
      if (this.layer == 0) var topValue = 1.0;
      else var topValue = this.netInt.net.layers[this.layer - 1].activation.outputRange[1];
      var sy = this.size * 0.8 * this.values[index] / topValue;
      var py = this.size * 0.9 - sy;

    } else {
      if (this.layer == 0) var topValue = -1.0;
      else var topValue = this.netInt.net.layers[this.layer - 1].activation.outputRange[0];
      var sy = this.size * 0.8 * this.values[index] / topValue;
      var py = this.size * 0.1;
    }

    return { px, py, sx, sy };
  }
}

// #endregion


// #region - Neuron value graphs

class NetIntNeuronValues extends NetInt {

  constructor(net, size, presetInputs) {
    super(net);

    // Initialize variables
    this.presetInputs = presetInputs;
    this.currentPreset = 0;
    this.buttons = [];

    // For each layer count objects (accounting for bias)
    let layers = [];
    for (let layer = 0; layer < this.net.layers.length + 1; layer++) {
      if (layer == this.net.layers.length) var count = this.net.layers[layer - 1].outputShape[1];
      else var count = this.net.layers[layer].inputShape[1] + 1;

      // Create all objects in layer
      layers.push([]);
      for (let index = 0; index < count; index++) {
        let px = size * (0.5 + layer * 1.5);
        let py = size * (0.5 + index * 1.5);
        this.objects.push(new NetIntValuesDenseNeuron(this, px, py, size, layer, index));
        layers[layers.length - 1].push(this.objects[this.objects.length - 1]);
      }
    }

    // Create visible weights between (accounting for bias)
    for (let layer = 0; layer < layers.length - 1; layer++) {
      for (let index0 = 0; index0 < layers[layer].length; index0++) {
        let nextAmount = layers[layer + 1].length;
        if (layer != (layers.length - 2)) nextAmount--;
        for (let index1 = 0; index1 < nextAmount; index1++) {
          layers[layer][index0].visibleWeights.push({ obj: layers[layer + 1][index1] });
        }
      }
    }

    // Create buttons for changing preset inputs
    let b = 5;
    this.buttons.push(new Button(b, b, b * 4, b * 4, () => {
      this.currentPreset = (this.currentPreset + this.presetInputs.length - 1) % this.presetInputs.length;
    }));
    this.buttons.push(new Button(b * 6, b, b * 4, b * 4, () => {
      this.currentPreset = (this.currentPreset + 1) % this.presetInputs.length;
    }));
  }


  update(view, interactable) {
    // Update buttons
    for (let button of this.buttons) button.update(view, interactable);
    if (interactable) this.updateValues();

    super.update(view, interactable);
  }


  updateValues() {
    // Run the network on set inputs and update layers
    let output = this.net.propogate(new Matrix2(this.presetInputs[this.currentPreset]));
    for (let obj of this.objects) obj.updateValues();
  }


  show(view) {
    super.show(view);

    // Show buttons
    for (let button of this.buttons) button.show(view);
  }
}


class NetIntValuesDenseNeuron extends NetIntObject {

  constructor(netInt, x, y, size, layer, index) {
    super(netInt, x, y, size);

    // Initialize variables
    this.size = size;
    this.layer = layer;
    this.index = index;
    this.output = createGraphics(size, size);
    this.value = 0;
    this.visibleWeights = [];
  }


  updateValues() {
    // Update values based on network (accounting for bias)
    if (this.layer < this.netInt.net.layers.length
      && this.index == this.netInt.net.layers[this.layer].inputShape[1]) this.value = 1.0;
    else this.value = this.netInt.net.cachedOutputs[this.layer].getVal(this.index, 0);
  }


  show(view) {
    // Show background
    this.output.background("#3d3d3d");

    // Show graph
    this.output.stroke(0);
    this.output.line(this.size * 0.1, this.size * 0.1, this.size * 0.1, this.size * 0.9);
    this.output.line(this.size * 0.1, this.size * 0.9, this.size * 0.9, this.size * 0.9);

    // Show value
    this.output.noStroke();
    if (this.value >= 0) this.output.fill(NetInt.POSITIVE_COLOR);
    else this.output.fill(NetInt.NEGATIVE_COLOR);
    let bar = this.getBarInfo();
    this.output.rect(bar.px, bar.py, bar.sx, bar.sy);

    super.show(view);
  }


  showWeights(view) {
    // Show all outbound weights
    for (let weight of this.visibleWeights) {
      let weightVal = this.netInt.net.layers[this.layer].weights.getVal(weight.obj.index, this.index);
      let width = max(map(abs(weightVal), 0, 1, 0.5, this.size * 0.1), 0.5);

      view.getOutput().stroke(weightVal >= 0 ? NetInt.POSITIVE_COLOR : NetInt.NEGATIVE_COLOR);
      view.getOutput().strokeWeight(width);
      view.getOutput().line(
        this.pos.x + this.size * 0.5,
        this.pos.y + this.size * 0.5,
        weight.obj.pos.x + weight.obj.size * 0.5,
        weight.obj.pos.y + weight.obj.size * 0.5
      );
    }
  }


  getBarInfo() {
    // Get and then return position / size for each bar
    let sx = this.size * 0.8;
    let px = this.size * 0.1;

    if (this.value >= 0) {
      if (this.layer == 0) var topValue = 1.0;
      else var topValue = this.netInt.net.layers[this.layer - 1].activation.outputRange[1];
      var sy = this.size * 0.8 * this.value / topValue;
      var py = this.size * 0.9 - sy;

    } else {
      if (this.layer == 0) var topValue = -1.0;
      else var topValue = this.netInt.net.layers[this.layer - 1].activation.outputRange[0];
      var sy = this.size * 0.8 * this.value / topValue;
      var py = this.size * 0.1;
    }

    return { px, py, sx, sy };
  }
}

// #endregion


// #region - XY samples

class NetIntXY extends NetInt {

  constructor(net, size, sampleAmount, inputRange) {
    super(net);

    // Initialize variables
    this.sampleAmount = sampleAmount;
    this.inputRange = inputRange;

    // For each layer count objects (accounting for bias)
    let layers = [];
    for (let layer = 0; layer < this.net.layers.length + 1; layer++) {
      if (layer == this.net.layers.length) var count = this.net.layers[layer - 1].outputShape[1];
      else var count = this.net.layers[layer].inputShape[1] + 1;

      // Create all objects in layer
      layers.push([]);
      for (let index = 0; index < count; index++) {
        let px = size * (0.5 + layer * 1.5);
        let py = size * (0.5 + index * 1.5);
        this.objects.push(new NetIntXYDenseNeuron(
          this, px, py, size, layer, index,
          this.sampleAmount, this.inputRange
        ));
        layers[layers.length - 1].push(this.objects[this.objects.length - 1]);
      }
    }

    // Create visible weights between (accounting for bias)
    for (let layer = 0; layer < layers.length - 1; layer++) {
      for (let index0 = 0; index0 < layers[layer].length; index0++) {
        let nextAmount = layers[layer + 1].length;
        if (layer != (layers.length - 2)) nextAmount--;
        for (let index1 = 0; index1 < nextAmount; index1++) {
          layers[layer][index0].visibleWeights.push({ obj: layers[layer + 1][index1] });
        }
      }
    }
  }


  update(view, interactable) {
    // Update samples
    if (interactable) this.updateSamples();

    super.update(view, interactable);
  }


  updateSamples() {
    // Load all obj pixels
    for (let obj of this.objects) obj.output.loadPixels();

    // For each sample pixel run the network
    for (let sampleX = 0; sampleX < this.sampleAmount; sampleX++) {
      for (let sampleY = 0; sampleY < this.sampleAmount; sampleY++) {
        let input0 = map(sampleX, 0, this.sampleAmount - 1, this.inputRange[0][0], this.inputRange[0][1]);
        let input1 = map(sampleY, 0, this.sampleAmount - 1, this.inputRange[1][0], this.inputRange[1][1]);
        let output = this.net.propogate(new Matrix2([[input0], [input1]]));

        // tell all objects to update their output based on the samples
        for (let obj of this.objects) obj.updateSample(sampleX, sampleY);
      }
    }

    // Update all obj pixels
    for (let obj of this.objects) obj.output.updatePixels();
  }
}


class NetIntXYDenseNeuron extends NetIntObject {

  constructor(netInt, x, y, size, layer, index, sampleAmount, inputRange) {
    super(netInt, x, y, size);

    // Initialize variables
    this.layer = layer;
    this.index = index;
    this.sampleAmount = sampleAmount;
    this.inputRange = inputRange;
    this.output = createGraphics(this.sampleAmount, this.sampleAmount);
    this.visibleWeights = [];
  }


  updateSample(sampleX, sampleY) {
    // Update sample pixel based on network (accounting for bias)
    if (this.layer < this.netInt.net.layers.length
      && this.index == this.netInt.net.layers[this.layer].inputShape[1]) var value = 1.0;
    else var value = this.netInt.net.cachedOutputs[this.layer].getVal(this.index, 0);
    let col = lerpColor(color(NetInt.NEGATIVE_COLOR), color(NetInt.POSITIVE_COLOR), value);
    this.output.set(sampleX, sampleY, col);
  }


  showWeights(view) {
    // Show all outbound weights
    for (let weight of this.visibleWeights) {
      let weightVal = this.netInt.net.layers[this.layer].weights.getVal(weight.obj.index, this.index);
      let width = max(map(abs(weightVal), 0, 1, 0.5, this.size * 0.1), 0.5);

      view.getOutput().stroke(weightVal > 0 ? NetInt.POSITIVE_COLOR : NetInt.NEGATIVE_COLOR);
      view.getOutput().strokeWeight(width);
      view.getOutput().line(
        this.pos.x + this.size * 0.5,
        this.pos.y + this.size * 0.5,
        weight.obj.pos.x + weight.obj.size * 0.5,
        weight.obj.pos.y + weight.obj.size * 0.5
      );
    }
  }
}

// #endregion
