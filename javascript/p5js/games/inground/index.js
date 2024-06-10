
// #region - Setup

// Constants
GRID_SIZE = 80;


// Declare variables
let animations;
let input;
let grid;
let objects;


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
  grid = new Grid({ x: 10, y: 10 }, GRID_SIZE);
  objects = [];

  // Populate dudes
  objects.push(new Dude(grid, { x: 0, y: 0 }, GRID_SIZE * 0.08));
}

// #endregion


// #region - Main

function draw() {
  background(200);
  let dt = 1.0 / (60 || frameRate());

  // Update
  for (let obj of objects) obj.update(dt);

  // Late update
  input.draw();

  // Show
  for (let obj of objects) obj.show();
  grid.show(4, 4);
}

// #endregion


class Grid {

  // #region - Main

  constructor(worldPos_, size_) {
    // Declare and initialize variables
    this.worldPos = worldPos_;
    this.size = size_;
  }


  getGridPos(worldPos) {
    // Returns a grid pos given a world pos
    let x = floor((worldPos.x - this.worldPos.x) / this.size);
    let y = floor((worldPos.y - this.worldPos.y) / this.size);
    return { x, y };
  }


  getWorldPos(gridPos) {
    // Returns a world pos given a grid pos
    let x = gridPos.x * this.size + this.worldPos.x;
    let y = gridPos.y * this.size + this.worldPos.y;
    return { x, y };
  }


  show(width, height) {
    // Show with given size
    stroke(0);
    noFill();
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        rect(
          this.worldPos.x + x * this.size,
          this.worldPos.y + y * this.size,
          this.size, this.size
        );
      }
    }
  }

  // #endregion
}


class Dude {

  // #region - Setup

  constructor(grid_, gridPos_, scale_) {
    // Declare and variables
    this.animator = new AnimationManager(animations);
    this.grid = grid_;
    this.gridPos = gridPos_;
    this.scale = scale_;
    this.initAnimations();
  }


  initAnimations() {
    // Set states and connections then set default state
    this.animator.addAnimatedState({ name: "Idle1" });
    this.animator.addAnimatedState({ name: "Walk" });
    this.animator.addAnimatedConnection(
      { from: { name: "Idle1" }, to: { name: "Walk" }, directions: [null, null] });
    this.animator.gotoState("Idle1");
  }

  // #endregion


  // #region - Main

  update(dt) {
    // Idling
    if (this.animator.checkState({ name: "Idle1" })) {
      if (input.keys.held[39]) this.animator.gotoState("Walk");

    // Moving
    } else if (this.animator.checkState({ name: "Walk" })) {
      if (!input.keys.held[39]) this.animator.gotoState("Idle1");
      else this.gridPos.x += dt * 0.6;
    }

    // Update animator
    this.animator.update(dt);
  }


  show() {
    // Get world position
    let worldPos = this.grid.getWorldPos({
      x: this.gridPos.x + 0.5,
      y: this.gridPos.y + 1 });

    // Show animator
    this.animator.show(
      worldPos.x, worldPos.y,
      this.scale, false
    );
  }

  // #endregion
}