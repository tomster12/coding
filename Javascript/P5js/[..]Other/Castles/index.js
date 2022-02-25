
// #region - Main

// Declare variables
let castles = [];

function setup() {
  createCanvas(800, 800);
  generateCastles();
}


function generateCastles() {
  // Generate all castles
  for (let i = 0; i < 40; i++) {

    // Create new castle
    castles.push(new Castle(0,
      { x: random() * width, y: (0.3 + random() * 0.7) * height },
      random() * 70 + 80
    ));
  }
}


function draw() {
  background(255);

  // Show all castles
  castles.sort((a, b) => a.pos.y > b.pos.y);
  for (let castle of castles) castle.show();
}

// #endregion


class Castle {

  // #region - Main

  constructor(type_, pos_, width_) {
    // Initialize variables
    this.type = type_;
    this.pos = pos_;
    this.width = width_;
  }


  show() {
    // Show as rect
    strokeWeight(2);
    stroke(0)
    fill(255);
    rect(this.pos.x, this.pos.y, this.width, height);
  }

  // #endregion
}
