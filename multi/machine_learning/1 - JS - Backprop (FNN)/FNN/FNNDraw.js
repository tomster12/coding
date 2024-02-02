function DrawNetwork(wts, pos, nSize, spaceX, spaceY) {
  textAlign(CENTER);
  fill(150);

  let ls = [];
  for (let i = 0; i < wts.length; i++) { // Layer sizes
    ls.push(wts[i].length);
  }
  if (bias) { ls.push(wts[wts.length - 1][0].length + 1);
  } else { ls.push(wts[wts.length - 1][0].length);}

  for (let i = 0; i < wts.length; i++) { // Each layer
    for (let o = 0; o < wts[i].length; o++) { // Each neuron
      for (let p = 0; p < wts[i][o].length; p++) { // Each next neuron
        let pos1 = DrawNetworkGetNeuronPos(ls, pos, spaceX, spaceY, [i, o]);
        let pos2 = DrawNetworkGetNeuronPos(ls, pos, spaceX, spaceY, [i + 1, p]);
        if (wts[i][o][p] < 0) {stroke(200, 100, 0);} else {stroke(0, 0, 0);}
        strokeWeight(map(abs(wts[i][o][p]), 0, 1, 0.5, 2));
        line(pos1.x, pos1.y, pos2.x, pos2.y);
      }
    }
  }

  stroke(100);
  strokeWeight(1);
  for (let i = 0; i < wts.length; i++) { // Each layer
    if (bias) {
      for (let p = 0; p < wts[i].length - 1; p++) { // Each neuron
        let pos1 = DrawNetworkGetNeuronPos(ls, pos, spaceX, spaceY, [i, p]);
        ellipse(pos1.x, pos1.y, nSize);
      }
      let pos1 = DrawNetworkGetNeuronPos(ls, pos, spaceX, spaceY, [i, wts[i].length - 1]);
      ellipse(pos1.x, pos1.y, nSize * 0.5);
    } else {
      for (let p = 0; p < wts[i].length; p++) { // Each neuron
        let pos1 = DrawNetworkGetNeuronPos(ls, pos, spaceX, spaceY, [i, p]);
        ellipse(pos1.x, pos1.y, nSize);
      }
    }
  }

  for (let p = 0; p < wts[wts.length - 1][0].length; p++) { // Each neuron
    let pos1 = DrawNetworkGetNeuronPos(ls, pos, spaceX, spaceY, [wts.length, p]);
    ellipse(pos1.x, pos1.y, nSize);
  }
}


function DrawNetworkGetNeuronPos(ls, pos, spaceX, spaceY, nr) { // Get pos based on layer and variables
  let cls = ls[nr[0]];
  let mls = 0;
  for (let i = 0; i < ls.length; i++) {if (ls[i] > mls) {mls = ls[i];}}

  let px = pos.x + nr[0] * spaceX;
  let py = pos.y + ((mls * spaceY) / 2) - ((cls * spaceY) / 2) + nr[1] * spaceY;
  return createVector(px, py);
}
