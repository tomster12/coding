class network {


  ArrayList<ArrayList<neuron>> layers;
  ArrayList<neuron> neurons;
  ArrayList<connection> connections;

  float[] weightRange;
  int nextNeuronInno;


  //--------------------------------------------------------------


  network(int[] size_, boolean setup, boolean connected) {
    layers = new ArrayList<ArrayList<neuron>>();
    neurons = new ArrayList<neuron>();
    connections = new ArrayList<connection>();
    weightRange = new float[] {-3, 3};

    if (setup) {
      setupNetwork(size_, connected);
    }
  }




  void setupNetwork(int[] size, boolean connected) {
    for (int o = 0; o < size.length; o++) {
      for (int i = 0; i < size[o]; i++) {
        neurons.add(new neuron(nextNeuronInno, o, this));
        nextNeuronInno++;
      }
    }
    updateLayers();

    if (connected) {
      for (int i = 0; i < layers.size() - 1; i++) {
        for (int o = 0; o < layers.get(i).size(); o++) {
          for (int p = 0; p < layers.get(i + 1).size(); p++) {
            addConnection(layers.get(i).get(o).nInno, layers.get(i + 1).get(p).nInno);
          }
        }
      }
    }
  }


  //--------------------------------------------------------------


  float[] propogate(float[] inputs) {
    for (int i = 0; i < neurons.size(); i++) {
      neurons.get(i).clear(); 
    }
    
    if (inputs.length != layers.get(0).size()) {
      print("Incorrect input size");
      return null;
    }

    for (int i = 0; i < layers.get(0).size(); i++) {
      layers.get(0).get(i).input(inputs[i]);
    }

    for (int i = 0; i < layers.size(); i++) {
      if (i > 0) {
        for (int o = 0; o < layers.get(i).size(); o++) {
          layers.get(i).get(o).activate();
        }
      }
      for (int o = 0; o < layers.get(i).size(); o++) {
        layers.get(i).get(o).propogate();
      }
    }

    float[] outputs = new float[layers.get(layers.size() - 1).size()];
    for (int i = 0; i < layers.get(layers.size() - 1).size(); i++) {
      outputs[i] = layers.get(layers.size() - 1).get(i).propTot;
    }
    return outputs;
  }




  void propogateConnection(int nInno, float val) {
    for (int i = 0; i < connections.size(); i++) {
      if (connections.get(i).nInInno == nInno) {
        connections.get(i).propogate(val);
      }
    }
  }




  void propogateInput(int nInno, float val) {
    getNeuron(nInno).input(val);
  }


  //--------------------------------------------------------------


  void updateLayers() { // Setup layer array
    int mls = 0;
    for (int i = 0; i < neurons.size(); i++) {
      if (neurons.get(i).layer > mls) {
        mls = neurons.get(i).layer;
      }
    }

    layers = new ArrayList<ArrayList<neuron>>();
    for (int i = 0; i < mls + 1; i++) {
      layers.add(new ArrayList<neuron>());
    }

    for (int i = 0; i < neurons.size(); i++) {
      layers.get(neurons.get(i).layer).add(neurons.get(i));
    }
  }


  //--------------------------------------------------------------


  connection getConnection(int nInInno, int nOutInno) { // Get connection between 2 neurons
    for (int i = 0; i < connections.size(); i++) {
      if (connections.get(i).nInInno == nInInno && connections.get(i).nOutInno == nOutInno) {
        return connections.get(i);
      }
    }
    return null;
  }




  connection getConnection(int inno) { // Get connection with innovation
    for (int i = 0; i < connections.size(); i++) {
      if (connections.get(i).inno == inno) {
        return connections.get(i);
      }
    }
    return null;
  }




  connection getConnection() { // Get random connection
    print("\nConnections: " + connections.size());
    int pick = floor(random(0, connections.size()));
    return connections.get(pick);
  }




  void addConnection(int nInInno, int nOutInno) { // Add connection between 2 points
    connection nCn = new connection(innoManager.getInno(nInInno, nOutInno), this);
    connections.add(nCn);
  }




  void addConnection() { // Add random connection
    int loop = 0;
    while (loop < loopLimit) {
      loop++;
      neuron nIn = getNeuronRandom(); // Pick random start
      neuron nOut = getNeuronRandom(nIn.nInno); // Pick random neuron in layer after first
      if (nOut != null) {
        if (getConnection(nIn.nInno, nOut.nInno) == null) { // If no connection
          print("\nAdded connection: " + nIn.nInno + " : " + nOut.nInno);
          connections.add(new connection(innoManager.getInno(nIn.nInno, nOut.nInno), this)); // Add connection
          return;
        } else {
          print("\nCannot make connection - already"); // Already a connection 
        }
      } else {
        print("\nCannot make connection - neurons"); // If no second possible neuron
      }
    }
    print("\nCannot make connection - loop"); // Couldnt no possible connection
  }


  //--------------------------------------------------------------


  neuron getNeuron(int nInno) { // Get neuron with inno
    for (int i = 0; i < neurons.size(); i++) {
      if (neurons.get(i).nInno == nInno) {
        return neurons.get(i);
      }
    }
    return null;
  }




  neuron getNeuronRandom(int nInno) { // Get random neuron after nInno
    neuron n = getNeuron(nInno);
    ArrayList<neuron> possibleNeurons = new ArrayList<neuron>();
    for (int i = 0; i < neurons.size(); i++) { // Get possible neurons
      if (neurons.get(i).layer > n.layer) {
        possibleNeurons.add(neurons.get(i));
      }
    }
    if (possibleNeurons.size() == 0) {
      return null;
    }
    int pick = floor(random(possibleNeurons.size())); // Pick random one
    return possibleNeurons.get(pick);
  }




  neuron getNeuronRandom() { // Get random neuron
    int pick = floor(random(neurons.size()));
    return neurons.get(pick);
  }




  void addNeuron(connection cn) { // Add neuron on connection
    neuron prevN = getNeuron(cn.nInInno);
    neuron nextN = getNeuron(cn.nOutInno);

    if (nextN.layer == prevN.layer + 1) { // If no space add space
      for (int i = 0; i < neurons.size(); i++) {
        if (neurons.get(i).layer > prevN.layer) {
          neurons.get(i).layer++;
        }
      }
    }
   
    neuron nN = new neuron(nextNeuronInno, prevN.layer + 1, this); // Make neuron
    nextNeuronInno++;
    neurons.add(nN);

    cn.enabled = false;
    connections.add(new connection(innoManager.getInno(prevN.nInno, nN.nInno), this)); // Add connections
    connections.add(new connection(innoManager.getInno(nN.nInno, nextN.nInno), this));
    updateLayers();
  }




  void addNeuron() { // Pick random connection and add neuron
    connection cn = getConnection();
    addNeuron(cn);
  }



  //--------------------------------------------------------------
}
