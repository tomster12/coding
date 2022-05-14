

//        ---- Development Tracking ----
//
//      -- Overall Gaols --
//
//  - Turn based, procedural levels, tilemap, pixel art
//  - Group of members, cooldown based attacking
//  - Encouterable traps leading to interesting movement puzzles
//  - XP based powerups, as well as purchasable / findable items
//  - Progressively increasing difficulty / infinite levels
//
//      -- Ver 0.1 --
//
//  ./ - Abstract Player / Enemy into Actor class
//  ./ - Add lerped movement to Player / Enemy making use of isActing
//  ./ - Bump animation for running into walls for players and enemies
//  ./ - Tilemap editor and small graphical improvements
//  X  - Try simple AI for enemies following player
//
//      -- Ver 0.2 --
//
//  X  - Group members able to attack seperately
//  X  - Group member health bars and death
//  X  - Enemy hover intentions
//  X  - UI for [ currency, each group member stats, XP, current floor ]
//
//      -- Ver 0.3 --
//
//  X  - Particle effects for enemy death / xp gain
//  X  - Enemy drop currency at location which can be picked up
//  X  - [!] Procedural map generation
//
//      -------------


// #region - Setup

// Globals
let EDITOR_MODE = false;
let ASSETS;
let INPUT;
let GAME;
let EDITOR;


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

  // Load images
  ASSETS.images = {};
  loadImage("assets/tick.png", img => { ASSETS.images["tick"] = img; });
  loadImage("assets/wait.png", img => { ASSETS.images["wait"] = img; });
}


function setup() {
  createCanvas(1200, 720);
  imageMode(CENTER);
  angleMode(DEGREES);
  textAlign(CENTER);
  noSmooth();

  // Initialize globals
  INPUT = new Input();
  if (EDITOR_MODE) EDITOR = new Editor();
  else GAME = new Game();
}


function draw() {
  // Call draw on main globals
  if (EDITOR_MODE) EDITOR.draw();
  else GAME.draw();
  INPUT.draw();
}


function enterEditor() {
  // Create editor and enter
  EDITOR_MODE = true;
  if (EDITOR == null) EDITOR = new Editor();
}


function exitEditor() {
  // Close editor mode
  EDITOR_MODE = false;
  if (GAME == null) GAME = new Game();
}

// #endregion


// #region - Utility

let getMousePos = () => { return { x: mouseX, y: mouseY }; };

let getDt = () => frameRate() != 0 ? 1 / frameRate() : 0;

let getEmptyXY = () => { return { x: 0, y: 0 }; };

let compareXY = (a, b) => a.x == b.x && a.y == b.y;


async function asSaveJSON(data, filename) {
  return new Promise((res, rej) => {
    saveJSON(data, filename, (err, data) => {
      if (err) return rej(err);
      res(data);
    });
  })
}

async function asLoadJSON(filename) {
  return new Promise((res, rej) => {
    loadJSON(filename, (data) => { res(data); });
  })
}

// #endregion


class Editor {

  // Declare constants
  MOUSE_LERP = 0.3;


  constructor() {
    // Initialize variables
    this.grid = new Grid();
    this.tilemap = new Tilemap(this, ASSETS.tilesets["main"]);
    this.mouseGridPos = null;
    this.mouseWorldPos = null;
    this.mouseWorldPosTarget = null;
    this.currentIndex = 0;
    this.currentRotation = 0;
    this.cameraPosition = getEmptyXY();
  }


  draw() {
    this.update();
    this.show();
  }


  update() {
    // Update mouse gridPos
    let mousePos = getMousePos();
    mousePos.x += this.cameraPosition.x;
    mousePos.y += this.cameraPosition.y;
    this.mouseGridPos = this.grid.worldToGrid(mousePos);
    this.mouseGridPos.x = floor(this.mouseGridPos.x);
    this.mouseGridPos.y = floor(this.mouseGridPos.y);

    // Scroll through potential indices
    this.currentIndex += INPUT.mouseWheel > 0 ? 1 : INPUT.mouseWheel < 0 ? -1 : 0;
    this.currentIndex = (this.currentIndex + this.tilemap.tileset.count) % this.tilemap.tileset.count;

    // Rotate tile on right click
    if (INPUT.mouse.clicked.right) this.currentRotation = (this.currentRotation + 1) % 4;

    // Add / remove tile on left click
    if (INPUT.mouse.clicked.left) {
      if (this.tilemap.hasTile(this.mouseGridPos)) this.tilemap.removeTile(this.mouseGridPos);
      else this.tilemap.addTile(this.currentIndex, this.mouseGridPos, this.currentRotation);
    }

    // Move camera with arrow keys
    if (INPUT.keys.held[37]) this.cameraPosition.x -= 2.5;
    if (INPUT.keys.held[38]) this.cameraPosition.y -= 2.5;
    if (INPUT.keys.held[39]) this.cameraPosition.x += 2.5;
    if (INPUT.keys.held[40]) this.cameraPosition.y += 2.5;

    // Set mouseWorldPosTarget and move towards
    this.mouseWorldPosTarget = this.grid.gridToWorld(this.mouseGridPos, true);
    if (this.mouseWorldPos == null) this.mouseWorldPos = this.mouseWorldPosTarget;
    else {
      this.mouseWorldPos.x += (this.mouseWorldPosTarget.x - this.mouseWorldPos.x) * this.MOUSE_LERP;
      this.mouseWorldPos.y += (this.mouseWorldPosTarget.y - this.mouseWorldPos.y) * this.MOUSE_LERP;
    }

    // Save / load tilemap on s / l
    if (INPUT.keys.clicked[83]) {
      this.tilemap.saveToFile("editor_tilemap.json");
    } else if (INPUT.keys.clicked[76]) {
      this.tilemap.loadFromFile("editor_tilemap.json");
    }
  }


  show() {
    background("#ef8eff");

    // Translate by camera
    translate(-this.cameraPosition.x, -this.cameraPosition.y);

    // Show tilemap
    this.tilemap.show();

    // Show square on mouseWorldPos
    let tile = this.tilemap.tileset.tiles[this.currentIndex];
    push();
    translate(this.mouseWorldPos.x, this.mouseWorldPos.y);
    rotate(this.currentRotation * 90);
    image(tile.img, 0, 0, this.grid.GRID_SIZE, this.grid.GRID_SIZE);
    pop();
  }
}


class Game {

  constructor() {
    (async () => {

      // Initialize variables
      this.grid = new Grid();
      this.tilemap = new Tilemap(this, ASSETS.tilesets["main"]);
      await this.tilemap.loadFromFile("editor_tilemap.json");
      this.player = new Player(this, 2, 2);
      this.cam = new PlayerCamera(this);
      this.turnIcon = {
        basePos: { x: 50, y: height - 50 },
        size: 90,
        bouncePct: 1,
        angle: 0
      };

      this.actors = [];
      this.ui = [];
      this.notifications = [];
      this.turnCounter = 0;
      this.isLoaded = true;
      this.isReady = true;

      // Add initial actors
      this.actors.push(new Enemy(this, 4, 1));
      this.actors.push(new Enemy(this, 4, 2));
      this.actors.push(new Enemy(this, 4, 3));
      this.actors.push(new Enemy(this, 5, 3));
      this.actors.push(this.player);
    })();
  }


  draw() {
    this.update();
    this.show();
  }


  update() {
    if (!this.isLoaded) return;

    // Update all ui / actors
    for (let ui of this.ui) ui.update();
    for (let actor of this.actors) actor.update();
    for (let notif of this.notifications) notif.update();

    // Check if turn complete
    if (!this.isReady) {
      this.isReady = true;
      for (let actor of this.actors) {
        if (!actor.getFinished()) this.isReady = false;
      }
      if (this.isReady) {
        this.turnIcon.bouncePct = 0;
      }
    }
  }


  show() {
    background("#AFAFAF");

    // Show loading
    if (!this.isLoaded) {
      this.showLoading();
      return;
    }

    // Show turn icon
    this.showTurnIcon();

    // Perform camera transform
    this.cam.update();
    this.cam.translate();

    // Show tilemap
    this.tilemap.show();

    // Show all actors / ui
    for (let actor of this.actors) actor.show();
    for (let ui of this.ui) ui.show();
    for (let notif of this.notifications) notif.show();
  }

  showLoading() {
    background(240);

    // Loading text
    text("Loading...", width * 0.5, height * 0.5);
  }

  showTurnIcon() {
    // Set image based on turn state
    let img;
    if (this.isReady) img = ASSETS.images["tick"];
    else img = ASSETS.images["wait"];

    // Set position based on bounce
    let pos = { x: this.turnIcon.basePos.x, y: this.turnIcon.basePos.y };
    pos.y -= sin(this.turnIcon.bouncePct * 180) * 15;
    this.turnIcon.bouncePct = min(1, this.turnIcon.bouncePct + 3 * getDt());

    // Set angle if waiting
    let angle;
    this.turnIcon.angle += 0.25 * 360 * getDt();
    if (this.isReady) angle = 0;
    else angle = this.turnIcon.angle;

    // Translate and draw
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    image(img, 0, 0, this.turnIcon.size, this.turnIcon.size);
    pop();
  }


  requestTurn() {
    // Check turn possible
    if (!this.isReady) return false;

    // Perform turn
    this.isReady = false;
    this.turnCounter++;
    for (let actor of this.actors) actor.performTurn();
  }


  addNotification(image, pos, size) {
    // Add notification
    let notif = new Notification(this, image, pos, size, 0.6, 0);
    this.notifications.push(notif);
  }

  removeNotification(notif) {
    // Remove notification
    this.notifications.splice(this.notifications.indexOf(notif), 1);
  }


  getGridActorNow(gridPos) {
    // Check if there are any actors at the position
    for (let actor of this.actors) {
      if (compareXY(gridPos, actor.getGridPosNow())) return actor;
    }
    return null;
  }

  getGridActorNext(gridPos) {
    // Check if there are any actors at the position
    for (let actor of this.actors) {
      if (compareXY(gridPos, actor.getGridPosNext())) return actor;
    }
    return null;
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
    this.count = this.width * this.height;
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

  constructor(game, tileset) {
    // Initialize variables
    this.game = game;
    this.tileset = tileset;
    this.tiles = {};
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
      image(tile.img, 0, 0, gridSize, gridSize);
      pop();
    }
  }


  addTile(index, gridPos, rot) {
    // Add a new tile at the position
    let key = this.gridPosToKey(gridPos);
    this.tiles[key] = { index, rot };
  }

  hasTile(gridPos) {
    // Check for a tile at given position
    let key = this.gridPosToKey(gridPos);
    return this.tiles[key] != null;
  }

  removeTile(gridPos) {
    // Remove a tile at given position
    let key = this.gridPosToKey(gridPos);
    delete this.tiles[key];
  }


  async loadFromFile(filename) {
    // Load tiles from a file
    this.tiles = await asLoadJSON("assets/" + filename);
  }

  async saveToFile(filename) {
    // Save tiles to a file
    await asSaveJSON(this.tiles, filename);
  }


  getGridCollision(gridPos) {
    // Check if there is collision at a grid position
    let key = this.gridPosToKey(gridPos);
    if (this.tiles[key] == null) return false;
    return this.tileset.tiles[this.tiles[key].index].collision;
  }


  gridPosToKey(gridPos) { return floor(gridPos.x) + "," + floor(gridPos.y); }
  keyToGridPos(key) { let [x, y] = key.split(","); return { x: parseInt(x), y: parseInt(y) }; }
}


class Actor {

  // Declare constants
  BUMP_SPEED = 4.5;


  constructor(game, startGridX, startGridY, size) {
    // Initialize variables
    this.game = game;
    this.size = size;
    this.gridPos = { x: startGridX, y: startGridY };

    this.group = [];
    this.groupData = {
      count: 0,
      angleOffset: random() * 360
    };

    this.isActing = false;
    this.turnAction = null;
    this.turnActionOpacity = 0;
  }


  update() {
    // Update group and turns
    for (let member of this.group) member.update();
    if (this.isActing) this.updateTurn();
  }


  show() {
    // Show all group
    for (let member of this.group) member.show();
  }

  performTurn() {
    // Update variables
    this.isActing = true;

    // Movement action
    if (this.turnAction.type == "MOVE") {
      let newGridPos = {
        x: this.gridPos.x + this.turnAction.dir.x,
        y: this.gridPos.y + this.turnAction.dir.y };
      this.gridPos = newGridPos;

    // Bump action
    } else if (this.turnAction.type == "BUMP") {
      this.turnAction.bumpTimer = 0;
    }
  }

  updateTurn() {
    // Movement action
    if (this.turnAction.type == "MOVE") {
      let allReady = true;
      for (let member of this.group) {
        if (!member.isReady) allReady = false;
      }
      if (allReady) {
        this.isActing = false;
        this.turnAction = null;
      }

    // Bump action
    } else if (this.turnAction.type == "BUMP") {
      this.turnAction.bumpTimer += this.BUMP_SPEED / frameRate();

      if (this.turnAction.bumpTimer > 1.0) {
        this.isActing = false;
        this.turnAction = null;
      }
    }
  }


  checkMovement(dir) {
    // Get new position
    let newGridPos = {
      x: this.gridPos.x + dir.x,
      y: this.gridPos.y + dir.y
    };

    // Get all grid states
    let collision = this.game.tilemap.getGridCollision(newGridPos);
    let actorNow = this.game.getGridActorNow(newGridPos);
    let actorNext = this.game.getGridActorNext(newGridPos);

    // Return type based on grid state
    let info = { type: 0 };
    if (collision) info.type = 1;
    else if (actorNext != null && actorNext != this) { info.type = 3; info.actor = actorNext; }
    else if (actorNow != null && actorNow.getTeam() != this.getTeam()) { info.type = 2; info.actor = actorNow; }
    return info;
  }


  updateMemberData() {
    // Pass in member data
    this.groupData.count = this.group.length;
    for (let i = 0; i < this.group.length; i++) {
      let memberData = {
        index: i,
        groupData: this.groupData };
      this.group[i].setMemberData(memberData);
    };
  }


  getGridPosNow() {
    // Return current pos
    return {
      x: this.gridPos.x,
      y: this.gridPos.y
    }
  }

  getGridPosNext() {
    // Movement action - return pos after
    if (this.turnAction != null && this.turnAction.type == "MOVE") {
      return {
        x: this.gridPos.x + this.turnAction.dir.x,
        y: this.gridPos.y + this.turnAction.dir.y
      };

    // No action - return current pos
    } else return this.getGridPosNow();
  }

  getTeam() { return -1; }

  getFinished() { return !this.isActing; }
}

class Player extends Actor {

  constructor(game, startGridX, startGridY) {
    super(game, startGridX, startGridY);

    // Add group
    this.group.push(new Member(game, this, color("#6a6a6a"), 20));
    this.group.push(new Member(game, this, color("#6a6a6a"), 20));
    this.group.push(new Member(game, this, color("#6a6a6a"), 20));
    this.updateMemberData();
  }


  update() {
    super.update();
    this.handleInput();
  }


  handleInput() {
    if (!this.game.isReady) return;

    // Detect WASD input
    let inputDir = { x: 0, y: 0 };
    if (INPUT.keys.clicked[65]) inputDir.x--;
    else if (INPUT.keys.clicked[68]) inputDir.x++;
    else if (INPUT.keys.clicked[83]) inputDir.y++;
    else if (INPUT.keys.clicked[87]) inputDir.y--;
    if (inputDir.x == 0 && inputDir.y == 0) return;

    // Figure out what action and request turn
    let moveInfo = this.checkMovement(inputDir);
    if (moveInfo.type == 0) this.turnAction = { type: "MOVE", dir: inputDir };
    else this.turnAction = { type: "BUMP", dir: inputDir };
    this.game.requestTurn();
  }


  getTeam() { return 0; }
}

class Enemy extends Actor {

  constructor(game, startGridX, startGridY) {
    super(game, startGridX, startGridY);

    // Add group
    if (random() < 0.5) {
      this.group.push(new Member(game, this, color("#c46666"), 11));
      this.group.push(new Member(game, this, color("#c46666"), 11));
    } else {
      this.group.push(new Member(game, this, color("#c46666"), 15));
    }
    this.updateMemberData();
  }


  update() {
    super.update();

    // Pick a random direction
    if (this.turnAction == null) {
      let dir = getEmptyXY();
      if (random() < 0.5) dir.x = floor(random() * 2) * 2 - 1;
      else dir.y = floor(random() * 2) * 2 - 1;

      let moveInfo = this.checkMovement(dir);
      if (moveInfo.type == 0) this.turnAction = { type: "MOVE", dir: dir };
      else this.turnAction = { type: "BUMP", dir: dir };
    }
  }


  getTeam() { return 1; }
}

class Member {

  // Declare constants
  MOVEMENT_SPEED = [0.09, 0.11];
  POSITION_DELTA = 0.1;


  constructor(game, actor, fillColor, size) {
    // Initialize variables
    this.game = game;
    this.actor = actor;
    this.fillColor = fillColor;
    this.strokeColor = color(
      red(this.fillColor) * 0.7,
      green(this.fillColor) * 0.7,
      blue(this.fillColor) * 0.7);
    this.size = size;
    this.movementSpeed = this.MOVEMENT_SPEED[0] + random() * (this.MOVEMENT_SPEED[1] - this.MOVEMENT_SPEED[0]);

    this.currentGridPos = { x: this.actor.gridPos.x, y: this.actor.gridPos.y };
    this.targetGridPos = { x: this.currentGridPos.x, y: this.currentGridPos.y };
    this.memberData = { };
    this.isReady = true;
  }


  update(memberIndex) {
    // Set target as actor position
    this.targetGridPos = {
      x: this.actor.gridPos.x,
      y: this.actor.gridPos.y };

    // Position in circle if in group
    if (this.memberData.groupData.count > 1) {
      let angle = (this.memberData.index / this.memberData.groupData.count) * 360 + this.memberData.groupData.angleOffset;
      let r = 0.5 * (this.size / this.game.grid.GRID_SIZE) + 0.1;
      this.targetGridPos.x += r * cos(angle);
      this.targetGridPos.y += r * sin(angle);
    }


    // Handle actor actions
    if (this.actor.isActing) {

      // Bump action
      if (this.actor.turnAction.type == "BUMP") {
        this.targetGridPos.x += this.actor.turnAction.dir.x * 0.2;
        this.targetGridPos.y += this.actor.turnAction.dir.y * 0.2;
      }
    }


    // Move towards target
    let dx = (this.targetGridPos.x - this.currentGridPos.x);
    let dy = (this.targetGridPos.y - this.currentGridPos.y);
    this.currentGridPos.x += dx * this.movementSpeed;
    this.currentGridPos.y += dy * this.movementSpeed;
    this.isReady = (dx * dx + dy * dy) < (this.POSITION_DELTA * this.POSITION_DELTA);
  }


  show() {
    // Draw at grid pos
    let worldPos = this.game.grid.gridToWorld(this.currentGridPos, true);
    strokeWeight(5);
    stroke(this.strokeColor);
    fill(this.fillColor);
    ellipse(worldPos.x, worldPos.y, this.size, this.size);
  }


  setMemberData(memberData) { this.memberData = memberData; }
}


class PlayerCamera {

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


class Notification {

  constructor(game, image, pos, size, timerMax, travelDistance) {
    // Initialize variables
    this.game = game;
    this.image = image;
    this.pos = pos;
    this.startY = this.pos.y;
    this.size = size;
    this.timer = 0;
    this.timerMax = timerMax;
    this.travelDistance = travelDistance;
  }


  update() {
    // Calculate pct
    let pct = this.timer / this.timerMax;

    // Travel upwards
    this.pos.y = this.startY - this.travelDistance * pct;

    // Update timer
    this.timer += 1 / frameRate();
    if (this.timer > this.timerMax) this.game.removeNotification(this);
  }


  show() {
    // Show image at current location
    image(this.image, this.pos.x, this.pos.y, this.size, this.size);
  }
}
