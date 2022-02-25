
// #region - Setup

// Declare variables
let ct;
let fps;

let gridScale;
let ants;


function setup() {
  createCanvas(800, 800);
  setupVariables();
}


function setupVariables() {
  // Initialize variables
  ct = 0.0;
  fps = 60;

  gridScale = 10;
  ants = [];

  // Populate ants
  for (let i = 0; i < 100; i++) {
    ants.push(new Ant({ x: floor(random(width / gridScale)), y: floor(random(width / gridScale)) }));
  }
}

// #endregion


// #region - Main

function draw() {
  // Draw background
  background(220);

  // Update based on fps and frameRate
  fps = fps < 0 ? 0 : fps;
  ct += 1.0 / frameRate();
  if (ct > (1.0 / fps)) {
    ct = 0.0;

    // Update all ants
    for (let ant of ants) ant.update();
  }

  // Show all ants
  for (let ant of ants) ant.show();

  // Info text
  fill(0);
  noStroke();
  text("FPS: " + fps, 15, 20);
}


function getAntAtPosition(pos) {
  // Returns the ant at a given position
  return ants.find(ant => (ant.pos.x == pos.x && ant.pos.y == pos.y));
}


function keyPressed() {
  // Change fps
  if (keyCode == 37) fps -= 10;
  if (keyCode == 38) fps++;
  if (keyCode == 39) fps += 10;
  if (keyCode == 40) fps--;
}

// #endregion


class Ant {

  // #region - Setup

  constructor(pos_) {
    // Initialize variables
    this.alive = true;
    this.state = "IDLE";

    this.pos = pos_ || { x: 0, y: 0 };
    this.age = 0;
    this.hunger = 1;
  }


  update() {
    // Deplete food for living
    if (this.alive) {
      this.hunger -= 0.0008;

      // Update and perform state
      this.updateState();
      this.performState();
    }

    // Die if no hunger
    if (this.hunger <= 0) this.alive = false;
  }


  updateState() {
    // Current state IDLE
    if (this.state == "IDLE") {

      // Change to HUNGRY
      if (this.hunger < 0.4 && random() < ((1 - this.hunger) * 0.1)) {
        this.state = "HUNGRY";
      }
    }
  }


  performState() {
    // Current State IDLE
    if (this.state == "IDLE") {

      // Random movement
      if (random() < 0.08) {
        let dirX = floor(random(3) - 1);
        let dirY = floor(random(3) - 1);
        this.pos.x += dirX;
        this.pos.y += dirY;
        this.hunger -= (abs(dirX) + abs(dirY)) * 0.007;
      }
    }
  }


  show() {
    // Show as a rect
    noStroke();
    fill(!this.alive ? "#852727" // "#292424"
      : this.state == "IDLE" ? "#38b436" // "#714444"
      : this.state == "HUNGRY" ? "#d1a430" // "#533b3b"
      : "#7031d0");
    rect(this.pos.x * gridScale, this.pos.y * gridScale, gridScale, gridScale);
  }

  // #endregion
}
