
// #region - Main

let GRID;


function setup() {
  createCanvas(800, 800);
  GRID = new Grid();
}


function draw() {
  background(0);
  GRID.update();
  GRID.show();
}

// #endregion


class Float2 {

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(other) { this.x += other.x; this.y += other.y; }
  sub(other) { this.x -= other.x; this.y -= other.y; }
  mult(val) { this.x *= val; this.y *= val; }
}


class Tile {

  // #region - Main

  constructor(grid, x, y) {
    this.grid = grid;
    this.gridPos = new Float2(x, y);
    this.type = null;
    this.type = null;
    this.col = color(200, 200, 200);
  }


  update() { }

  show() {
    let pos = this.grid.getWorldPos(this.gridPos);
    fill(this.col);
    noStroke();
    rect(pos.x, pos.y, this.grid.tileSize, this.grid.tileSize);
  }

  // #endregion
}

class Grid {

  // #region - Main

  constructor() {
    this.tiles = { };
    this.tileSize = 20;
    this.pos = new Float2(0, 0);

    // Debug add tile
    this.addTile(0, 0);
    this.addTile(1, 0);
    this.addTile(2, 0);
    this.addTile(3, 0);
    this.addTile(0, 1);
    this.addTile(3, 1);
    this.addTile(0, 2);
    this.addTile(3, 2);
    this.addTile(0, 3);
    this.addTile(1, 3);
    this.addTile(2, 3);
    this.addTile(3, 3);
  }


  update() {
    for (let tile in this.tiles) this.tiles[tile].update();
  }

  show() {
    for (let tile in this.tiles) this.tiles[tile].show();
  }

  // #endregion


  // #region - Accessors

  getTile(x, y) {
    if (y == null) return this.getTile(x.x, x.y);
    return this.tiles[this.getGridKey(x, y)];
  }

  getGridKey(x, y) {
    if (y == null) return this.getGridKey(x.x, x.y);
    return x + ", " + y;
  }

  getWorldPos(x, y) {
    if (y == null) return this.getWorldPos(x.x, x.y);
    return new Float2(
      this.pos.x + x * this.tileSize,
      this.pos.y + y * this.tileSize
    );
  }


  addTile(x, y) {
    if (y == null) return this.addTile(x.x, x.y);
    let key = this.getGridKey(x, y);
    if (this.tiles[key] != null) return false;
    this.tiles[key] = new Tile(this, x, y);
    return true;
  }

  // #endregion
}
