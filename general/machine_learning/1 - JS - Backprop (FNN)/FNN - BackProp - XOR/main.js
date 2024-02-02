let net;
let netPrevDif;
let trainingSet;

let lrnRate;
let hasMm;
let mmRate;
let hasBias;


function setup() {
  createCanvas(400, 400);
  SetupVariables();

  FullTrain(1000);
}


function draw() {
  background(200);
  DrawNetwork(net, createVector(50, 50), 40, 60, 60);
}



function SetupVariables() {
  hasMm = true;
  hasBias = true;
  lrnRate = 0.2;
  mmRate = 0.8;
}


function FullTrain(amn) { // Make a network and train it
  net = RandomWeights([2, 2, 1], [-1, 1]);
  netPrevDif = blankNet(net);

  trainingSet = [
    [[0, 0], [0]],
    [[0, 1], [1]],
    [[1, 0], [1]],
    [[1, 1], [0]]
  ]

  for (let i = 0; i < amn; i++) {
    Train(net, trainingSet);
  }

  let aveErr = Check(net);
  console.log("Average error: " + aveErr);
  return aveErr;
}
