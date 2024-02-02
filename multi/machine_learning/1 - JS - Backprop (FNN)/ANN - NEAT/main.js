let genAl;
let net;
let innovations;

function setup() {
  createCanvas(400, 400);

  SetupVariables();
}


function draw() {
  background(200);
  genAl.Update();
}


function SetupVariables() {
  let genepoolAmount = 100;
  let dataRange = 1;
  let unitSize = 5;
  let mutationRate = 0.02;

  innovations = new innovationList();
  genAl = new geneticAlgorithm(genepoolAmount, dataRange, unitSize, mutationRate);
}


function keyPressed() {
  genAl.KeyPressed(keyCode);
}
