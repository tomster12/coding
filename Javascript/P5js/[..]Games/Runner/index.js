
// #region - Setup

// Declare variables
let game;


function setup() {
  // Initialize variables
  game = new Game();
}

// #endregion


// #region - Main

function draw() {
  // Calculate dt
  let dt = 1 / frameRate();

  // Call main game loop
  game.draw(dt);
}

// #endregion


// #region - Input

function keyPressed() {
  // Pass through to game
  game.inputKeyPressed(keyCode);
}

function keyReleased() {
  // Pass through to game
  game.inputKeyReleased(keyCode);
}


function mousePressed() {
  // Pass through to game
  game.inputMousePressed(mouseButton);
}


function mouseReleased() {
  // Pass through to game
  game.inputMouseReleased(mouseButton);
}

// #endregion


class Game {

  // #region - Setup

  constructor() {
    // Setup canvas
    createCanvas(1280, 720);

    // Initialize variables
    this.keyPressed = [];
    this.keyDown = [];
    this.mousePressed = null;
    this.mouseDown = null;

    this.G = 1;
    this.player = new Player(this, { x: 50, y: 100 });
  }

  // #endregion


  // #region - Main

  draw(dt) {
    // Main loop
    this.update();
    this.show();
  }


  update(dt) {
    // Update player
    this.player.update();

    // Update inputs
    this.keyDown = [];
    this.mouseDown = null;
  }


  show() {
    // Redraw background
    background("#786c68");

    // Show player
    this.player.show();
  }

  // #endregion


  // #region - Inputs

  inputKeyPressed(keyCode) {
    // Update input array for keyCode
    this.keyPressed[keyCode] = true;
    this.keyDown[keyCode] = true;
  }


  inputKeyReleased(keyCode) {
    // Update input array for keyCode
    this.keyPressed[keyCode] = false;
  }


  inputMousePressed(mouseButton) {
    // Update input for mouseButton
    this.mousePressed = mouseButton;
    this.mouseDown = mouseButton;
  }


  inputMouseReleased() {
    // Update input for mouseButton
    this.mousePressed = null;
  }

  // #endregion
}


class Player {

  // #region - Setup

  constructor(game_, pos_) {
    // Initialize variables
    this.game = game_;
    this.size = 20;
    this.isGrounded = true;
    this.isSliding = false;

    this.mass = 1;
    this.pos = pos_;
    this.vel = { x: 0, y: 0 };

    this.moveMaxSpeed = 5;
    this.moveDecelMult = 0.03;
    this.moveForce = 0.4;
    this.jumpForce = 10;
  }

  // #endregion


  // #region - Main

  update(dt) {
    // Slide on Shift
    this.isSliding = this.game.keyPressed[16];

    // Calculate movement vector from WASD
    let movementDir = {
      x: (this.game.keyPressed[65] ? -1 : 0) + (this.game.keyPressed[68] ? 1 : 0),
      y: (this.game.keyPressed[87] ? -1 : 0) + (this.game.keyPressed[83] ? 1 : 0) };
      let isMoving = !this.isSliding && this.isGrounded && (movementDir.x != 0 || movementDir.y != 0);

    // Apply movement force and measure speed differences
    if (isMoving) {
      let speedBeforeSq = this.vel.x * this.vel.x + this.vel.y * this.vel.y;
      this.vel.x += (movementDir.x * this.moveForce / this.mass);
      this.vel.y += (movementDir.y * this.moveForce / this.mass);
      let speedAfterSq = this.vel.x * this.vel.x + this.vel.y * this.vel.y;
      let maxSpeedSq = this.moveMaxSpeed * this.moveMaxSpeed;

      // Limit to max
      if (speedAfterSq > maxSpeedSq) {
        if (speedBeforeSq <= maxSpeedSq) {
          let afterToMaxMult = sqrt(maxSpeedSq / speedAfterSq);
          this.vel.x *= afterToMaxMult;
          this.vel.y *= afterToMaxMult;

        // Decelerate towards max
        } else {
          let afterToBeforeMult = sqrt(speedBeforeSq / speedAfterSq);
          let beforeToMaxMult = (sqrt(maxSpeedSq / speedBeforeSq) - 1) * this.moveDecelMult + 1;
          this.vel.x *= afterToBeforeMult * beforeToMaxMult;
          this.vel.y *= afterToBeforeMult * beforeToMaxMult;
        }
      }
    }

    // Apply jump force on W
    if (this.game.keyDown[87] && this.isGrounded)
      this.vel.y -= (this.jumpForce / this.mass);

    // Apply gravity force
    this.vel.y += (this.game.G / this.mass);

    // Update position
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // Floor collision
    if ((this.pos.y + this.size * 0.5) > 400) {
      this.vel.y = 0;
      this.pos.y = 400;
      this.isGrounded = true;
    } else this.isGrounded = false;

    // Apply friction against velocity
    if (this.isGrounded && !isMoving) {
      let velMag = sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
      if (velMag < 0.01) {
        this.vel.x = 0;
        this.vel.y = 0;
      } else {
        let frCoeff = 0.3 * (this.isSliding ? 0.25 : 1);
        let frForceMag = frCoeff * this.mass * this.game.G;
        let frForceMult = frForceMag / velMag;
        let frForce = { x: -this.vel.x * frForceMult, y: -this.vel.y * frForceMult };
        this.vel.x += (frForce.x / this.game.G);
        this.vel.y += (frForce.y / this.game.G);
      }
    }
  }


  show() {
    // Show as ellipse
    strokeWeight(this.isSliding ? 4 : 2);
    stroke("#1d1919");
    fill("#423939");
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
  }

  // #endregion
}
