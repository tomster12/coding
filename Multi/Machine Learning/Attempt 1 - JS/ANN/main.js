let net;
let innovations;
let io;

function setup() {
  createCanvas(400, 400);

  innovations = new innovationList();
  net = new network([2, 1], true, 1);

  io = [2, 1];
}


function draw() {
  background(200);
  DrawNetwork(net, createVector(50, 50), 20, 80, 110);
}
