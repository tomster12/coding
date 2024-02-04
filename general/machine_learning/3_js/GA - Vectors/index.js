
class VectorAgent extends GeneticAgent {

  constructor(options_) {
    super();

    // Initialize variables
    this.options = options_;
    this.pos = { x: this.options.start.x, y: this.options.start.y };
    this.radius = this.options.radius;
    this.movements = [];
    this.movementCount = this.options.movementCount;

    this.current = 0;
    this.score = 0;
    this.finished = false;

    this.randomize();
  }


  getRandomVector() {
    // Return a random movement vector
    return {
      x: random() * 10 - 5,
      y: random() * 10 - 5,
    };
  }


  randomize() {
    // Populate movements with random directions
    this.movements = [];
    for (let i = 0; i < this.movementCount; i++) this.movements.push(this.getRandomVector());
  }


  update() {
    if (!this.finished) {
      // Move position with current direction
      this.pos.x += this.movements[this.current].x;
      this.pos.y += this.movements[this.current].y;
      this.current++;

      // Stop if reached end of movement
      if (this.current == this.movementCount) this.finished = true;

      // Stop if reached target
      let targetDst = dist(this.pos.x, this.pos.y, this.options.target.x, this.options.target.y);
      if (targetDst < (this.options.targetRadius + this.radius)) this.finished = true;

      // Set score if finished
      if (this.finished) this.score = 1 / (targetDst * targetDst + this.current * this.current);
    }
  }


  show() {
    // Draw ellipse
    noStroke();
    fill(103, 119, 222);
    ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
  }


  isComplete() {
    // Return whether is finished
    return this.finished;
  }


  getScore() {
    // Return the calculated score
    return this.score;
  }


  crossover(other) {
    // Crossover movements with other agents
    let newMovements = [];
    for (let i = 0; i < this.movements.length; i++) {
      if (random() < 0.5)
        newMovements.push(this.movements[i]);
      else newMovements.push(other.movements[i]);
    }

    // Create new agent
    let newAgent = new VectorAgent(this.options);
    newAgent.movements = newMovements;
    return newAgent;
  }


  mutate() {
    // Randomize half of the movements
    for (let i = 0; i < this.options.movementCount / 2; i++) {
      let i = floor(random() * this.movementCount);
      this.movements[i] = this.getRandomVector();
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
  ga = new GenePool(0.05);

  // Initialize genetic algorithm
  agentOptions = {
    start: { x: width * 0.5, y: height * 0.5 },
    radius: 10,
    movementCount: 300,
    target: { x: 800, y: 400 },
    targetRadius: 20 };
  for (let i = 0; i < 100; i++) ga.addAgent(new VectorAgent(agentOptions));
}


function draw() {
  background(220);

  // Update genetic algorithm
  ga.update();

  // Show target
  noStroke();
  fill(189, 139, 246);
  ellipse(agentOptions.target.x, agentOptions.target.y, agentOptions.targetRadius * 2, agentOptions.targetRadius * 2);

  // Input late update
  input.draw();
}
