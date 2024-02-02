
class ThrusterAgent extends GeneticAgent {

  constructor(options_) {
    super();

    // Initialize variables
    this.options = options_;
    this.pos = { x: this.options.start.x, y: this.options.start.y };
    this.vel = { x: 0, y: 0 };
    this.targets = this.options.targets;
    this.net = new FNN([ 4, 6, 2 ], [ -4, 4 ], true, new Array(4).fill([sigmoid, drvSigmoid]));

    this.timer = [0, 1000];
    this.currentTarget = 0;
    this.thrust = 0;
    this.dir = PI * (0.4 + random() * 0.2);
  }


  update() {
    // Update timer
    this.timer[0]++;

    // Apply gravity
    this.vel.y += 0.02;

    // Run neural network
    let target = this.getCurrentTarget();
    let dx = target.x - this.pos.x
    let dy = target.y - this.pos.y;
    let inp = [dx, dy, this.vel.x, this.vel.y];
    let outputs = this.net.predict(inp);
    this.thrust = min(0.05, outputs[0]);
    this.dir = outputs[1] * TWO_PI;

    // Thrust in direction
    let dir = { x: -cos(this.dir), y: -sin(this.dir) };
    this.vel.x += dir.x * this.thrust;
    this.vel.y += dir.y * this.thrust;

    // Update position
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // Check against target
    if ((dx * dx + dy * dy) < (3 * 3)) {
      if (this.currentTarget < (this.targets.length - 1)) this.currentTarget++;
    }
  }


  show() {
    // Draw body and rocket
    stroke(0);
    noFill();
    ellipse(this.pos.x, this.pos.y, 10, 10);
    let endPos = this.getRocketEndPos();
    line(this.pos.x, this.pos.y, endPos.x, endPos.y);
    stroke(237, 78, 36);
    ellipse(endPos.x, endPos.y, this.thrust * 25, this.thrust * 25);

    // Show current target
    let target = this.getCurrentTarget();
    stroke(212, 96, 23);
    ellipse(target.x, target.y, 20, 20);
  }


  getRocketEndPos() {
    // Returns the position of the end of the rocket
    return {
      x: this.pos.x + cos(this.dir) * 10,
      y: this.pos.y + sin(this.dir) * 10
    }
  }


  getCurrentTarget() {
    // Returns the current target
    return this.targets[this.currentTarget];
  }


  isComplete() {
    // Return whether is finished
    return this.timer[0] >= this.timer[1];
  }


  getScore() {
    // Return the calculated score
    let score = 0;
    score += this.currentTarget * this.currentTarget * 4;
    let target = this.getCurrentTarget();
    let dx = target.x - this.pos.x
    let dy = target.y - this.pos.y;
    score += max(0, 4 * ((800 * 800) - (dx * dx + dy * dy)) / (800 * 800));
    return score;
  }


  crossover(other) {
    // Crossover current net with other net
    let newNet = new FNN([ 4, 6, 2 ], [ -2, 2 ], true, new Array(4).fill([sigmoid, drvSigmoid]));

    for (let i = 0; i < newNet.weights.length; i++) {
      for (let row = 0; row < newNet.weights[i].rows; row++) {
        for (let col = 0; col < newNet.weights[i].cols; col++) {
          let val = 0;
          if (random() < 0.5)
            val = this.net.weights[i].getVal(row, col);
          else val = other.net.weights[i].getVal(row, col);
          newNet.weights[i].setVal(row, col, val);
        }
      }
    }

    // Create new agent
    let newAgent = new ThrusterAgent(this.options);
    newAgent.net = newNet;
    return newAgent;
  }


  mutate() {
    // Mutate half of the weights in the net
    for (let i = 0; i < this.net.weights.length; i++) {
      for (let row = 0; row < this.net.weights[i].rows; row++) {
        for (let col = 0; col < this.net.weights[i].cols; col++) {
          if (random() < 0.2) this.net.weights[i].setVal(row, col, random() * 8 - 4);
        }
      }
    }
  }
}


// Declare variables
let input;
let agentOptions;


function setup() {
  // Main setup
  createCanvas(1100, 800);
  setupVariables();
}


function setupVariables() {
  // Initialize variables
  input = new Input();
  ga = new GenePool(0.06);

  // Initialize genetic algorithm
  agentOptions = {
    start: { x: width * 0.5, y: height * 0.5 },
    targets: [
      { x: 800, y: 320 },
      { x: 600, y: 320 },
      { x: 600, y: 450 },
      { x: 850, y: 350 },
      { x: 100, y: 600 } ]};
  for (let i = 0; i < 300; i++) ga.addAgent(new ThrusterAgent(agentOptions));
}


function draw() {
  background(235);

  // Update genetic algorithm
  ga.update();

  // Input late update
  input.draw();
}
