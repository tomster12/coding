/* https://en.wikipedia.org/wiki/Backpropagation

D = δ;
S = σ;

res = [trainingSet[1], out];
res[0] = expected output(s);
res[1] = [[actual output(s)], Array of neuron outputs];
*/




function Train(net, trainingSet) {
  for (let u = 0; u < trainingSet.length; u++) {
    let out = Propogate(net, trainingSet[u][0]);
    for (let i = 0; i < net.length; i++) { // For each layer of weights
      for (let o = 0; o < net[i].length; o++) { // For each neuron
        for (let p = 0; p < net[i][o].length; p++) { // For each weight
          let DreWt = EToWei([trainingSet[u][1], out], net, i, o, p); // Partial derivative of error within respect to this weight
          if (!hasMm) {
            net[i][o][p] += lrnRate * -DreWt; // Change based on learning rate and derivative of error within respect to weight
          } else {
            let DWt = clamp((lrnRate * -DreWt) + (mmRate * netPrevDif[i][o][p]), -1000, 1000);
            net[i][o][p] += DWt; // Change based on learning rate and derivative of error within respect to weight as well as momentum and previous change
            netPrevDif[i][o][p] = DWt;
          }
        }
      }
    }
  }
}


function EToWei(res, net, i, o, p) {
  let Si = res[1][1][i][o]; // Activated output of neuron this weight connects from
  let Dp = EToNeuNet(res, net, i + 1, p); // Partial derivation of error within respect to neuron net this weight connects to
  return Si * Dp;
}


function EToNeuNet(res, net, ly, n) {
  // Get partial derivative of cost function to neuron out
  let pdToOut = EToNeuOut(res, net, ly, n);
  let pdToIn = sDerivative(res[1][1][ly][n]);
  return pdToOut * pdToIn;
}




function EToNeuOut(res, net, ly, n) {
  if (ly == res[1][1].length - 1) { // If neuron is an output then the partial derivative is the partial derivative of cost function
    return (res[1][0][0] - res[0][0]);
  } else {
    let sum = 0;
    for (let l = 0; l < net[ly][n].length; l++) { // Sum of weighted partial derivatives of connected neurons nets in next layer
      Dl = EToNeuNet(res, net, ly + 1, l)
      WTpl = net[ly][n][l];
      sum += WTpl * Dl;
    }
    return sum;
  }
}


function Check(net) {
  let tot = 0;
  for (let u = 0; u < trainingSet.length; u++) {
    let out = Propogate(net, trainingSet[u][0]);
    let err = 0.5 * pow(out[0][0] - trainingSet[u][1][0], 2);
    tot += err;
    console.log(trainingSet[u] + " : " + out[0][0]);
  }
  return tot / trainingSet.length;
}


function blankNet(net) {
  let netPrevDif = [];
  for (let i = 0; i < net.length; i++) {
    netPrevDif.push([]);
    for (let o = 0; o < net[i].length; o++) {
      netPrevDif[i].push([]);
      for (let p = 0; p < net[i][o].length; p++) {
        netPrevDif[i][o].push(0);
      }
    }
  }
  return netPrevDif;
}


function clamp(val, min, max) {
  return val > max ? max : val < min ? min : val;
}


function sDerivative(inp) {
  return ((inp) * (1 - (inp)));
}
