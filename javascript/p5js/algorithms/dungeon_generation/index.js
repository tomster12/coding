
// Fix doors into walls


// #region - Setup

// Main variables
let rPos;
let rooms;

// Config variables
let doorDirections = [[0, -1], [1, 0], [0, 1], [-1, 0]];
let rSize = 35;
let rWallSize = rSize * 0.2;
let rDoorSize = rSize * 0.6;
let multiRoom = true;
let roomChance = 0.5;
let startDelay = 500;
let updateDelay = 7;
let sliders = {};


function setup() {
  // Setup p5.js functions
  createCanvas(700, 700);
  pixelDensity(4);

  // Setup sliders
  let sliderHolder = document.getElementById("info");
  sliders.rSize = createLabelledSlider(sliderHolder, "Room Size", 5, 80, 35);
  sliders.roomChance = createLabelledSlider(sliderHolder, "Room Chance", 0, 1, 0.35);

  // Main variables
  rPos = createVector(width / 2 - rSize / 2, height / 2 - rSize / 2);
  rooms = [];
  resetDungeon();
}


function resetDungeon() {
  // Generate dungeon
  rooms = [];
  rooms.push(new Room(createVector(0, 0), [true, true, true, true]));
  updateRooms();
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
  // Update variables based on sliders
  rSize = sliders.rSize.value();
  rWallSize = rSize * 0.2;
  rDoorSize = rSize * 0.6;

  // Draw all rooms
  background(100);
  for (let room of rooms) room.show();
}


function updateRooms() {
  // Update all current rooms
  let finished = true;
  for (let i = rooms.length - 1; i >= 0; i--) {
    if (!rooms[i].done) {
      finished = false;
      rooms[i].update();
    }
  }

  // Update again if not finished
  if (!finished) setTimeout(() => (updateRooms()), updateDelay);
}


function roomViable(pos) {
  // Check if room is in pos
  for (let room of rooms) {
    if (room.pos.x == pos.x && room.pos.y == pos.y) {
      return false;
    }
  }

  // Check if onscreen
  let pX = (pos.x * rSize) + rPos.x;
  let pY = (pos.y * rSize) + rPos.y;
  return !(pX < 0
    || pX > width - rSize
    || pY < 0
    || pY > height - rSize);
}


function keyPressed() {
  if (keyCode == 32) resetDungeon();
}

// #endregion


class Room {

  // #region - Main

  // Main constructor
  constructor(pos_, doors_) {
    this.pos = pos_;
    this.doors = doors_;
    this.done = false;
    this.randomizeDoors();
  }


  randomizeDoors() {
    // If multiRoom then randomize each direction
    if (multiRoom) {
      for (let i = 0; i < this.doors.length; i++) {
        if (random() < sliders.roomChance.value()) this.doors[i] = true;
      }

    // Else pick 1 random direction
    } else {
      if (random() < sliders.roomChance.value()) {
        this.doors[floor(random(this.doors.length))] = true;
      }
    }
  }


  show() {
    // Get show position
    let pX = (this.pos.x * rSize) + rPos.x;
    let pY = (this.pos.y * rSize) + rPos.y;

    // Show outline
    noStroke();
    fill(200);
    rect(pX, pY, rSize, rSize);

    // Cull inside
    noStroke();
    fill(100);
    rect(pX + rWallSize, pY + rWallSize, rSize - rWallSize * 2, rSize - rWallSize * 2);

    // Draw doors
    if (this.doors[0]) rect(pX + (rSize - rDoorSize) / 2, pY, rDoorSize, rWallSize);
    if (this.doors[1]) rect(pX + rSize - rWallSize, pY + (rSize - rDoorSize) / 2, rWallSize, rDoorSize);
    if (this.doors[2]) rect(pX + (rSize - rDoorSize) / 2, pY + rSize - rWallSize, rDoorSize, rWallSize);
    if (this.doors[3]) rect(pX, pY + (rSize - rDoorSize) / 2, rWallSize, rDoorSize);
  }


  update() {
    // For each door, create room if no other room
    for (let i = 0; i < this.doors.length; i++) {
      if (this.doors[i]) {
        let newPos = createVector(
          this.pos.x + doorDirections[i][0],
          this.pos.y + doorDirections[i][1]
        );
        if (roomViable(newPos)) {
          rooms.push(new Room(
            newPos,
            [ (i == 2)?true:false,
              (i == 3)?true:false,
              (i == 0)?true:false,
              (i == 1)?true:false ]
          ));
        }
      }
    }
    this.done = true;
  }

  // #endregion
}
