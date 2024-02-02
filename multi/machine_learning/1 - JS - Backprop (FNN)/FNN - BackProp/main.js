let net;
let netTmp;
let trainingSet;

let lrnRate;
let hasMm;
let mmRate;
let hasBias;



function setup() {
  createCanvas(400, 400);
  SetupVariables();
}


function draw() {
  background(200);
  DrawNetwork(net, createVector(50, 50), 40, 60, 60);
}



function SetupVariables() {
  hasMm = true;
  hasBias = true;

  net = RandomWeights([2, 2, 1], [-1, 1]);
  netTmp = blankNet(net);

  trainingSet = [
    [[0, 0], [0]],
    [[0, 1], [1]],
    [[1, 0], [1]],
    [[1, 1], [0]]
  ]

  lrnRate = 0.2;
  mmRate = 0.8;

  for (let i = 0; i < 2000; i++) {
    Train(net, trainingSet);
  }
}
