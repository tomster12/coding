
// http://www.vergenet.net/~conrad/boids/pseudocode.html


// #region - Setup

// Declare variables
let sim;
let sliders = {};


function setup() {
  createCanvas(600, 600);

  // Initialize variables
  sim = new Simulation(80, { x: width * 0.5, y: height * 0.5 }, 500);
  let sliderHolder = document.getElementById("info");
  sliders.COUNT = createLabelledSlider(sliderHolder, "COUNT", 0, 400, 80, 1);
  sliders.SEP_DIST = createLabelledSlider(sliderHolder, "SEP_DIST", 0, 150, 25);
  sliders.SEP_MULT = createLabelledSlider(sliderHolder, "SEP_MULT", 0, 0.02, 0.003);
  sliders.ALIGN_DIST = createLabelledSlider(sliderHolder, "ALIGN_DIST", 0, 150, 60);
  sliders.ALIGN_MULT = createLabelledSlider(sliderHolder, "ALIGN_MULT", 0, 0.02, 0.0012);
  sliders.COH_DIST = createLabelledSlider(sliderHolder, "COH_DIST", 0, 150, 60);
  sliders.COH_MULT = createLabelledSlider(sliderHolder, "COH_MULT", 0, 0.02, 0.0006);
  sliders.SPEED = createLabelledSlider(sliderHolder, "SPEED", 0, 8.0, 0.8);
}


function createLabelledSlider(parent, txt, r0, r1, v, int=0) {
  // Create a labelled slider
  let label = createDiv("").class("label").parent(parent);
  let text = createSpan(txt).parent(label);
  let slider = createSlider(r0, r1, v, int).parent(label);
  slider.parent(label);
  return slider;
}

// #endregion


// #region - Main

function draw() {
  background("#293731");

  // Update sim count
  sim.updateCount(sliders.COUNT.value());

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
    this.addBoids(numBoids);
  }


  addBoids(count) {
    // Add a set amount of boids
    for (let i = 0; i < count; i++) {
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


  updateCount(count) {
    if (count != this.boids.length) {
      console.log("Updating count");

      // Add more boids
      if (count > this.boids.length) this.addBoids(count - this.boids.length);

      // Remove some boids
      else if (count < this.boids.length) this.boids = this.boids.splice(0, count);
    }
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
    if (mag > sliders.SPEED.value()) {
      this.vel.x *= sliders.SPEED.value() / mag;
      this.vel.y *= sliders.SPEED.value() / mag;
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
        if (distSq < (sliders.SEP_DIST.value() * sliders.SEP_DIST.value())) {

          // Apply seperation
          dir.x += dx * sliders.SEP_MULT.value();
          dir.y += dy * sliders.SEP_MULT.value();
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
        if (distSq < (sliders.ALIGN_DIST.value() * sliders.ALIGN_DIST.value())) {
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
      x: (ave.x - this.vel.x) * sliders.ALIGN_MULT.value(),
      y: (ave.y - this.vel.y) * sliders.ALIGN_MULT.value() };
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
      if (distSq < (sliders.COH_DIST.value() * sliders.COH_DIST.value())) {
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
     x: (ctr.x - this.pos.x) * sliders.COH_MULT.value(),
     y: (ctr.y - this.pos.y) * sliders.COH_MULT.value() }
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