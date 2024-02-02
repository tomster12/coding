let genAl;
let innovations;
let io;

let foods;
let foodAmount;
let foodSize;
let visualIntervals;
let fitnessInterval;
let visualDistance;
let visualAngles;
let baseFitness;
let speed;
let debug;
let un;
let updatePerFrame;

let cE;
let cW;
let mWt;
let mC;
let mWtI;
let compatibility;


function setup() {
  createCanvas(400, 400);

  SetupVariables();
}


function draw() {
  background(200);
  genAl.Update();
}


function SetupVariables() {
  foods = [];
  foodAmount = 150;
  foodSize = 5;
  visualIntervals = 5;
  fitnessInterval = 0.2;
  visualDistance = 50;
  visualAngles = [45, 30, 15, 0, -15, -30, -45];
  baseFitness = 25;
  speed = 0.8;
  debug = false;
  updatePerFrame = 1;

  cE = 0.8;
  cW = 0.3;
  mWt = 0.8;
  mC = 0.1;
  compatibility = 1;

  let genepoolAmount = 50;
  let dataRange = 1;
  let unitSize = 5;
  let mutationRate = 0.6;

  io = [7, 2];
  innovations = new innovationList();
  genAl = new geneticAlgorithm(genepoolAmount, dataRange, unitSize, mutationRate);
}


function keyPressed() {
  genAl.KeyPressed(keyCode);
}
