

class NetDrawer {

  Network net;
  PVector pos;
  PVector size;
  float neuronSize;

  ArrayList<ArrayList<Float>> neuronPositions;
  int neuronLayers;


  NetDrawer(Network net_, PVector pos_, PVector size_, float neuronSize_) {
    net = net_;
    pos = pos_;
    size = size_;
    neuronSize = neuronSize_;

    neuronPositions = new ArrayList<ArrayList<Float>>();
    neuronLayers = 0;
    updateNetwork();
  }


  void updateNetwork() {
    neuronPositions.clear();
    neuronLayers = 0;
    for (int i = 0; i < net.neuronOrder.size(); i++) {
      neuronPositions.add(new ArrayList<Float>());
      if (net.neuronOrder.get(i).size() > 0) neuronLayers++;
      for (int o = 0; o < net.neuronOrder.get(i).size(); o++) {
        int s = net.neuronOrder.get(i).size();
        float sp = (float)1 / (s + 1);
        float v = (o + 1) * sp;
        neuronPositions.get(i).add(v);
      }
    }
  }


  void drawNetwork() {
    stroke(0);
    fill(150);
    textAlign(CENTER);
    textSize(neuronSize);
    for (int i = 0; i < net.neuronOrder.size(); i++) {
      for (int o = 0; o < net.neuronOrder.get(i).size(); o++) {
        PVector pos = getPosFromVals(i, neuronPositions.get(i).get(o));
        ellipse(pos.x, pos.y, neuronSize, neuronSize);
        text(net.neuronOrder.get(i).get(o), pos.x, pos.y - neuronSize * 0.5);
        text(i, pos.x, pos.y + neuronSize * 0.5);
      }
    }

    for (int i = 0; i < net.connections.size(); i++) {
      Connection c = net.connections.get(i);
      if (c.enabled) {
        stroke(0);
      } else {
        stroke(0, 100);
      }

      float[] posInfo1 = getPosInfoFromNInno(c.nIn);
      PVector p1 = getPosFromVals((int)posInfo1[0], posInfo1[1]);
      float[] posInfo2 = getPosInfoFromNInno(c.nOut);
      PVector p2 = getPosFromVals((int)posInfo2[0], posInfo2[1]);

      line(p1.x, p1.y, p2.x, p2.y);
      ellipse(p2.x, p2.y, neuronSize * 0.2, neuronSize * 0.2);
    }
  }


  PVector getPosFromVals(int layer, float val) {
    float pX = pos.x + neuronSize / 2 + layer * (size.x - neuronSize) / (neuronLayers - 1);
    float pY = pos.y + neuronSize / 2 + val * (size.y - neuronSize);
    return new PVector(pX, pY);
  }


  float[] getPosInfoFromNInno(int nInno) {
    for (int i = 0; i < net.neuronOrder.size(); i++) {
      for (int o = 0; o < net.neuronOrder.get(i).size(); o++) {
        if (net.neuronOrder.get(i).get(o) == nInno) {
          return new float[] {i, neuronPositions.get(i).get(o)};
        }
      }
    }
    return null;
  }
}
