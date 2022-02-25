function RandomDataSet(dataAmount, dataRange) {
  data = [];
  for (let i = 0; i < dataAmount; i++) {
    data.push(RandomData(dataRange));
  }
  return data;
}


// ---------------------------------------------------------------------


function RandomData(dataRange) {
  return random(-dataRange, dataRange);
}


// ---------------------------------------------------------------------


function MakeChild(p1, p2) {
  data = [];
  for (let i = 0; i < floor(p1.data.length / 2); i++) {
    data[i] = p1.data[i];
  }
  for (let i = floor(p2.data.length / 2); i < p2.data.length; i++) {
    data[i] = p2.data[i];
  }
  return new unitData(null, data, 0);
}
