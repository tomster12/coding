

// TODO:
//  - Abstract Player / Enemy into Actor class
//  - Add lerped movement to Player / Enemy making use of isActing
//  - Bump animation for running into walls for players and enemies
//  - Try simple AI for enemies following player


// #region - Setup

// Globals
let ASSETS;
let INPUT;
let GAME;


function preload() {
  ASSETS = {};

  // Load tilesets
  ASSETS.tilesets = {};
  ASSETS.tilesets["main"] = new Tileset();
  loadImage("assets/main_tileset.png", img => {
    ASSETS.tilesets["main"].setImage(img);
    loadJSON("assets/main_tileset.json", json => {
      ASSETS.tilesets["main"].setJSON(json);
    });
  });
}


function setup() {
  createCanvas(1200, 720);
  imageMode(CENTER);
  angleMode(DEGREES);
  noSmooth();

  // Initialize globals
  INPUT = new Input();
  GAME = new Game();
}


// Driver code
function draw() {
  GAME.draw();
  INPUT.draw();
}

// #endregion


class Game {

  constructor() {
    // Initialize variables
    this.grid = new Grid();
    this.tilemap = new Tilemap(this);
    this.player = new Player(this, 2, 2);
    this.cam = new Camera(this);

    this.actors = [];
    this.turnCounter = 0;
    this.isReady = true;

    // Add initial actors
    this.actors.push(new Enemy(this, 4, 1));
    this.actors.push(new Enemy(this, 4, 2));
    this.actors.push(new Enemy(this, 5, 3));
    this.actors.push(new Enemy(this, 4, 3));
    this.actors.push(this.player);
  }


  draw() {
    this.update();
    this.show();
  }


  update() {
    // Check if turn complete
    if (!this.isReady) {
      let finished = true;
      for (let actor of this.actors) {
        if (!actor.getFinished()) finished = false;
      }

      // If all actors finished then complete
      if (finished) this.isReady = true;
    }
  }


  show() {
    background(240);

    // Update then translate to camera position
    this.cam.update();
    this.cam.translate();

    // Show tilemap
    this.tilemap.show();

    // Update and show all actors
    for (let actor of this.actors) actor.update();
    for (let actor of this.actors) actor.show();
  }


  requestTurn() {
    // Check turn possible
    if (!this.isReady) return false;

    // Perform turn
    this.isReady = false;
    this.turnCounter++;
    console.log("Turn " + this.turnCounter);
    for (let actor of this.actors) actor.performTurn();
  }


  getReady() { return this.isReady; }
}


class Grid {

  // Declare constants
  OFFSET = { x: 40, y: 40 };
  GRID_SIZE = 60;


  gridToWorld(pos, centre=false) {
    // Convert world to grid coordinates
    return {
      x: this.OFFSET.x + (pos.x + (centre ? 0.5 : 0)) * this.GRID_SIZE,
      y: this.OFFSET.y + (pos.y + (centre ? 0.5 : 0)) * this.GRID_SIZE
    };
  }


  worldToGrid(pos) {
    // Convert grid to world coordinates
    return {
      x: (pos.x - this.OFFSET.x) / this.GRID_SIZE,
      y: (pos.y - this.OFFSET.y) / this.GRID_SIZE
    };
  }
}


class Tileset {

  setImage(img) { this.img = img; }


  setJSON(json) {
    // Initialize variables
    this.width = json.width;
    this.height = json.height;
    this.tilesize = this.img.width / this.width;
    this.tiles = [];

    // Split image into tiles
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let subimg = this.img.get(
          this.tilesize * x, this.tilesize * y,
          this.tilesize, this.tilesize);
        this.tiles.push({
          img: subimg,
          collision: json.collision[x + y * this.width]
        });
      }
    }
  }
}


class Tilemap {

  constructor(game) {
    // Initialize variables
    this.game = game;
    this.tileset = ASSETS.tilesets["main"];
    this.tiles = {};

    // Populate initial tiles
    this.tiles["0,0"] = { index: 0, rot: 1 };
    this.tiles["1,0"] = { index: 1, rot: 2 };
    this.tiles["2,0"] = { index: 1, rot: 2 };
    this.tiles["3,0"] = { index: 2, rot: 1 };
    this.tiles["4,0"] = { index: 3, rot: 0 };
    this.tiles["5,0"] = { index: 2, rot: 2 };
    this.tiles["6,0"] = { index: 0, rot: 2 };

    this.tiles["0,1"] = { index: 2, rot: 1 };
    this.tiles["1,1"] = { index: 3, rot: 0 };
    this.tiles["2,1"] = { index: 3, rot: 0 };
    this.tiles["3,1"] = { index: 3, rot: 0 };
    this.tiles["4,1"] = { index: 3, rot: 0 };
    this.tiles["5,1"] = { index: 3, rot: 0 };
    this.tiles["6,1"] = { index: 1, rot: 3 };

    this.tiles["0,2"] = { index: 3, rot: 0 };
    this.tiles["1,2"] = { index: 3, rot: 0 };
    this.tiles["2,2"] = { index: 3, rot: 0 };
    this.tiles["3,2"] = { index: 3, rot: 0 };
    this.tiles["4,2"] = { index: 3, rot: 0 };
    this.tiles["5,2"] = { index: 3, rot: 0 };
    this.tiles["6,2"] = { index: 1, rot: 3 };

    this.tiles["0,3"] = { index: 2, rot: 0 };
    this.tiles["1,3"] = { index: 3, rot: 0 };
    this.tiles["2,3"] = { index: 3, rot: 0 };
    this.tiles["3,3"] = { index: 3, rot: 0 };
    this.tiles["4,3"] = { index: 3, rot: 0 };
    this.tiles["5,3"] = { index: 3, rot: 0 };
    this.tiles["6,3"] = { index: 1, rot: 3 };

    this.tiles["0,4"] = { index: 1, rot: 1 };
    this.tiles["1,4"] = { index: 3, rot: 0 };
    this.tiles["2,4"] = { index: 3, rot: 0 };
    this.tiles["3,4"] = { index: 3, rot: 0 };
    this.tiles["4,4"] = { index: 3, rot: 0 };
    this.tiles["5,4"] = { index: 3, rot: 0 };
    this.tiles["6,4"] = { index: 1, rot: 3 };

    this.tiles["0,5"] = { index: 0, rot: 0 };
    this.tiles["1,5"] = { index: 1, rot: 0 };
    this.tiles["2,5"] = { index: 1, rot: 0 };
    this.tiles["3,5"] = { index: 1, rot: 0 };
    this.tiles["4,5"] = { index: 1, rot: 0 };
    this.tiles["5,5"] = { index: 1, rot: 0 };
    this.tiles["6,5"] = { index: 0, rot: -1 };
  }


  show() {
    // Loop over each tile in each position
    let gridSize = this.game.grid.GRID_SIZE;
    for (const [key, value] of Object.entries(this.tiles)) {
      let gridPos = this.keyToGridPos(key);
      let pos = this.game.grid.gridToWorld(gridPos, true);
      let tile = this.tileset.tiles[value.index];

      // Correctly place / rotate tile image
      push();
      translate(pos.x, pos.y);
      rotate(value.rot * 90);
      image(tile.img, 0, 0, gridSize + 1, gridSize + 1);
      pop();
    }
  }


  collidesAt(gridPos) {
    // Check if there is collision at a grid position
    let key = this.gridPosToKey(gridPos);
    if (this.tiles[key] == null) return false;
    return this.tileset.tiles[this.tiles[key].index].collision;
  }


  gridPosToKey(gridPos) { return floor(gridPos.x) + "," + floor(gridPos.y); }
  keyToGridPos(key) { let [x, y] = key.split(","); return { x: parseInt(x), y: parseInt(y) }; }
}


class Player {

  constructor(game, startGridX, startGridY) {
    // Initialize variables
    this.game = game;
    this.gridPos = { x: startGridX, y: startGridY };
    this.size = 20;

    this.isActing = false;
    this.turnAction = null;
  }


  update() {
    this.updateMovement();
  }


  updateMovement() {
    if (!this.game.isReady) return;

    // Detect WASD movement
    let inputDir = { x: 0, y: 0 };
    if (INPUT.keys.clicked[65]) inputDir.x--;
    else if (INPUT.keys.clicked[68]) inputDir.x++;
    else if (INPUT.keys.clicked[83]) inputDir.y++;
    else if (INPUT.keys.clicked[87]) inputDir.y--;
    if (inputDir.x == 0 && inputDir.y == 0) return;

    // Set turn action and request turn
    this.turnAction = { type: "MOVE", dir: inputDir };
    this.game.requestTurn();
  }


  show() {
    // Draw at grid pos
    let worldPos = this.game.grid.gridToWorld(this.gridPos, true);
    strokeWeight(5);
    stroke("#585858");
    fill("#999999");
    ellipse(worldPos.x, worldPos.y, this.size, this.size);
  }


  performTurn() {
    // Update variables
    this.isActing = true;


    // - Movement action
    if (this.turnAction.type == "MOVE") {

      let newGridPos = {
        x: this.gridPos.x + this.turnAction.dir.x,
        y: this.gridPos.y + this.turnAction.dir.y };
      if (!this.game.tilemap.collidesAt(newGridPos)) this.gridPos = newGridPos;

      this.isActing = false;
      this.turnAction = null;
    }
  }


  getFinished() { return !this.acting; }
}


class Enemy {

  constructor(game, startGridX, startGridY) {
    // Initialize variables
    this.game = game;
    this.gridPos = { x: startGridX, y: startGridY };
    this.size = 15;

    this.isActing = false;
    this.turnAction = null;
  }


  update() {}


  show() {
    // Draw at grid pos
    let worldPos = this.game.grid.gridToWorld(this.gridPos, true);
    strokeWeight(5);
    stroke("#585858");
    fill("#999999");
    ellipse(worldPos.x, worldPos.y, this.size, this.size);
  }


  performTurn() {
    // Update variables
    this.isReady = false;
    this.isActing = true;


    // Move in random direction
    if (random() < 0.5)
      this.turnAction = { type: "MOVE", dir: { x: floor(random() * 2) * 2 - 1, y: 0 } };
    else this.turnAction = { type: "MOVE", dir: { x: 0, y: floor(random() * 2) * 2 - 1 } };


    // - Movement action
    if (this.turnAction.type == "MOVE") {

      let newGridPos = {
        x: this.gridPos.x + this.turnAction.dir.x,
        y: this.gridPos.y + this.turnAction.dir.y };
      if (!this.game.tilemap.collidesAt(newGridPos)) this.gridPos = newGridPos;

      this.isActing = false;
      this.turnAction = null;
    }
  }


  getFinished() { return !this.isActing; }
}


class Camera {

  // Declare constants
  MOVEMENT_LERP = 0.075;


  constructor(game) {
    // Initialize variables
    this.game = game;
    this.pos = { x: 0, y: 0 };
    this.targetPos = { x: 0, y: 0 };

    // Set to target
    let target = this.game.grid.gridToWorld(this.game.player.gridPos, true);
    this.targetPos.x = target.x;
    this.targetPos.y = target.y;
    this.pos.x = this.targetPos.x;
    this.pos.y = this.targetPos.y;
  }


  update() {
    // Follow player
    let target = this.game.grid.gridToWorld(this.game.player.gridPos, true);
    this.targetPos.x = target.x;
    this.targetPos.y = target.y;

    // Move towards target
    this.pos.x += (this.targetPos.x - this.pos.x) * this.MOVEMENT_LERP;
    this.pos.y += (this.targetPos.y - this.pos.y) * this.MOVEMENT_LERP;
  }


  translate() {
    // Move camera to curent position
    translate(
      width * 0.5 - this.pos.x,
      height * 0.5 - this.pos.y
    );
  }
}
