class network {


  constructor(size_, connected, wtRn_) {
    this.layers = [];
    this.neurons = [];
    this.outputNeurons = [];
    this.connections = [];
    this.nextNeuron = 0;

    this.weightRange = wtRn_;
    this.setupNetwork(size_, connected);
  }


  setupNetwork(size, connected) {
    for (let o = 0; o < size[0]; o++) {
      this.neurons.push(new neuron(this, 0, this.nextNeuron));
      this.nextNeuron++;
    }
    for (let o = 0; o < size[size.length - 1]; o++) {
      let nn = new neuron(this, (size.length - 1), this.nextNeuron);
      this.neurons.push(nn);
      this.outputNeurons.push(nn);
      this.nextNeuron++;
    }
    for (let i = 1; i < size.length - 1; i++) {
      for (let o = 0; o < size[i]; o++) {
        this.neurons.push(new neuron(this, i, this.nextNeuron));
        this.nextNeuron++;
      }
    }
    this.UpdateLayers();
    if (connected) {
      for (let i = 0; i < this.layers.length - 1; i++) {
        for (let o = 0; o < this.layers[i].length; o++) {
          for (let p = 0; p < this.layers[i + 1].length; p++) {
            this.AddConnection(this.layers[i][o].inNo, this.layers[i + 1][p].inNo);
          }
        }
      }
    }
  }


  // -------------------------------------------------------------------------------------------------------


  UpdateLayers() {
    let lyAm = this.neurons.reduce(((acc, v) => (acc < v.layerNo) ? acc = v.layerNo : acc), 0); // Get max layer size
    this.layers = new Array(lyAm + 1).fill().map(v => []);

    for (let i = 0; i < this.neurons.length; i++) {
      this.layers[this.neurons[i].layerNo].push(this.neurons[i]);
    }
  }


  AssignLayers() {
    for (let i = 0; i < this.neurons.length; i++) {
      if (this.neurons[i].layerNo == null) {
        for (let o = 0; o < this.connections.length; o++) {
          if (this.connections[o].nOut == this.neurons[i].inNo) {
            if (this.GetNeuron(this.connections[o].nIn).layerNo != null) {
              this.neurons[i].layerNo = this.GetNeuron(this.connections[o].nIn).layerNo + 1;
            }
          }
        }
      }
    }
    let ml = 0;
    for (let i = 0; i < this.neurons.length; i++) {if (this.neurons[i].layerNo > ml) {ml = this.neurons[i].layerNo;}}
    for (let i = 0; i < this.outputNeurons.length; i++) {
      this.outputNeurons[i].layerNo = ml + 1;
    }
    for (let i = 0; i < this.neurons.length; i++) {
      if (this.neurons[i].inNo >= this.nextNeuron) {
        this.nextNeuron = this.neurons[i].inNo + 1;
      }
    }
  }


  // -------------------------------------------------------------------------------------------------------


  AddConnection(n1, n2, wt) {
    let cn1;
    let cn2;
    let cwt;

    if (n1 == null || n2 == null) { // Random neurons
      let toLoop = true;
      let loopIt = 0;
      while (loopIt < 100 && toLoop) {
        loopIt++;
        cn1 = this.RandomNeuron();
        cn2 = this.RandomNeuron(cn1);
        let inn = this.HasConnection(cn1, cn2); // If a new connection proceed
        if (!inn) {
          toLoop = false;
        }
      }
      if (loopIt == 100) {
        console.log("No free connections");
        return;
      }

    } else { // Predefined neurons
      if (n1 == n2) {
        console.log("Cannot connect to self");
        return;
      }

      let n1h = false;
      let n2h = false;
      for (let i = 0; i < this.neurons.length; i++) {
        if (this.neurons[i].inNo == n1) {
          n1h = true;
        }
        if (this.neurons[i].inNo == n2) {
          n2h = true;
        }
      }
      if (!n1h || !n2h) {
        console.log("Could not find neuron");
        return;
      }

      cn1 = n1;
      cn2 = n2;
      let inn = this.HasConnection(cn1, cn2); // If a new connection proceed
      if (inn) {
        console.log("Already exists");
        return;
      }
    }

    if (wt == null) {
      cwt = this.RandomWeight();
    } else {
      cwt = wt;
    }

    this.connections.push(new connection(this, innovations.NewInnovation(cn1, cn2), cn1, cn2, cwt)); // Add the connection
  }


  ConnectionPropogate(n, inp) {
    for (let i = 0; i < this.connections.length; i++) { // Prop each connection with nIn as provided neuronNo
      if (this.connections[i].nIn == n && this.connections[i].enabled) {
        this.connections[i].Propogate(inp);
      }
    }
  }


  HasConnection(cn1, cn2) {
    for (let i = 0; i < this.connections.length; i++) {
      if (this.connections[i].nIn == cn1 && this.connections[i].nOut == cn2) {
        return true;
      }
    }
    return false;
  }


  HasInNo(inNo) {
    for (let i = 0; i < this.connections.length; i++) {
      if (this.connections[i].inNo == inNo) {
        return true;
      }
    }
    return false;
  }


  GetConnection(nIn, nOut) {
    for (let i = 0; i < this.connections.length; i++) {
      if (this.connections[i].nIn == nIn && this.connections[i].nOut == nOut) {
        return this.connections[i];
      }
    }
  }


  GetConnectionFromInNo(inNo) {
    for (let i = 0; i < this.connections.length; i++) {
      if (this.connections[i].inNo == inNo) {
        return this.connections[i];
      }
    }
  }


  // -------------------------------------------------------------------------------------------------------


  RandomNeuron(prev) {
    while (true) {
      let rand = floor(random(0, this.neurons.length));
      if (rand != prev) {
        return rand;
      }
    }
  }


  AddNeuron(n) {
    if (n == null) {
      return null;

    } else {
      let cn = this.GetConnectionFromInNo(n);

      let nLayer;
      if (this.GetNeuron(cn.nOut).layerNo == this.GetNeuron(cn.nIn).layerNo + 1) { // If next to each other
        nLayer = this.GetNeuron(cn.nOut).layerNo;
        for (let i = 0; i < this.neurons.length; i++) { // Move all other neurons up
          if (this.neurons[i].layerNo >= nLayer) {
            this.neurons[i].layerNo++;
          }
        }

      } else {
        nLayer = this.GetNeuron(cn.nIn).layerNo + 1; // Pick first open layer
      }

      let nNeuron = new neuron(this, nLayer, this.nextNeuron); // Make neuron and connections
      this.neurons.push(nNeuron);
      this.AddConnection(cn.nIn, this.nextNeuron);
      this.AddConnection(this.nextNeuron, cn.nOut);
      cn.enabled = false;
      this.nextNeuron++;
    }
  }


  GetNeuron(n) {
    for (let i = 0; i < this.neurons.length; i++) {
      if (this.neurons[i].inNo == n) {
        return this.neurons[i];
      }
    }
  }


  // -------------------------------------------------------------------------------------------------------


  Propogate(inp) {
    this.UpdateLayers();

    if (inp.length != this.layers[0].length) {
      console.log("Incorrect input size");

    } else {
      for (let i = 0; i < this.neurons.length; i++) { // Clear each neuron
        this.neurons[i].Clear();
      }

      for (let i = 0; i < this.layers[0].length; i++) { // Add inputs
        this.layers[0][i].Input(inp[i]);
      }

      for (let i = 0; i < this.layers.length; i++) {
        for (let o = 0; o < this.layers[i].length; o++) { // Prop each neuron
          this.layers[i][o].Activate();
          console.log("Layer: " + i + ", Neuron: " + o + ", Output: " + this.layers[i][o].propOut);
          this.ConnectionPropogate(this.layers[i][o].inNo, this.layers[i][o].propOut);
        }
      }

      let outputs = [];
      for (let i = 0; i < this.layers[this.layers.length - 1].length; i++) { // Get out of last layer
        outputs.push(this.layers[this.layers.length - 1][i].propOut);
      }
      return outputs;
    }
  }


  // -------------------------------------------------------------------------------------------------------


  RandomWeight() {
    return random(-this.weightRange, this.weightRange);
  }


  // -------------------------------------------------------------------------------------------------------


  Mutate() {
    let r = random();
    if (r < 0.8) {

    } else if (r < 0.9) {

    }
  }
}


// -------------------------------------------------------------------------------------------------------
