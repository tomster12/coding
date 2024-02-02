function RandomDataSet(dataAmount, dataRange) {
  return new network([2, 1], true, dataRange);
}


// ---------------------------------------------------------------------


function MakeChild(p1, p2) {
  data = Crossover(p1.data, p2.data);
  return new unitData(null, data, 0);
}


// ---------------------------------------------------------------------


function Crossover(p1, p2) {
  let child = new network([io[0], io[1]], false);
  let maxInNo = 0;
  for (let i = 0; i < p1.connections.length; i++) {if (p1.connections[i].inNo > maxInNo) {maxInNo = p1.connections[i].inNo;}}
  for (let i = 0; i < p2.connections.length; i++) {if (p2.connections[i].inNo > maxInNo) {maxInNo = p2.connections[i].inNo;}}

  let connections = [];
  for (let i = 0; i <= maxInNo; i++) {
    if (p1.HasInNo(i) || p2.HasInNo(i)) {
      let nn = innovations.GetInnovation(i);
      connections.push(nn);
      if (p1.HasInNo(i) && p2.HasInNo(i)) {
        if (p1.fitness > p2.fitness || ((p1.fitness == p2.fitness) && (random() < 0.5))) { // Take in every connection, if both have it 50% chance
          if (p1.HasInNo(i)) {
            child.AddConnection(nn[0], nn[1], p1.GetConnectionFromInNo(i).weight);
          }
        } else {
          if (p2.HasInNo(i)) {
            child.AddConnection(nn[0], nn[1], p2.GetConnectionFromInNo(i).weight);
          }
        }
      } else {
        if (p1.HasInNo(i)) {
          child.AddConnection(nn[0], nn[1], p1.GetConnectionFromInNo(i).weight);
        }
        if (p2.HasInNo(i)) {
          child.AddConnection(nn[0], nn[1], p2.GetConnectionFromInNo(i).weight);
        }
      }
    }
  }

  let neurons = [];
  for (let i = 0; i < connections.length; i++) {
    let d1 = true;
    let d2 = true;
    for (let o = 0; o < neurons.length; o++) {
      if (connections[i][0] == neurons[o]) {
        d1 = false;
      }
      if (connections[i][1] == neurons[o]) {
        d2 = false;
      }
    }
    if (d1) {
      neurons.push(connections[i][0]);
    }
    if (d2) {
      neurons.push(connections[i][1]);
    }
  }
  for (let i = 0; i < (io[0] + io[1]); i++) {
    for (let o = 0; o < neurons.length; o++) {
      if (neurons[o] == i) {
        neurons.splice(o, 1);
        o--;
      }
    }
  }
  for (let i = 0; i < neurons.length; i++) {
    child.neurons.push(new neuron(child, null, neurons[i]));
  }
  child.AssignLayers();
  return child;
}
