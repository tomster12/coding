
// #region - Setup

// Declare variables
let input;
let focused;
let objects;
let player;


function setup() {
  // p5js setup
  createCanvas(1280, 720, WEBGL);
  stroke(255);
  noFill();

  // Initialize variables
  input = new Input();
  focused = false;
  objects = [];
  player = new Player();
  objects.push(player);

  // Focus event listener
  document.addEventListener("pointerlockchange", pointerLockChange, false);
}


// #endregion


// #region - Main

function draw() {
  background(0);

  // Update objects
  let dt = 1 / frameRate();
  for (let o of objects) o.update(dt);

  // Draw plane
  push();
  translate(0, 0, 0);
  rotateX(PI / 2);
  plane(800);
  pop();

  // Show objects
  for (let o of objects) o.show();

  // Late update input
  input.draw();
}


function randomBetween(a, b) {
  // Returns a random number between limits
  return a + random() * (b - a);
}


function alphaColor(c, alpha) {
  // Return a colour with a given alpha
  return color('rgba(' +  [red(c), green(c), blue(c), alpha].join(',') + ')');
}


function mousePressed() {
  // Lock camera on mouse click
  requestPointerLock();
}


function keyPressed() {
  // Spawn firework
  if (keyCode == 81) {
    objects.push(new Particle(
      { x: randomBetween(-400, 400), y: 0,
        z: randomBetween(-400, 400) },
      { x: 0, y: -15, z: 0 },
      { colour: color("#f5ad32"),
        size: 4,
        fadeOut: false,
        maxTime: 1.5 },
      { amount: 100,
        colour: color("#f5ad32"),
        size: 2,
        fadeOut: true,
        maxTime: 1.5 }
    ));
  }
}


function pointerLockChange() {
  // Pointer lock event listener
  focused = (document.pointerLockElement === canvas);
}

// #endregion


class Player {

  // #region - Main

  constructor() {
    // Declare and initialize variables
    this.pos = { x: 0, y: -40, z: 300 };
    this.camera = createCamera();
    this.camera.setPosition(0, -80, 300);
    this.camera.perspective(PI * 0.45, width / height, 20);
    setCamera(this.camera);
  }


  update() {
    // Check screen is focused
    if (focused) {

      // Aim camera
      this.camera.pan(-movedX * 0.002);
      this.camera.tilt(movedY * 0.002);

      // Translate camera
      let dx = (input.keys.held[65] ? -1 : 0) + (input.keys.held[68] ? 1 : 0);
      let dz = (input.keys.held[87] ? -1 : 0) + (input.keys.held[83] ? 1 : 0);
      this.move(dx * 1.5, 0, dz * 1.5);
    }
  }


  show() {}


  move(x, y, z) {
    // Helper function
    let rotateAroundZ = (v, a) => {
      return [
        v[0] * cos(a) - v[2] * sin(a), v[1],
        v[0] * sin(a) - v[2] * cos(a)]};

    // Move based on localX
    let local = this.camera._getLocalAxes();
    let localX = local.x;
    let localY = [0, 1, 0];
    let localZ = rotateAroundZ(localX, PI / 2);
    this.camera.setPosition(
      this.camera.eyeX + localX[0] * x + localY[0] * y + localZ[0] * z,
      this.camera.eyeY + localX[1] * x + localY[1] * y + localZ[1] * z,
      this.camera.eyeZ + localX[2] * x + localY[2] * y + localZ[2] * z
    );
  }

  // #endregion
}


class Particle {

  // #region - Main

  constructor(pos_, vel_, bodyConfig_, explodeConfig_) {
    // Declare and initialize variables
    this.pos = pos_;
    this.vel = vel_;
    this.time = 0;
    this.bodyConfig = bodyConfig_;
    this.explodeConfig = explodeConfig_;
  }


  update(dt) {
    // Update time
    this.time += dt;
    if (this.time >= this.bodyConfig.maxTime) {
      objects.splice(objects.indexOf(this), 1);
      this.explode();
    }

    // Apply gravity
    this.vel.y += 0.08;

    // Update velocity and position
    this.vel.x *= 0.99;
    this.vel.y *= 0.99;
    this.vel.z *= 0.99;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.pos.z += this.vel.z;
  }


  show() {
    // Show as sphere
    push();
    noStroke();
    let a = 1;
    if (this.bodyConfig.fadeOut)
      a -= this.time / this.bodyConfig.maxTime;
    fill(alphaColor(this.bodyConfig.colour, a));
    translate(this.pos.x, this.pos.y, this.pos.z);
    sphere(this.bodyConfig.size);
    pop();
  }


  explode() {
    // Explode into particles
    for (let i = 0; i < this.explodeConfig.amount; i++) {
      let vel = [random() * 2 - 1, random() * 2 - 1, random() * 2 - 1];
      let mult = randomBetween(2, 4) / sqrt(vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2]);
      objects.push(new Particle(
        { x: this.pos.x, y: this.pos.y, z: this.pos.z },
        { x: vel[0] * mult, y: vel[1] * mult, z: vel[2] * mult },
        this.explodeConfig,
        { amount: 0 }
      ));
    }
  }

  // #endregion
}
