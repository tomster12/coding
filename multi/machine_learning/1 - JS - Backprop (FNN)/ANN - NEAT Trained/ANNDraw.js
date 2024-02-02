function DrawNetwork(net, pos, nSize, spaceX, spaceY) {
  net.UpdateLayers();
  textAlign(CENTER);

  let ls = [];
  for (let i = 0; i < net.layers.length; i++) { // Layer sizes
    ls.push(net.layers[i].length);
  }

  for (let i = 0; i < net.connections.length; i++) { // Draw each connection
    if (net.connections[i].enabled) {
      fill(150);
      stroke(100);
      let pos1 = DrawNetworkGetNeuronPos(ls, pos, spaceX, spaceY, net.neurons[net.connections[i].nIn]);
      let pos2 = DrawNetworkGetNeuronPos(ls, pos, spaceX, spaceY, net.neurons[net.connections[i].nOut]);
      line(pos1.x, pos1.y, pos2.x, pos2.y);

      fill(100); // Label each connection
      noStroke();
      pos3 = pos1.copy();
      pos3.add((pos2.copy().sub(pos1)).setMag(1).mult(20));
      text(net.connections[i].inNo, pos3.x, pos3.y);
    }
  }

  for (let i = 0; i < net.neurons.length; i++) { // Draw each neuron
    fill(150);
    stroke(100);
    let pos1 = DrawNetworkGetNeuronPos(ls, pos, spaceX, spaceY, net.neurons[i]);
    ellipse(pos1.x, pos1.y, nSize);

    fill(100); // Label each neuron
    noStroke();
    pos3 = pos1.copy();
    pos3.y += nSize * 0.25;
    text(i, pos3.x, pos3.y);
  }
}


function DrawNetworkGetNeuronPos(ls, pos, spaceX, spaceY, nr) { // Get pos based on layer and variables
  let cls = ls[nr.layerNo];
  let mls = 0;
  for (let i = 0; i < ls.length; i++) {if (ls[i] > mls) {mls = ls[i];}}

  let px = pos.x + nr.layerNo * spaceX;
  let py = pos.y + ((mls * spaceY) / 2) - ((cls * spaceY) / 2) + net.layers[nr.layerNo].indexOf(nr) * spaceY;
  return createVector(px, py);
}
