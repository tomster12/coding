

class Network {
  // #region - Setup

  InnoManager innoMng;
  int[] ioSize;
  float[] wRange;
  ArrayList<Neuron> neurons;
  ArrayList<ArrayList<Integer>> neuronOrder;
  ArrayList<Connection> connections;


  Network(InnoManager innoMng_, int[] ioSize_, float[] wRange_) {
    innoMng = innoMng_;
    ioSize = ioSize_;
    wRange = wRange_;
    neurons = new ArrayList<Neuron>();
    neuronOrder = new ArrayList<ArrayList<Integer>>();
    connections = new ArrayList<Connection>();

    setupNetwork();
    updateNeuronOrder();
  }


  void setupNetwork() {
    for (int i = 0, nInno = 0; i < ioSize.length; i++) {
      for (int o = 0; o < ioSize[i]; o++, nInno++) {
        neurons.add(new Neuron(nInno, i * 2));
        neurons.get(neurons.size() - 1).propLevel = i;
      }
    }
  }

  // #endregion


  // #region - Mutation

  void mutate() {
    float mc = 1;
    float mnc = 0.2;
    float mcc = 0.3;
    float mwc = 0.5;
    boolean mutated = false;
    float r1 = random(1);

    if (r1 < mc) {
      while (!mutated) {
        float r2 = random(1);

        if (r2 < mnc) {
          mutated = mutateNeuron();
        } else if (r2 < mnc + mcc) {
          mutated = mutateConnection();
        } else if (r2 < mnc + mcc + mwc) {
          mutated = mutateWeight();
        }
      }
      updateNeuronOrder();
    }
  }


  boolean mutateNeuron() {
    boolean mutated = false;
    if (connections.size() > 0) {
      int r = floor(random(connections.size()));
      Connection c = connections.get(r);
      if (c.enabled) {
        int nInno = innoMng.getNeuronInno(c.cInno);
        connections.get(r).enabled = false;

        addConnection(c.nIn, nInno, random(wRange[0], wRange[1]), true);
        addConnection(nInno, c.nOut, random(wRange[0], wRange[1]), true);
        addNeuron(nInno, 1);
        mutated = true;
      }
    }
    return mutated;
  }


  boolean mutateConnection() {
    boolean mutated = false;
    if (neurons.size() > 1) {
      Neuron n1 = neurons.get(floor(random(neurons.size())));
      Neuron n2 = neurons.get(floor(random(neurons.size())));
      int n1i = n1.nInno;
      int n2i = n2.nInno;
      boolean getN1 = true;
      boolean getN2 = true;
      while (getN1) {
        n1 = neurons.get(floor(random(neurons.size())));
        n1i = n1.nInno;
        getN1 = n1.type == 2;
      }
      while (getN2) {
        n2 = neurons.get(floor(random(neurons.size())));
        n2i = n2.nInno;
        getN2 = n1.propLevel >= n2.propLevel;
      }

      int cInno = innoMng.getConnectionInno(n1i, n2i);
      int oCInno = innoMng.getConnectionInno(n2i, n1i);
      if (!hasCInno(connections, cInno) && !hasCInno(connections, oCInno)) {
        addConnection(n1i, n2i, random(wRange[0], wRange[1]), true);
        mutated = true;
      }
    }
    return mutated;
  }


  boolean mutateWeight() {
    boolean mutated = false;
    if (connections.size() > 0) {
      int r = floor(random(connections.size()));
      connections.get(r).weight = random(wRange[0], wRange[1]);
      mutated = true;
    }
    return mutated;
  }

  // #endregion


  // #region - Propogation

  float[] propogate(float[] inputs) {
    if (inputs.length == ioSize[0]) {
      float[] outputs = new float[ioSize[1]];
      ArrayList<float[]> neuronStorage = new ArrayList<float[]>(); // {value, propogated}
      int mNI = 0;

      for (int i = 0; i < neurons.size(); i++) {  // Setup neuron storage
        int cNI = neurons.get(i).nInno;
        mNI = cNI > mNI ? cNI : mNI;
      }
      for (int i = 0; i <= mNI; i++) {
        if (i < ioSize[0]) {
          neuronStorage.add(new float[] {inputs[i], 0});
        } else {
          neuronStorage.add(new float[] {0, 0});
        }
      }

      for (int i = 0; i < neuronOrder.size(); i++) { // For each neuron, activate or output
        for (int o = 0; o < neuronOrder.get(i).size(); o++) {
          int nInno = neuronOrder.get(i).get(o);
          if (nInno >= ioSize[0]) {
            neuronStorage.get(nInno)[0] = sigmoid(neuronStorage.get(nInno)[0]);
          }
          if (nInno >= ioSize[0] && nInno < ioSize[0] + ioSize[1]) {
            if (neuronStorage.get(nInno)[1] == 1) {
              outputs[nInno - ioSize[0]] = neuronStorage.get(nInno)[0];
            }
          }

          for (int p = 0; p < connections.size(); p++) {// For each connection propogate
            Connection c = connections.get(p);
            if (c.nIn == nInno && c.enabled) {
              float wIn = neuronStorage.get(c.nIn)[0] * c.weight;
              neuronStorage.get(c.nOut)[0] += wIn;
              neuronStorage.get(c.nOut)[1] = 1;
            }
          }
        }
      }
      return outputs;
    }
    return null;
  }


  void updateNeuronOrder() {
    neuronOrder.clear();
    for (int i = 0; i < neurons.size(); i++) { // Reset prop level
      neurons.get(i).propLevel = 0;
      if (neurons.get(i).type == 2) neurons.get(i).propLevel = 1;
    }
    for (int i = 0; i < ioSize[0]; i++) { // Get correct prop level
      updateNeuronOrderChildren(i, 0);
    }
    int mpl = 0;
    for (int i = 0; i < neurons.size(); i++) { // Get max prop level
      if (neurons.get(i).propLevel > mpl) {
        mpl = neurons.get(i).propLevel;
      }
    }
    for (int i = ioSize[0]; i < ioSize[0] + ioSize[1]; i++) { // Set all outputs to max prop level
      neurons.get(i).propLevel = mpl;
    }

    int lvl = 0;
    while (true) {
      neuronOrder.add(new ArrayList<Integer>());
      boolean found = false;

      for (int i = 0; i < neurons.size(); i++) {
        if (neurons.get(i).propLevel == lvl) {
          neuronOrder.get(lvl).add(neurons.get(i).nInno);
          found = true;
        }
      }

      if (found) {
        lvl++;
        neuronOrder.add(new ArrayList<Integer>());
      } else {
        break;
      }
    }
  }


  void updateNeuronOrderChildren(int nInno, int level) {
    int index = getIndexFromNInno(nInno);
    int curLevel = neurons.get(index).propLevel;
    neurons.get(index).propLevel = level > curLevel ? level : curLevel;

    for (int i = 0; i < connections.size(); i++) {
      if (connections.get(i).nIn == nInno) {
        updateNeuronOrderChildren(connections.get(i).nOut, level + 1);
      }
    }
  }


  int getIndexFromNInno(int nInno) {
    for (int i = 0; i < neurons.size(); i++) {
      if (neurons.get(i).nInno == nInno) {
        return i;
      }
    }
    return -1;
  }

  // #endregion


  // #region - Change

  Network crossover(Network otherNet) {
    ArrayList<Connection> possibleConnections = new ArrayList<Connection>();
    ArrayList<Integer> possibleNeurons = new ArrayList<Integer>();
    Network newNet = new Network(innoMng, ioSize, wRange);

    for (int i = 0; i < connections.size(); i++) {
      possibleConnections.add(connections.get(i));
    }
    for (int i = 0; i < otherNet.connections.size(); i++) {
      Connection c = otherNet.connections.get(i);
      if (!hasCInno(possibleConnections, c.cInno)) {
        possibleConnections.add(c);
      }
    }

    for (int i = 0; i < possibleConnections.size(); i++) {
      Connection c = possibleConnections.get(i);
      if (c.nIn >= ioSize[0]+ioSize[1] && !possibleNeurons.contains(c.nIn)) {
        possibleNeurons.add(c.nIn);
        newNet.addNeuron(c.nIn, 2);
      }
      if (c.nOut >= ioSize[0]+ioSize[1] && !possibleNeurons.contains(c.nOut)) {
        possibleNeurons.add(c.nOut);
        newNet.addNeuron(c.nOut, 2);
      }
      newNet.addConnection(c.nIn, c.nOut, c.weight, c.enabled);
    }

    newNet.updateNeuronOrder();
    return newNet;
  }


  void addConnection(int nIn, int nOut, float weight, boolean enabled) {
    int ncInno = innoMng.getConnectionInno(nIn, nOut);
    Connection nc = new Connection(ncInno, nIn, nOut, weight, enabled);
    connections.add(nc);
  }


  void addNeuron(int nInno, int type) {
    Neuron n = new Neuron(nInno, type);
    neurons.add(n);
  }

  // #endregion


  // #region - Other Functions

  float sigmoid(float val) {
    return 1 / (1 + exp(-val));
  }


  boolean hasCInno(ArrayList<Connection> cns, int cInno) {
    for (int i = 0; i < cns.size(); i++) {
      if (cns.get(i).cInno == cInno) {
        return true;
      }
    }
    return false;
  }


  Connection getCInno(ArrayList<Connection> cns, int cInno) {
    for (int i = 0; i < cns.size(); i++) {
      if (cns.get(i).cInno == cInno) {
        return cns.get(i);
      }
    }
    return null;
  }


  float speciateDistance(Network oNet) {
    float c1 = 0.3;
    float c2 = 0.05;
    float ex = 0;
    float wa = 0;
    float wc = 0;

    int mi = 0;
    for (int i = 0; i < connections.size(); i++) {
      int cCInno = connections.get(i).cInno;
      if (cCInno > mi) {
        mi = cCInno;
      }
    }
    for (int i = 0; i < oNet.connections.size(); i++) {
      int cCInno = oNet.connections.get(i).cInno;
      if (cCInno > mi) {
        mi = cCInno;
      }
    }

    for (int i = 0; i < mi; i++) {
      int ci = i + 1;
      boolean h1 = hasCInno(connections, ci);
      Connection h1c = getCInno(connections, ci);
      boolean h2 = hasCInno(oNet.connections, ci);
      Connection h2c = getCInno(oNet.connections, ci);
      if (h1 && h2) {
        wa += abs(h2c.weight - h1c.weight);
        wc++;
      } else if (h1 || h2) {
        ex++;
      }
    }

    wa  = wc == 0 ? 0 : wa / wc;
    float d = (c1 * ex + c2 * wa);
    return d;
  }


  // #endregion
}


// #region - Other Classes

class Neuron {
  int nInno;
  int propLevel;
  int type;
  Neuron(int nInno_, int type_) {
    nInno = nInno_;
    type = type_;
  }
}


class Connection {
  int cInno;
  int nIn;
  int nOut;
  float weight;
  boolean enabled;
  Connection(int cInno_, int nIn_, int nOut_, float weight_, boolean enabled_) {
    cInno = cInno_;
    nIn = nIn_;
    nOut = nOut_;
    weight = weight_;
    enabled = enabled_;
  }
}

// #endregion
