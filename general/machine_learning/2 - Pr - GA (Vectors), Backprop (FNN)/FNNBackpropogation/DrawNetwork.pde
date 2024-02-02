void DrawNetwork(float[][][] wts, PVector pos, float nSize, PVector space, float[] weight) {
  textAlign(CENTER);
  fill(150);

  int[] ls;
  ls = new int[wts.length + 1];
  for (int i = 0; i < wts.length; i++) { // Get the layer sizes
    ls[i] = wts[i].length;
    if (hasBias) {
      ls[i]--; 
    }
  }
  ls[ls.length - 1] = wts[wts.length - 1][0].length;

  for (int i = 0; i < wts.length; i++) { // Each layer
    for (int o = 0; o < wts[i].length; o++) { // Each neuron
      for (int p = 0; p < wts[i][o].length; p++) { // Each next neuron
        PVector pos1 = DrawNetworkGetNeuronPos(ls, pos, space, new int[] {i, o});
        PVector pos2 = DrawNetworkGetNeuronPos(ls, pos, space, new int[] {i + 1, p}); // Draw connections
        if (wts[i][o][p] < 0) {
          stroke(200, 100, 0);
        } else {
          stroke(0, 0, 0);
        }    
        strokeWeight(map(abs(wts[i][o][p]), 0, 1, weight[0], weight[1]));  
        line(pos1.x, pos1.y, pos2.x, pos2.y);
      }
    }
  }

  stroke(100);
  strokeWeight(1);
  for (int i = 0; i < wts.length; i++) { // Each layer
    if (hasBias) {
      for (int p = 0; p < wts[i].length - 1; p++) { // Each neuron
        PVector pos1 = DrawNetworkGetNeuronPos(ls, pos, space, new int[] {i, p}); // Draw neuron
        ellipse(pos1.x, pos1.y, nSize, nSize);
      }
      PVector pos1 = DrawNetworkGetNeuronPos(ls, pos, space, new int[] {i, wts[i].length - 1}); // Draw bias
      ellipse(pos1.x, pos1.y, nSize * 0.5, nSize * 0.5);
    } else {
      for (int p = 0; p < wts[i].length; p++) { // Each neuron
        PVector pos1 = DrawNetworkGetNeuronPos(ls, pos, space, new int[] {i, p}); // Draw neuron
        ellipse(pos1.x, pos1.y, nSize, nSize);
      }
    }
  }

  for (int p = 0; p < wts[wts.length - 1][0].length; p++) { // Each neuron
    PVector pos1 = DrawNetworkGetNeuronPos(ls, pos, space, new int[] {wts.length, p});
    ellipse(pos1.x, pos1.y, nSize, nSize); // Draw neuron
  }
}


PVector DrawNetworkGetNeuronPos(int[] ls, PVector pos, PVector space, int[] nr) { // Get pos based on layer and variable
  int cls = ls[nr[0]];
  int mls = 0;
  for (int i = 0; i < ls.length; i++) {
    if (ls[i] > mls) {
      mls = ls[i];
    }
  }

  float px = pos.x + nr[0] * space.x;
  float py = pos.y + ((mls * space.y) / 2) - ((cls * space.y) / 2) + nr[1] * space.y;
  return new PVector(px, py);
}
