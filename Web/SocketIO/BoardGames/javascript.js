

// #region - Socket Functions

// Connect to server
let socket = io.connect();

// #endregion


// #region - Main

// Declare variables
let app;


function setup() {
  // Initial Canvas
  createCanvas(windowWidth, windowHeight);

  // Initialize App object
  app = new App();
}


function windowResized() {
  // Resize canvas to match window
  resizeCanvas(windowWidth, windowHeight);
}


function draw() {
  // Update app
  app.draw();
}

// #endregion


// #region - Other

function checkBounds(x, y, p, s) {
  // Check whether a point is within bounds
  return x > p.x - s.x * 0.5
  && x < p.x + s.x * 0.5
  && y > p.y - s.y * 0.5
  && y < p.y + s.y * 0.5;
}


function vRect(p, s) {
  // Draw a rect using vectors
  rect(p.x, p.y, s.x, s.y);
}


function refRect({ pos, size }, px, py, sx, sy) {
  // Draw a rect with reference and values
  rect(
    pos.x + size.x * px,
    pos.y + size.y * py,
    size.x * sx,
    size.y * sy
  );
}


function vRefRect(ref, p, s) {
  // Draw a rect with reference and vectors
  refRect(ref, p.x, p.y, s.x, s.y);
}


function vMult(v1, v2) {
  // Element wise multiplication
  return { x: v1.x * v2.x, y: v1.y * v2.y };
}


function vScale(val, v) {
  // Element wise multiplication
  return { x: val * v.x, y: val * v.y };
}


function vAdd(v1, v2) {
  // Element wise addition
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

// #endregion


// #region - Input

function mousePressed() {
  // Passthrough to app
  app.mousePressed(mouseButton);
}


function mouseReleased() {
  // Passthrough to app
  app.mouseReleased(mouseButton);
}

// #endregion


class App {

  // #region - Setup

  constructor() {
    // Declare and initialize variables
    this.menuConfig = { topBorder: 80, columns: 4, size: 155 };
    this.boards = [];
    this.selectedBoard = null;

    this.inputMouseDown = null;
    this.inputMousePressed = null;

    // Populate boards
    for (let i = 0; i < 11; i++) this.boards.push(new Board(this, i, new HostGame()));
  }

  // #endregion


  // #region - Main

  draw() {
    // Called each frame
    this.update();
    this.show();
  }


  update() {
    // Update all boards
    for (let board of this.boards) board.update();


    // Update inputs
    this.inputMousePressed = false;
  }


  show() {
    // Redraw background
    background("#b6b6b6");

    // Show all boards
    for (let board of this.boards) board.show();
  }


  selectBoard(board) {
    // Select a board
    this.selectedBoard = board;

    // Move ontop
    if (board != null) this.boards.push(this.boards.splice(this.boards.indexOf(board), 1)[0]);
  }

  // #endregion


  // #region - Input

  mousePressed(mouseButton) {
    // Update inputs
    this.inputMouseDown = mouseButton;
    this.inputMousePressed = mouseButton;
  }


  mouseReleased() {
    // Update inputs
    this.inputMouseDown = false;
  }

  // #endregion
}


class Board {

  // #region - Setup

  constructor(app_, index_, game_) {
    // Declare and initialize variables
    this.app = app_;
    this.index = index_;
    this.game = game_;
    this.game.board = this;

    this.pos = this.getPos();
    this.size = this.getSize();
    this.sidebarPos = -250;
    this.sidebarSize = 250;
    this.boardHovered = false;
    this.sidebarHovered = false;
    this.isSelected = false;
  }

  // #endregion


  // #region - Main

  update() {
    // Run all updates
    this.updateInteract();
    this.updateLayout();

    // Update game
    this.game.update();
  }


  updateInteract() {
    // Check if focused
    this.isSelected = this.app.selectedBoard == this;

    // Check if hovered
    this.boardHovered = checkBounds(mouseX, mouseY, this.pos, this.size);
    this.sidebarHovered = (mouseX < (this.sidebarPos + this.sidebarSize)
      || mouseX > (width - this.sidebarPos - this.sidebarSize));

    // Currently menu board
    if (this.app.selectedBoard == null) {
      if (this.app.inputMousePressed && this.boardHovered) this.app.selectBoard(this);

    // Currently selected board
  } else if (this.isSelected) {
      if (this.app.inputMousePressed && !this.boardHovered && !this.sidebarHovered) this.app.selectBoard(null);
    }
  }


  updateLayout() {
    // Position and size
    let gotoPos = this.getPos();
    let gotoSize = this.getSize();
    let gotoSidebarPos = this.isSelected ? 0 : -this.sidebarSize;

    // Interpolate position and size
    let posAcc = this.isSelected ? 0.07 : 0.1;
    let sizeAcc = this.isSelected ? 0.07 : 0.15;
    this.pos.x += (gotoPos.x - this.pos.x) * posAcc;
    this.pos.y += (gotoPos.y - this.pos.y) * posAcc;
    this.size.x += (gotoSize.x - this.size.x) * sizeAcc;
    this.size.y += (gotoSize.y - this.size.y) * sizeAcc;

    // Interpolate sidebar position
    this.sidebarPos += (gotoSidebarPos - this.sidebarPos) * 0.1;
  }


  show() {
    // Show board
    noStroke();
    fill("#a6a6a6");
    rectMode(CENTER);
    vRect(this.pos, this.size);

    // Show sidebars
    noStroke();
    fill("#8b8b8b");
    rectMode(CORNER);
    rect(this.sidebarPos, 0, this.sidebarSize, height);
    rect(width - this.sidebarSize - this.sidebarPos, 0, this.sidebarSize, height);

    // Show game
    this.game.show();
  }


  getPos() {
    // Position as selected board
    if (this.isSelected) {
      return { x: width * 0.5, y: height * 0.5 }

    // Position menu item
    } else {

      // Calculate index positional info
      let rowInd = floor(this.index / this.app.menuConfig.columns);
      let colInd = this.index % this.app.menuConfig.columns;

      // Set position based on positional index
      let distance = max(100 + width * 0.11, 200);
      return {
        x: width * 0.5 + distance * (colInd - this.app.menuConfig.columns / 2 + 0.5),
        y: this.app.menuConfig.topBorder + this.app.menuConfig.size * 0.5 + distance * rowInd
      }
    }
  }


  getSize() {
    // Default val
    let val = 0;

    // Size as menu board
    if (this.app.selectedBoard == null)
      val = this.app.menuConfig.size * (this.boardHovered ? 1.2 : 1);

    // Size as selected board
    else if (this.isSelected)
      val = min(width - this.sidebarSize * 2, height) - 40;

    // Return square
    return { x: val, y: val };
  }

  // #endregion
}


class HostGame {

  // #region - Setup

  constructor(board_) {
    // Declare and initialize variables
    this.board = board_;
  }

  // #endregion


  // #region - Main

  update() {}


  show() {
    // Draw as plus
    if (!this.board.isSelected) {
      noStroke();
      fill("#9c9c9c");
      rectMode(CENTER);
      refRect(this.board, 0, 0, 0.9, 0.08);
      refRect(this.board, 0, 0, 0.08, 0.9);

    // Draw button
    } else {
      noStroke();
      fill("#9c9c9c");
      rectMode(CENTER);
      refRect(this.board, -0.3, 0.32, 0.2, 0.2);
      refRect(this.board, 0.3, 0.32, 0.2, 0.2);
    }
  }

  // #endregion
}


class TestGame {

  // #region - Setup

  constructor(board_) {
    // Declare and initialize variables
    this.board = board_;
  }

  // #endregion
}
