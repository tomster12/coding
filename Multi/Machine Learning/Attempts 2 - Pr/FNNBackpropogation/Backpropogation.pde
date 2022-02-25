///* https://en.wikipedia.org/wiki/Backpropagation

//D = δ;
//S = σ;

//*/




void Train(float[][][] net, float[][][] trainingSet) {
  for (int u = 0; u < trainingSet.length; u++) {
    float[][] out = Propogate(net, trainingSet[u][0]);
    for (int i = 0; i < net.length; i++) { // For each layer of weights
      for (int o = 0; o < net[i].length; o++) { // For each neuron
        for (int p = 0; p < net[i][o].length; p++) { // For each weight
          float DreWt = EToWei(trainingSet[u][1], out, net, i, o, p); // Partial derivative of error within respect to this weight
          if (!hasMm) {
            net[i][o][p] += lrnRate * -DreWt; // Change based on learning rate and derivative of error within respect to weight
          } else {
            float DWt = clamp((lrnRate * -DreWt) + (mmRate * netPrevDif[i][o][p]), -1000, 1000);
            net[i][o][p] += DWt; // Change based on learning rate and derivative of error within respect to weight as well as momentum and previous change
            netPrevDif[i][o][p] = DWt;
          }
        }
      }
    }
  }
}


float EToWei(float[] ts, float[][] out, float [][][] net, int i, int o, int p) {
  float Si = out[i][o]; // Activated output of neuron this weight connects from
  float Dp = EToNeuNet(ts, out, net, i + 1, p); // Partial derivation of error within respect to neuron net this weight connects to
  return Si * Dp;
}


float EToNeuNet(float[] ts, float[][] out, float[][][] net, int ly, int n) {
  return EToNeuOut(ts, out, net, ly, n) * aDerivative(out[ly][n]); // Get partial derivative of cost function to neuron out
}




float EToNeuOut(float[] ts, float[][] out, float[][][] net, int ly, int n) {
  if (ly == out.length - 1) { // If neuron is an output then the partial derivative is the partial derivative of cost function
    return (out[out.length - 1][n] - ts[n]);
  } else {
    float sum = 0;
    for (int l = 0; l < net[ly][n].length; l++) { // Sum of weighted partial derivatives of connected neurons nets in next layer
      float Dl = EToNeuNet(ts, out, net, ly + 1, l);
      float WTpl = net[ly][n][l];
      sum += WTpl * Dl;
    }
    return sum;
  }
}


float Check(float[][][] net, float[][][] trainingSet) {
  float tot = 0;
  for (int u = 0; u < trainingSet.length; u++) {
    float[][] out = Propogate(net, trainingSet[u][0]);
    float err = 0.5 * pow(out[out.length - 1][0] - trainingSet[u][1][0], 2);
    tot += err;

    print("\nPrediction: ");
    for (int i = 0; i < trainingSet[u][0].length; i++) {
      if (i > 0) {print(", ");};
      print(trainingSet[u][0][i]);
    }
    print(" : ");
    for (int i = 0; i < out[out.length - 1].length; i++) {
      if (i > 0) {print(", ");};
      print(out[out.length - 1][i]);
    }
  }
  return tot / trainingSet.length;
}


void Guess(float[][][] net, float[][] trainingSet) {
  for (int u = 0; u < trainingSet.length; u++) {
    float[][] out = Propogate(net, trainingSet[u]);
        print("\nGuess: ");
    for (int i = 0; i < trainingSet[u].length; i++) {
      if (i > 0) {print(", ");};
      print(trainingSet[u][i]);
    }
    print(" : ");
    for (int i = 0; i < out[out.length - 1].length; i++) {
      if (i > 0) {print(", ");};
      print(out[out.length - 1][i]);
    }
  }
}


float[][][] blankNet(float [][][] net) {
  float[][][] netPrevDif = new float[net.length][][];
  for (int i = 0; i < net.length; i++) {
    netPrevDif[i] = new float[net[i].length][];
    for (int o = 0; o < net[i].length; o++) {
      netPrevDif[i][o] = new float[net[i][o].length];
      for (int p = 0; p < net[i][o].length; p++) {
        netPrevDif[i][o][p] = 0;
      }
    }
  }
  return netPrevDif;
}


float clamp(float val, float min, float max) {
  return val > max ? max : val < min ? min : val;
}


float  aDerivative(float inp) {
  return ((inp) * (1 - (inp)));
}
