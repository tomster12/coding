
//      TODO
// Look at weights and biases to show data, maybe visor
// Look up implementation differences between classification and regression


// Declare variables
let input;
let net;
let netTrain;
let netVis;


function setup() {
  // Main setup
  createCanvas(1600, 600);
  setupVariables();
}


function setupVariables() {
  // Initialize FNN
  input = new Input();
  net = new FNNBackprop([2, 2, 1], [-5, 5], true, null);

  netTrain = new FNNTrainer(net, 0.1, 0.5);
  netTrain.setTrainingData([
    [ [ -1, -1 ], [ -1 ] ],
    [ [ 1, -1 ], [ 1 ] ],
    [ [ -1, 1 ], [ 1 ] ],
    [ [ 1, 1 ], [ -1 ] ] ]);

  netVis = new FNNVisualizer(net, netTrain, {
    start: { x: -1, y: -1 },
    end: { x: 1, y: 1 },
    quality: 30 });
  netVis.setOutput2t1T({ x: 100, y: 100 }, { x: 400, y: 400 });
  netVis.setInternal2t1T({ x: 600, y: 100 }, { x: 400, y: 400 });
  netVis.setErrorT({ x: 1100, y: 100 }, { x: 400, y: 400 });
}


function draw() {
  background(220);

  // Update and show
  netTrain.update();
  netVis.update();
  netVis.show();

  // Input late update
  input.draw();
}