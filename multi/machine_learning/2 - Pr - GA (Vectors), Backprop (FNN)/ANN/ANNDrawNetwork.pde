void DrawNetwork(network net, PVector pos, float nSize, PVector space, float[] weightRange) {
  textAlign(CENTER);
  fill(150);

  for (int i = 0; i < net.connections.size(); i++) {
    if (net.connections.get(i).enabled) {
      connection cn = net.connections.get(i);
      PVector pos1 = DrawNetworkGetNeuronPos(net, pos, space, cn.nInInno);
      PVector pos2 = DrawNetworkGetNeuronPos(net, pos, space, cn.nOutInno);
      if (cn.weight < 0) {
        stroke(200, 100, 0);
      } else {
        stroke(0, 0, 0);
      }
      strokeWeight(map(abs(cn.weight), 0, net.weightRange[1], weightRange[0], weightRange[1]));
      line(pos1.x, pos1.y, pos2.x, pos2.y);
    }
  }

  for (int i = 0; i < net.neurons.size(); i++) {
    PVector pos1 = DrawNetworkGetNeuronPos(net, pos, space, net.neurons.get(i).nInno);
    strokeWeight(1);
    stroke(100);
    fill(150);
    ellipse(pos1.x, pos1.y, nSize, nSize);
    noStroke();
    fill(0);
    text(net.neurons.get(i).nInno, pos1.x, pos1.y + nSize * 0.2);
  }
}


PVector DrawNetworkGetNeuronPos(network net, PVector pos, PVector space, int nInno) { // Get pos based on layer and variable
  int layer = 0;
  int nN = 0;
  for (int i = 0; i < net.layers.size(); i++) { // Get layer and potential neuron y pos
    for (int o = 0; o < net.layers.get(i).size(); o++) {
      if (net.layers.get(i).get(o).nInno == nInno) {
        layer = i;
        nN = o;
        break;
      }
    }
  }
  float pX = pos.x + layer * space.x;
  float pY = pos.y + nN * space.y;
  if (layer != 0) {
    float pyAv = 0;
    int pyAvTot = 0;
    for (int i = 0; i < net.connections.size(); i++) { // Set y pos to average of incoming connection start neuron position
      connection cn = net.connections.get(i);
      if (cn.nOutInno == nInno) {
        pyAv += DrawNetworkGetNeuronPos(net, pos, space, cn.nInInno).y;
        pyAvTot++;
      }
    }
    pyAv /= pyAvTot;
    pY = pyAv;
  }
  return new PVector(pX, pY);
}
