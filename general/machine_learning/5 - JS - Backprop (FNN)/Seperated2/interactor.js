
class Interactor {

  GAPS = 50;
  GRAPH_SIZE = 300;


  constructor(getValueColor_) {
    // Initialize variables
    this.getValueColor = getValueColor_;
  }


  setNetwork(net_) {
    // Initialize network
    this.net = net_;
    this.netVisualizer = new NetVisualizer(this, this.net);
  }


  setTrainer(trainer, settings) {
    // Set network trainer
    this.trainer = trainer;
    this.trainerSettings = settings;
    this.isTraining = true;
    this.trainerErrorGraph = new Graph();
  }


  addSampler(sampler_) {
    // Initialize samplers
    if (this.samplers == null) {
      this.samplers = [];
      this.currentSampler = 0;
    }

    // Add a new sampler
    sampler_.colorFunc = this.getValueColor;
    this.samplers.push(sampler_);
  }

  changeSampler(dir) {
    // Change the current sampler
    this.currentSampler = (this.currentSampler + this.samplers.length + dir) % this.samplers.length;
  }

  getSampler() {
    // Return the current sampler
    if (this.samplers == null) return null;
    return this.samplers[this.currentSampler];
  }


  draw() {
    this.update();
    this.show();
  }


  update() {
    // Update all parts
    this.handleInput();
    this.updateSampler();
    this.updateNetVisualizer();
    this.updateTrainer();
  }

  handleInput() {
    // Change current sampler
    if (input.keys.clicked[37]) this.changeSampler(-1);
    else if (input.keys.clicked[39]) this.changeSampler(1);
  }

  updateSampler() {
    if (this.samplers != null) {

      // Update the sampler
      this.getSampler().update();
    }
  }

  updateNetVisualizer() {
    if (this.net != null) {

      // Update net netVisualizer and position
      this.netVisualizer.setSize( width - this.GAPS * 3 - this.GRAPH_SIZE, height - this.GAPS * 2 );
      this.netVisualizer.setPos( this.GAPS + this.netVisualizer.size.x * 0.5, height * 0.5 );
      this.netVisualizer.update();
    }
  }

  updateTrainer() {
    if (this.trainer != null) {

      // Update trainer
      if (this.isTraining) {
        let output = this.trainer.train(this.trainerSettings);
        if (this.trainerErrorGraph != null) this.trainerErrorGraph.setValues(output.error);
        if (output.finished) { this.isTraining = false; console.log("Finished!"); }
      }

      // Update error graph position
      this.trainerErrorGraph.setPos(width - this.GAPS - this.GRAPH_SIZE * 0.5, height - this.GAPS - this.GRAPH_SIZE * 0.5);
      this.trainerErrorGraph.setSize(this.GRAPH_SIZE, this.GRAPH_SIZE);
    }
  }


  show() {
    background(230);

    // Show help
    textAlign(CENTER);
    fill(50);
    noStroke();
    textSize(18);
    textAlign(RIGHT, TOP);
    text("left / right: different sampling methods.", width - this.GAPS, this.GAPS);
    text("up / down: different presets.", width - this.GAPS, this.GAPS + 30);

    // Show netVisualizer
    this.netVisualizer.show();

    // Show error graph
    if (this.trainer != null) this.trainerErrorGraph.show();
  }
}


class NetVisualizer {

  constructor(interactor_, net_, pos_, size_) {
    // Initialize variables
    this.interactor = interactor_;
    this.pos = pos_ || { x: 0, y: 0 };
    this.size = size_ || { x: 0, y: 0 };
    this.output = createGraphics(this.size.x, this.size.y);

    // Run network initialization
    this.initNet(net_);
  }


  initNet(net_) {
    // Initialize variables
    this.net = net_;
    this.layerWidth = 60;
    this.layerBorder = 40;
    this.layerNodes = [];

    // Input layer node can be either unknown [+, +, +], dense [1, +, 1], or image [+, +, 1]
    if (this.net.inputShape[2] > 1)
      this.layerNodes.push(new UnknownLayerNode(this, 0, null, this.layerWidth));
    else if (this.net.inputShape[0] > 1)
      this.layerNodes.push(new ImageLayerNode(this, 0));
    else this.layerNodes.push(new DenseLayerNode(this, 0, null, this.layerWidth));

    // Each consequent layer node is based on the net layer
    for (let i = 0; i < this.net.layers.length; i++) {
      if (this.net.layers[i] instanceof Dense)
        this.layerNodes.push(new DenseLayerNode(this, i + 1, null, this.layerWidth));
      else this.layerNodes.push(new UnknownLayerNode(this, i + 1, null, this.layerWidth));
    }
  }


  update() {
    // Update layer nodes
    for (let layer of this.layerNodes) layer.update();
  }


  show() {
    // Show background
    stroke(0);
    fill(223);
    rectMode(CENTER);
    rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

    // Show all layers nodes
    for (let layer of this.layerNodes) layer.showWeights(this.output);
    for (let layer of this.layerNodes) layer.show(this.output);
    imageMode(CENTER);
    image(this.output, this.pos.x, this.pos.y, this.size.x, this.size.y);
  }


  getLayerPos(layer) {
    // Calculate layer position
    return {
      x: this.layerBorder * (layer + 1) + this.layerWidth * (layer + 0.5),
      y: this.layerBorder * 2 + this.layerWidth * 0.5
    }
  }


  setPos(x, y) { this.pos.x = x; this.pos.y = y; }

  setSize(x, y) {
    if (x != this.size.x || y != this.size.y) {
      this.output.remove();
      this.output = createGraphics(x, y);
    }
    this.size.x = x;
    this.size.y = y;
  }

  getSampler() { return this.interactor.getSampler(); }

  getValueColor(value) { return this.interactor.getValueColor(value); }
}

class LayerNode {

  constructor(netVisualizer_, layer_, pos_, width_) {
    this.netVisualizer = netVisualizer_;
    this.layer = layer_;
    this.pos = pos_;
    this.width = width_;
  }


  update() {}

  showWeights(output) {}

  show() {}
}

class UnknownLayerNode extends LayerNode { }

class ImageLayerNode extends LayerNode { }

class DenseLayerNode extends LayerNode {

  constructor(netVisualizer_, layer_, pos_, width_) {
    super(netVisualizer_, layer_, pos_, width_);

    // Initialize variables
    this.layerCount = this.netVisualizer.net.getLayerShape(this.layer)[1];

    this.nodeSize = width_;
    this.nodeBorder = this.nodeSize * 0.25;
    this.biasSize = this.nodeSize * 0.85;
    this.nodes = [];

    this.canDrawWeights = false;
    this.biasNode = null;

    // Initialize neuron nodes
    for (let index = 0; index < this.layerCount; index++) {
      this.nodes.push(new NeuronNode(this, false, this.layer, index));
    }

    // Check if has a previous layer with neuron nodes
    if (this.layer > 0 && this.netVisualizer.layerNodes[this.layer - 1] instanceof DenseLayerNode) {
      this.canDrawWeights = true;
      this.biasNode = new NeuronNode(this, true, this.layer - 1, null);
    }
  }


  update() {
    // Update layer pos
    this.pos = this.netVisualizer.getLayerPos(this.layer);

    // Update all nodes and bias node
    for (let node of this.nodes) node.update();
    if (this.canDrawWeights) this.biasNode.update();
  }


  showWeights(output) {
    // Check if can draw weights
    if (this.canDrawWeights) {
      let prevNode = this.netVisualizer.layerNodes[this.layer - 1];
      let layer = this.netVisualizer.net.layers[this.layer - 1];
      let weights = layer.weights;

      // Loop over each from node (handle bias)
      for (let col = 0; col < weights.cols; col++) {
        if (col < layer.inputShape[1]) var from = prevNode.nodes[col];
        else var from = this.biasNode;

        // Draw weight to each to node
        for (let row = 0; row < weights.rows; row++) {
          let value = weights.getVal(row, col);
          let to = this.nodes[row];
          output.stroke(this.netVisualizer.getValueColor(value));
          output.strokeWeight(1 + abs(value) * 5);
          output.line(from.pos.x, from.pos.y, to.pos.x, to.pos.y);
        }
      }
      output.strokeWeight(1);
    }
  }


  show(output) {
    // Show all nodes and bias node
    for (let node of this.nodes) node.show(output);
    if (this.canDrawWeights) this.biasNode.show(output);
  }


  getNodePos(index, bias) {
    // Get bias node position
    if (bias) {
      let prevNode = this.netVisualizer.layerNodes[this.layer - 1];
      return {
        x: prevNode.nodes[prevNode.nodes.length - 1].pos.x,
        y: prevNode.nodes[prevNode.nodes.length - 1].pos.y + prevNode.nodeSize + prevNode.nodeBorder
      }

    // Get standard node position
    } else {
      return {
        x: this.pos.x,
        y: this.pos.y + index * (this.nodeSize + this.nodeBorder)
      }
    }
  }
}

class NeuronNode {

  constructor(layerNode_, bias_, layer_, index_) {
    // Initialize variables
    this.layerNode = layerNode_;
    this.bias = bias_;
    this.layer = layer_;
    this.index = index_;
  }


  update() {
    // Update position
    this.pos = this.layerNode.getNodePos(this.index, this.bias);
    this.size = this.bias ? this.layerNode.biasSize : this.layerNode.nodeSize;
  }


  show(output) {
    // Show using sampler if has one
    let sampler = this.layerNode.netVisualizer.getSampler();
    if (sampler != null) {
      if (sampler instanceof PresetSampler) this.showPresetSampledNode(output, sampler);
      else if (sampler instanceof XYSampler) this.showXYSampledNode(output, sampler);

    // No sampler in use so use standard
    } else this.showStandardNode(output);
  }


  showPresetSampledNode(output, sampler) {
    // Get cached value
    if (this.bias) var sampled = 1;
    else var sampled = sampler.cachedOutputs[this.layer].getVal(this.index, 0);

    // Draw body as rounded rect with sampled value
    output.stroke(0);
    output.fill(this.layerNode.netVisualizer.getValueColor(sampled));
    output.rectMode(CENTER);
    output.rect(this.pos.x, this.pos.y, this.size, this.size);
  }


  showXYSampledNode(output, sampler) {
    // Draw outline (interior if bias)
    output.stroke(0);
    output.fill(this.layerNode.netVisualizer.getValueColor(1));
    output.rectMode(CENTER);
    output.rect(this.pos.x, this.pos.y, this.size, this.size);

    // Draw interior based on XY samples
    if (!this.bias) {
      output.imageMode(CENTER);
      let toShow = sampler.cachedOutputImages[this.layer][this.index];
      output.image(toShow, this.pos.x, this.pos.y, this.size, this.size);
    }
  }


  showStandardNode(output) {
    // Draw body as rounded rect
    output.stroke(0);
    output.fill(0);
    output.rectMode(CENTER);
    output.rect(this.pos.x, this.pos.y, this.size, this.size);
  }
}


class Sampler {

  constructor(net_) {
    this.net = net_;
  }
}

class PresetSampler extends Sampler {

  constructor(net_) {
    super(net_);

    // Initialize variables
    this.cachedOutputs = null;
    this.presets = [];
    this.currentPreset = 0;
  }


  addPreset(input) {
    // Add a given preset
    this.presets.push(input);
  }


  update() {
    if (input.keys.clicked[38]) this.changePreset(1);
    else if (input.keys.clicked[40]) this.changePreset(-1);

    // Propogate network with current preset input
    let current = this.presets[this.currentPreset];
    this.net.propogate(current);
    this.cachedOutputs = this.net.cachedOutputs;
  }


  changePreset(dir) {
    // Change current preset in direction
    this.currentPreset = (this.currentPreset + this.presets.length + dir) % this.presets.length;
  }
}

class XYSampler extends Sampler {
  constructor(net_, range_, sampleCount_) {
    super(net_);

    if (this.net.inputShape[0] != 1 || this.net.inputShape[1] != 2) {
      console.error("Cannot use XY sampler for input shape " + this.net.inputShape);
      return false;
    }

    // Initialize variables
    this.cachedOutputs = null;
    this.cachedOutputImages = null;
    this.range = range_;
    this.sampleCount = sampleCount_;
    this.colorFunc = v => color(abs(v) * 255);

    // Initialize cached output images
    this.net.propogate(new Matrix2([[0], [0]]));
    this.cachedOutputImages = [];
    for (let layer = 0; layer < this.net.cachedOutputs.length; layer++) {
      this.cachedOutputImages.push([]);
      for (let index = 0; index < this.net.cachedOutputs[layer].rows; index++) {
        this.cachedOutputImages[layer].push(createGraphics(this.sampleCount, this.sampleCount));
      }
    }
  }


  update() {
    // Update samples
    this.cachedOutputs = [];
    for (let sampleX = 0; sampleX < this.sampleCount; sampleX++) {
      this.cachedOutputs.push([]);
      for (let sampleY = 0; sampleY < this.sampleCount; sampleY++) {
        let input0 = map(sampleX, 0, this.sampleCount - 1, this.range[0][0], this.range[0][1]);
        let input1 = map(sampleY, 0, this.sampleCount - 1, this.range[1][1], this.range[1][0]);
        this.net.propogate(new Matrix2([[input0], [input1]]));
        this.cachedOutputs[sampleX].push(this.net.cachedOutputs);

        // Update all images with new sampled value
        for (let layer = 0; layer < this.net.cachedOutputs.length; layer++) {
          for (let index = 0; index < this.net.cachedOutputs[layer].rows; index++) {
            let value = this.cachedOutputs[sampleX][sampleY][layer].getVal(index, 0);

            if (layer > 0) {
              let range = this.net.layers[layer - 1].activation.outputRange;
              value = map(value, range[0], range[1], -1, 1);
            }

            this.cachedOutputImages[layer][index].set(sampleX, sampleY, this.colorFunc(value));
          }
        }
      }
    }

    // Update image pixels
    for (let layer = 0; layer < this.net.cachedOutputs.length; layer++) {
      for (let index = 0; index < this.net.cachedOutputs[layer].rows; index++) {
        this.cachedOutputImages[layer][index].updatePixels();
      }
    }
  }
}
