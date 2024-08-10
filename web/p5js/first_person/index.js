
// #region - Setup

// Declare variables
let input;
let focused;
let player;


function setup() {
  // p5js setup
  createCanvas(800, 800, WEBGL);
  stroke(255);
  noFill();

  // Initialize variables
  input = new Input();
  focused = false;
  player = new Player();

  // Focus event listener
  document.addEventListener("pointerlockchange", pointerLockChange, false);
}


// #endregion


// #region - Main

function draw() {
  background(0);

  // Update player
  player.update();

  // Draw sphere
  push();
  translate(0, -80, 0);
  sphere(80);
  pop();

  // Draw plane
  push();
  translate(0, 0, 0);
  rotateX(PI / 2);
  plane(800);
  pop();

  // Update input
  input.draw();
}


function mousePressed() {
  // Lock camera on mouse click
  requestPointerLock();
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
    this.camera.perspective(PI * 0.3, width / height, 20);
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
      this.move(dx, 0, dz);
    }
  }


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