
// - Implement convolution / pooling

// - Add UI for:
//   - Changing activation functions
//   - Changing sampling mode (if available)
//   - Adding training data


// Declare variables
let input;
let interactor;

let trainer;
let trainerSettings;
let toTrain = true;


function setup() {
  // Main setup
  createCanvas(window.innerWidth, window.innerHeight);
  noSmooth();
  setupVariables();
}


function windowResized() {
  // Keep canvas the size of the window
  resizeCanvas(window.innerWidth, window.innerHeight);
}


function setupVariables() {
  // Initialize variables
  input = new Input();
  interactor = new Interactor(value => color(150, 150 + value * 100, 150));


  // Create network and trainer
  let net = new Network([ 1, 2 ]);
  net.add(new Dense(2, activation=actvFuncs.tanh));
  net.add(new Dense(1, activation=actvFuncs.tanh));
  trainer = new DenseNetworkTrainer(net);
  let l = -1;
  let h = 1;
  trainerSettings = {
    trainingData: [
      { input: [ [h], [h] ], expectedOutput: [ [l] ] },
      { input: [ [h], [l] ], expectedOutput: [ [h] ] },
      { input: [ [l], [h] ], expectedOutput: [ [h] ] },
      { input: [ [l], [l] ], expectedOutput: [ [l] ] } ],
    learningRate: 0.1, momentumRate: 0.25 };
  net.logLayers();
  interactor.setNetwork(net);
  interactor.setTrainer(trainer, trainerSettings);


  // Quick train and print
  // console.log("Before training:");
  // for (let i = 0; i < trainerSettings.trainingData.length; i++) {
  //   let input = new Matrix2(trainerSettings.trainingData[i].input);
  //   console.log(input.shortToString());
  //   console.log(net.propogate(input).shortToString());
  // }
  // for (let i = 0; i < 1000; i++) {
  //   let output = trainer.train(trainerSettings);
  //   // console.log(output.error[output.error.length - 1]);
  // }
  // console.log("After training:");
  // for (let i = 0; i < trainerSettings.trainingData.length; i++) {
  //   let input = new Matrix2(trainerSettings.trainingData[i].input);
  //   console.log(input.shortToString());
  //   console.log(net.propogate(input).shortToString());
  // }


  // Create network and trainer
  // let net = new Network([ 1, 2 ]);
  // net.add(new Dense(2, activation=actvFuncs.relu));
  // net.add(new Dense(2, activation=actvFuncs.relu));
  // net.add(new Dense(4, activation=actvFuncs.relu));
  // trainer = new DenseNetworkTrainer(net);
  // trainerSettings = {
  //   trainingData: [
  //       { input: [ [-1], [-1] ], expectedOutput: [ [-1], [-1], [-1], [ 1] ] },
  //       { input: [ [-1], [ 1] ], expectedOutput: [ [-1], [-1], [ 1], [-1] ] },
  //       { input: [ [ 1], [-1] ], expectedOutput: [ [-1], [ 1], [-1], [-1] ] },
  //       { input: [ [ 1], [ 1] ], expectedOutput: [ [ 1], [-1], [-1], [-1] ] } ],
  //   learningRate: 0.1, momentumRate: 0.25 };
  // interactor.setNetwork(net);
  // interactor.setTrainer(trainer, trainerSettings);
  // net.logLayers();


  // Create samplers
  let sampler1 = new XYSampler(net, [[-1, 1], [-1, 1]], 15);
  let sampler2 = new PresetSampler(net);
  sampler2.addPreset(new Matrix2([ [-1], [-1] ]));
  sampler2.addPreset(new Matrix2([ [-1], [ 1] ]));
  sampler2.addPreset(new Matrix2([ [ 1], [-1] ]));
  sampler2.addPreset(new Matrix2([ [ 1], [ 1] ]));
  interactor.addSampler(sampler1);
  interactor.addSampler(sampler2);
}


function draw() {
  // Draw views and update input
  background(220);
  interactor.draw();
  input.draw();
}
