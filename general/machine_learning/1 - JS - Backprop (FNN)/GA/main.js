

/*
http://keycode.info/
https://p5js.org/reference/
*/


 // ---------------------------------------------------------------------


let genAl;


function setup() {
  createCanvas(400, 400);
  fill(100);
  noStroke();

  SetupVariables();
}


// ---------------------------------------------------------------------


function draw() {
  background(200);

  genAl.Update();
}


// ---------------------------------------------------------------------


function keyPressed() {
  genAl.KeyPressed(keyCode);
}


// ---------------------------------------------------------------------
// ---- Other Functions
// ---------------------------------------------------------------------


function SetupVariables() {
  let genepoolAmount = 100;
  let dataAmount = 100;
  let dataRange = 2;
  let unitSize = 5;
  let mutationRate = 0.02;

  let unData = [50];

  genAl = new geneticAlgorithm(genepoolAmount, dataAmount, dataRange, unitSize, mutationRate, unData);
}


// ---------------------------------------------------------------------
