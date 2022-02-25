
// TODO:
// DONE - Create graph inner to show errors
// DONE - Update Dense layer to include bias
// DONE - Update network trainer to account for bias
// DONE - Debug until it works
//   ^ - May need to change activation function
//   ^ - May need to add preset input for layer / neuron value
//   ^ - May need to change training input based on activation

// DONE - Create a generic button class for views
// DONE - Add buttons for swapping between preset inputs on interactors
// - Put limits on resizing views
// - Add UI text for trainers on interactors
// - Add buttons for starting / stopping trainers

// - Take trainer out of interactor and simply pass it in through function
// - Attach error graph to net trainer, not other way round
// [!] Goal is for it to work nomatter the input / activation within reason
// - Figure out best way to abstract type of layer visualization from the specific
//   network interactor class
//   - This allows a sandbox interactor in which you can add different types of layers
//     to a neural network and change visualization between layers
//   - to do this may need to change the net int neuron value to be 1 node which contains
//     all nodes inside of it
//   - Best way to do this may to change the net ints to be different sample types
//     - For example, the XYSample would be a 2x sample space, the values interactors would be
//       a set sample
//     - this would allow all current interactor layer types to work from just these 2
//       interactor types and puts more control in the nodes
//     - Could be possible to make a single sample interactor class, with variable dimensions
//       and therefore meaning the preset value layers could use a 1D sampler, whereas XY uses a 2D


// Declare variables
let input;
let viewManager;


function setup() {
  // Main setup
  createCanvas(window.innerWidth, window.innerHeight);
  setupVariables();
}


function windowResized() {
  // Keep canvas the size of the window
  resizeCanvas(window.innerWidth, window.innerHeight);
}


function setupVariables() {
  // Initialize variables
  input = new Input();
  viewManager = new ViewManager();
  let view1 = viewManager.createView(70, 40);
  let view2 = viewManager.createView(500, 40);

  // Create net 1: a 5 7 7 3 dense network
  let net0 = new Network([ 1, 5 ]);
  net0.add(new Dense(7));
  net0.add(new Dense(7));
  net0.add(new Dense(3));

  // Create net 2: a 2 2 1 dense network
  let net1 = new Network([ 1, 2 ], name="XOR");
  net1.add(new Dense(3, activation=actvFuncs.relu));
  net1.add(new Dense(1, activation=actvFuncs.relu));
  net1.logLayers();

  // Create network interactor tabs for net 1 and 2 and add to view 1
  let netInt00 = new NetIntNeuronValues(net0, 50,
    [[ [0.1], [0.5], [0.3], [-0.2], [-0.9] ]]);
  let netInt01 = new NetIntLayerValues(net0, 50,
    [[ [0.1], [0.5], [0.3], [-0.2], [-0.9] ]]);

  let netInt10 = new NetIntXY(net1, 50, 10,
    [ [0, 1], [0, 1] ]);
  let netInt11 = new NetIntNeuronValues(net1, 50,
    [[ [0], [0] ], [ [0], [1] ], [ [1], [0] ], [ [1], [1] ]]);
  let netInt12 = new NetIntLayerValues(net1, 50,
    [[ [0], [0] ], [ [0], [1] ], [ [1], [0] ], [ [1], [1] ]]);

  let errorGraph = new Graph();
  netInt11.addTrainer(0.1, 0.25, [
    { input: [ [ 0 ], [ 0 ] ], expectedOutput: [ [ 1 ] ] },
    { input: [ [ 0 ], [ 1 ] ], expectedOutput: [ [ 1 ] ] },
    { input: [ [ 1 ], [ 0 ] ], expectedOutput: [ [ 1 ] ] },
    { input: [ [ 1 ], [ 1 ] ], expectedOutput: [ [ 0 ] ] } ], errorGraph);

  view1.addTab(netInt00, 360, 50 * (8 * 1.5 + 0.5));
  view1.addTab(netInt01, 360, 50 * (1 * 1.5 + 0.5));
  view1.addTab(netInt10, 285, 50 * (4 * 1.5 + 0.5));
  view1.addTab(netInt11, 285, 50 * (4 * 1.5 + 0.5));
  view1.addTab(netInt12, 285, 50 * (1 * 1.5 + 0.5));
  view2.addTab(errorGraph, 300, 300);
  view1.selectTab(2);
}


function draw() {
  // Draw views and update input
  background(220);
  viewManager.draw();
  input.draw();
}
