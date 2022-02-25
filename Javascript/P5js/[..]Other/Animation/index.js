
// #region - Setup

// Declare variables
let animations;
let input;
let player;


function preload() {
  // Load assets
  animations = {};
  loadAseSpritesheet(animations, "Assets/", "dudeAnimation");
}


function setup() {
  // Main setup
  createCanvas(800, 800);
  noSmooth();
  setupVariables();
}


function setupVariables() {
  // Initialize variables
  input = new Input();
  player = new Player(100, 100);
}

// #endregion


// #region - Main

function draw() {
  background(200);
  let dt = 1.0 / (60 || frameRate());

  // Update and show
  player.update(dt);
  player.show();

  // Late update and show
  input.draw();
}

// #endregion


class Player {

  // #region - Main

  constructor(px, py) {
    // Declare and initialize variables
    this.animator = new Animator(animations);
    this.stateManager = new StateManager();
    this.pos = { x: px, y: py };
    this.moveDir = { x: 0, y: 0 };
    this.flipped = false;
    this.jumpTimer = [0, 0.5];
    this.initStateManager();
  }


  initStateManager() {
    // Initialize states and connections
    let states = [
      { name: "Idle Stood",   tags: ["Idle", "Grounded"] },
      { name: "Idle Crouch",  tags: ["Idle", "Grounded"] },
      { name: "Walk",         tags: ["Moving", "Grounded"] },
      { name: "Crouch",       tags: ["Moving", "Grounded"] },
      { name: "Jump",         tags: [] }];
    let connections = [
      // { from: { name: "Idle Stood" },     to: { name: "Walk" },          directions: [null, null] },
      // { from: { name: "Idle Crouch" },    to: { name: "Crouch" },        directions: [null, null] },
      // { from: { name: "Idle Stood" },     to: { name: "Idle Crouch" },   directions: [null, null] },
      // { from: { name: "Walk" },           to: { name: "Crouch" },        directions: [null, null] },
      { from: { tags: ["Idle"] },         to: { tags: ["Moving"] },      directions: [null, null] },
      { from: { tags: ["Idle"] },         to: { tags: ["Idle"] },        directions: [null, null] },
      { from: { tags: ["Moving"] },       to: { tags: ["Moving"] },      directions: [null, null] },
      { from: { tags: ["Grounded"] },     to: { name: "Jump" },          directions: ["Tr Ground Jump", "Tr Jump Ground"] }]


    // Add each state and an animation trigger on state reach
    for (let state of states) {
      this.stateManager.addState({
        name: state.name,
        tags: state.tags,
        trigger: (() => {
          this.animator.play(state.name);
      })});
    }

    // For each direction on each connection
    for (let conn of connections) {
      let endStates = [conn.from, conn.to]
      for (let i = 0; i < 2; i++) {
        if (conn.directions[i] !== undefined) {

          // Add a connection between with an animation transition
          this.stateManager.addConnection({
            from: endStates[i],
            to: endStates[1 - i],
            transition: ((callback) => {
              if (conn.directions[i] === null) callback(true);
              else this.animator.play(conn.directions[i], callback);
          })});
        }
      }
    }

    // Set default state
    this.stateManager.gotoState("Idle Stood");
  }


  update(dt) {
    // Get input direction
    let inputDir = {
      x: input.keys.held[37] ? -1 : input.keys.held[39] ? 1 : 0,
      y: input.keys.held[38] ? -1 : input.keys.held[40] ? 1 : 0 };
    let isMoving = inputDir.x != 0 || inputDir.y != 0;
    let isGrounded = this.stateManager.checkState({ tags: ["Grounded"] });
    let isCrouching = input.keys.held[17];


    // Idle stood to walking
    if (this.stateManager.checkState({ name: "Idle Stood" })) {
      if (isMoving) this.stateManager.gotoState("Walk", 0);
      else if (isCrouching) this.stateManager.gotoState("Idle Crouch", 0);
    }

    // Idle crouch to crouching
    if (this.stateManager.checkState({ name: "Idle Crouch" })) {
      if (isMoving) this.stateManager.gotoState("Crouch", 0);
      else if (!isCrouching) this.stateManager.gotoState("Idle Stood", 0);
    }

    // Walk to crouch or idle stood and handle movement
    if (this.stateManager.checkState({ name: "Walk" })) {
      if (!isMoving) this.stateManager.gotoState("Idle Stood", 0);
      else if (isCrouching) this.stateManager.gotoState("Crouch", 0);
      else {
        this.flipped = inputDir.x == 0 ? this.flipped : inputDir.x < 0;
        this.moveDir = inputDir;
        this.pos.x += this.moveDir.x * 4;
        this.pos.y += this.moveDir.y * 4;
      }
    }

    // Crouch to idle crouch or walk and handle movement
    if (this.stateManager.checkState({ name: "Crouch" })) {
      if (!isMoving) this.stateManager.gotoState("Idle Crouch", 0);
      else if (!isCrouching) this.stateManager.gotoState("Walk", 0);
      else {
        this.flipped = inputDir.x == 0 ? this.flipped : inputDir.x < 0;
        this.moveDir = inputDir;
        this.pos.x += this.moveDir.x * 2.5;
        this.pos.y += this.moveDir.y * 2.5;
      }
    }

    // Grounded to jump
    if (isGrounded) {
      if (input.keys.clicked[32]) {
        this.stateManager.gotoState("Jump", 1);
        this.jumpTimer[0] = this.jumpTimer[1];
      }
    }

    // Currently jumping
    if (this.stateManager.checkState({ name: "Jump" }, null)) {
      this.jumpTimer[0] -= dt;
      this.pos.x += this.moveDir.x * 4;
      this.pos.y += this.moveDir.y * 4;
      if (this.jumpTimer[0] <= 0) {
        if (isCrouching) this.stateManager.gotoState("Idle Crouch", 0);
        else this.stateManager.gotoState("Idle Stood", 0);
        this.jumpTimer[0] = 0;
      }
    }

    // Update animator
    this.animator.update(dt);
  }


  show() {
    // Show animator
    this.animator.show(
      this.pos.x, this.pos.y,
      15, this.flipped
    );
  }

  // #endregion
}
