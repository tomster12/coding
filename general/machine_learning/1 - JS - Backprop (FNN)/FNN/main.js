let net;
let bias = false;


function setup() {
  createCanvas(400, 400);
  net = RandomWeights([2, 2, 1], [-1, 1]);
}


function draw() {
  background(200);
  DrawNetwork(net, createVector(50, 50), 60, 80, 80);
}
