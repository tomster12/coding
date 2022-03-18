function Propogate(wts, inp) {
  if ((inp.length != wts[0].length - 1 && hasBias) || (inp.length != wts[0].length && !hasBias)) {
    return null;

  } else {
    let lyrs = []; // Setup array for outputs
    let cl = inp.slice(); // Set inputs as first layer
    if (hasBias) {cl.push(1);} // Add bias to first layer
    let nl;

    lyrs.push(cl);
    for (let i = 0; i < wts.length; i++) { // For each weight layer
      nl = new Array(wts[i][0].length).fill(0); // Create empty array for next layer
      for (let o = 0; o < wts[i].length; o++) { // For each Neuron
        for (let p = 0; p < wts[i][o].length; p++) { // For each connection
          nl[p] += cl[o] * wts[i][o][p];  // Populate next layer inputs
        }
      }

      for (let i = 0; i < nl.length; i++) { // Run all next layer sums through activation function
        nl[i] = Sigmoid(nl[i]);
      }
      if (i != wts.length - 1 && hasBias) { // Add bias to next later
        nl.push(1);
      }

      cl = nl; // Move to next layer
      lyrs.push(cl);
    }
    return [cl, lyrs];
  }
}


function Sigmoid(inp) { // Activation function
  return 1 / (1 + exp(-inp));
}


function RandomWeights(size, range) {
  let weights = [];
  for (let i = 0; i < size.length - 1; i++) {
    weights.push([]);
    for (let o = 0; o < size[i]; o++) {
      weights[i].push([]);
      for (let p = 0; p < size[i+1]; p++) {
        weights[i][o].push(RandomWeight(range));
      }
    }
    if (hasBias) {
      weights[i].push([]);
      for (let p = 0; p < size[i+1]; p++) {
        weights[i][weights[i].length - 1].push(RandomWeight(range));
      }
    }
  }
  return weights;
}


function RandomWeight(range) {
  let r = random(range[0], range[1]);
  return r;
}
