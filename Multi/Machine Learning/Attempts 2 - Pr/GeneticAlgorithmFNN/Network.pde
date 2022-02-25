float[][] Propogate(float[][][] wts, float[] inp, boolean hasBias) {
  if ((inp.length != wts[0].length - 1 && hasBias) || (inp.length != wts[0].length && !hasBias)) {
    return null;
  } else {
    float[][] lyrs = new float[wts.length + 1][]; // Setup array for outputs
    float[] cl;
    float[] nl;

    cl = new float[inp.length];
    for (int i = 0; i < inp.length; i++) {  // Set inputs as first layer
      cl[i] = inp[i];
    }

    for (int i = 0; i < wts.length; i++) { // For each weight layer
      if (hasBias) {
        float[] tmpCl = cl;
        cl = new float[tmpCl.length + 1];
        for (int o = 0; o < tmpCl.length; o++) { // Add bias to current layer
          cl[o] = tmpCl[o];
        }
        cl[cl.length - 1] = 1;
      }
      lyrs[i] = cl; // Log current layer

      nl = new float[wts[i][0].length]; // Create empty array for next layer then calculate it
      for (int o = 0; o < wts[i].length; o++) { // For each Neuron
        for (int p = 0; p < wts[i][o].length; p++) { // For each connection
          nl[p] += cl[o] * wts[i][o][p];  // Populate next layer inputs
        }
      }
      for (int o = 0; o < nl.length; o++) { // Run all next layer sums through activation function
        nl[o] = Activation(nl[o]);
      }

      cl = nl; // Move to next layer
    }
    lyrs[lyrs.length - 1] = cl;
    return lyrs;
  }
}


float Activation(float inp) {
  return 1 / (1 + exp(-inp));
}


float[][][] RandomWeights(int[] size, float[] range, boolean hasBias) {
  float[][][] weights = new float[size.length - 1][][];

  for (int i = 0; i < size.length - 1; i++) {
    if (hasBias) {
      weights[i] = new float[size[i] + 1][];
    } else {
      weights[i] = new float[size[i]][];
    }

    for (int o = 0; o < size[i]; o++) {
      weights[i][o] = new float[size[i + 1]];
      for (int p = 0; p < size[i + 1]; p++) {
        weights[i][o][p] = RandomWeight(range);
      }
    }

    if (hasBias) {
      weights[i][weights[i].length - 1] = new float[size[i + 1]];
      for (int p = 0; p < size[i+1]; p++) {
        weights[i][weights[i].length - 1][p] = RandomWeight(range);
      }
    }
  }

  return weights;
}


float RandomWeight(float[] range) {
  float r = random(range[0], range[1]);
  return r;
}
