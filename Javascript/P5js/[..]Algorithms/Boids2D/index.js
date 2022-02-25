
// http://www.vergenet.net/~conrad/boids/pseudocode.html


// #region - Setup

// Declare variables
let sim;


function setup() {
  createCanvas(800, 800);

  // Initialize variables
  sim = new Simulation(80, { x: width * 0.5, y: height * 0.5 }, 500);
}

// #endregion


// #region - Main

function draw() {
  background("#293731");

  // Update and draw sim
  sim.update();
  sim.draw();
}

// #endregion


class Simulation {

  // #region - Main

  constructor(numBoids, pos_, size_) {
    // Initialize variables
    this.boids = [];
    this.pos = pos_;
    this.size = size_;

    // Populate boids
    for (let i = 0; i < numBoids; i++) {
      let angle = random(TWO_PI);
      this.boids.push(new Boid(this,
        { x: this.pos.x + random(this.size * -0.5, this.size * 0.5),
          y: this.pos.y + random(this.size * -0.5, this.size * 0.5) },
        { x: cos(angle), y: sin(angle) }
      ));
    }
  }


  update() {
    // Update boids
    for (let boid of this.boids) boid.update();
  }


  draw() {
    // Show boundary
    stroke("#c2decf");
    noFill();
    rect(this.pos.x - this.size * 0.5,
      this.pos.y - this.size * 0.5,
      this.size, this.size);

    // Show boids
    for (let boid of this.boids) boid.show();
  }
}

// #endregion


class Boid {

  // #region - Setup

  // Initialize static variables
  static SEP_DIST = 25;
  static SEP_MULT = 0.003;
  static ALIGN_DIST = 60;
  static ALIGN_MULT = 0.0012;
  static COH_DIST = 60;
  static COH_MULT = 0.0006;
  static SPEED = 0.8;


  constructor(sim_, pos_, vel_) {
    // Initialize variables
    this.sim = sim_;
    this.pos = pos_;
    this.vel = vel_;
  }

  // #endregion


  // #region - Main

  update() {
    // Get rule velocities
    let v1 = this.getSeperation();
    let v2 = this.getAlignment();
    let v3 = this.getCohesion();
    // let v4 = this.getAdditional();

    // Update and normalize velocity
    this.vel.x += v1.x + v2.x + v3.x; // + v4.x;
    this.vel.y += v1.y + v2.y + v3.y; // + v4.y;
    let mag = sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y) || 1;
    if (mag > Boid.SPEED) {
      this.vel.x *= Boid.SPEED / mag;
      this.vel.y *= Boid.SPEED / mag;
    }

    // Move with velocity
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // Flip at edge
    if (this.pos.x < (this.sim.pos.x - this.sim.size * 0.5)) this.vel.x = abs(this.vel.x);
    if (this.pos.x > (this.sim.pos.x + this.sim.size * 0.5)) this.vel.x = -abs(this.vel.x);
    if (this.pos.y < (this.sim.pos.x - this.sim.size * 0.5)) this.vel.y = abs(this.vel.y);
    if (this.pos.y > (this.sim.pos.x + this.sim.size * 0.5)) this.vel.y = -abs(this.vel.y);
  }


  getSeperation() {
    // Setup variables
    let dir = { x: 0, y: 0 };

    // For each other boid
    for (let boid of this.sim.boids) {
      if (boid != this) {

        // Check whether within range
        let dx = this.pos.x - boid.pos.x;
        let dy = this.pos.y - boid.pos.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < (Boid.SEP_DIST * Boid.SEP_DIST)) {

          // Apply seperation
          dir.x += dx * Boid.SEP_MULT;
          dir.y += dy * Boid.SEP_MULT;
        }
      }
    }

    // Return direction
    return dir;
  }


  getAlignment() {
    // Setup variables
    let ave = { x: 0, y: 0 };
    let num = 0;

    // For each other boid
    for (let boid of this.sim.boids) {
      if (boid != this) {

        // Check whether within range
        let dx = this.pos.x - boid.pos.x;
        let dy = this.pos.y - boid.pos.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < (Boid.ALIGN_DIST * Boid.ALIGN_DIST)) {
          num += 1;

          // Apply seperation
          ave.x += boid.vel.x;
          ave.y += boid.vel.y;
        }
      }
    }

    // Return direction
    if (num > 0) {
      ave.x /= num;
      ave.y /= num;
    }
    let dir = {
      x: (ave.x - this.vel.x) * Boid.ALIGN_MULT,
      y: (ave.y - this.vel.y) * Boid.ALIGN_MULT };
    return dir;
  }


  getCohesion() {
    // Setup variables
    let ctr = { x: 0, y: 0 };
    let num = 0;

    // For each other boid
    for (let boid of this.sim.boids) {

      // Check whether within range
      let dx = this.pos.x - boid.pos.x;
      let dy = this.pos.y - boid.pos.y;
      let distSq = dx * dx + dy * dy;
      if (distSq < (Boid.COH_DIST * Boid.COH_DIST)) {
        num += 1;

        // Apply seperation
        ctr.x += boid.pos.x;
        ctr.y += boid.pos.y;
      }
    }

    // Average then return direction
    ctr.x /= num;
    ctr.y /= num;
    let dir = {
     x: (ctr.x - this.pos.x) * Boid.COH_MULT,
     y: (ctr.y - this.pos.y) * Boid.COH_MULT }
    return dir;
  }


  getAdditional() {
    // Setup variables
    let dir = { x: 0, y: 0 };

    // Mouse onscreen
    if (mouseX > (this.sim.pos.x - this.sim.size * 0.5)
    && mouseX < (this.sim.pos.x + this.sim.size * 0.5)
    && mouseY > (this.sim.pos.y - this.sim.size * 0.5)
    && mouseY < (this.sim.pos.y + this.sim.size * 0.5)) {

      // Set direction
      dir = {
        x: (this.pos.x - mouseX) * 0.0002,
        y: (this.pos.y - mouseY) * 0.0002
      }
    }


    // Return direction
    return dir;
  }


  show() {
    // Show as ellipse
    stroke("#c2decf");
    fill("#c2decf");
    ellipse(this.pos.x, this.pos.y, 3.5, 3.5);

    // Show direction
    line(this.pos.x, this.pos.y,
      this.pos.x + this.vel.x * 10,
      this.pos.y + this.vel.y * 10);
  }

  // #endregion
}