
// #region - Setup

float pieceSizeY = 20;
float towerSelectRange = 150;
ArrayList<Tower> towers;
ArrayList<Piece> pieces;
Piece selectedPiece;


void setup() {
  size(800, 800);
  reset();
}


void reset() {
  towers = new ArrayList<Tower>();
  pieces = new ArrayList<Piece>();
  towers.add(new Tower(new PVector(width * 0.25, height * 0.8), new PVector(width * 0.02, height * 0.4)));
  towers.add(new Tower(new PVector(width * 0.5, height * 0.8), new PVector(width * 0.02, height * 0.4)));
  towers.add(new Tower(new PVector(width * 0.75, height * 0.8), new PVector(width * 0.02, height * 0.4)));
  pieces.add(new Piece(towers.get(0), 200));
  pieces.add(new Piece(towers.get(0), 190));
  pieces.add(new Piece(towers.get(0), 160));
  pieces.add(new Piece(towers.get(0), 130));
  pieces.add(new Piece(towers.get(0), 100));
  pieces.add(new Piece(towers.get(0), 70));
}

// #endregion


// #region - Main

void draw() {
  background(220);
  for (Tower tower : towers)
    tower.show();
  for (Piece piece : pieces)
    piece.show();
}


void mousePressed() {
  if (selectedPiece == null) {
    for (Tower tower : towers) {
      if (tower.pieces.size() != 0 && mouseX > tower.bottom.x - towerSelectRange / 2 && mouseX < tower.bottom.x + towerSelectRange / 2) {
        selectedPiece = tower.pieces.get(tower.pieces.size() - 1);
        selectedPiece.pickup();
        break;
      }
    }

  } else {
    for (Tower tower : towers) {
      if (mouseX > tower.bottom.x - towerSelectRange / 2 && mouseX < tower.bottom.x + towerSelectRange / 2) {
        if (tower.pieces.size() == 0 || tower.pieces.get(tower.pieces.size() - 1).sizeX > selectedPiece.sizeX) {
          selectedPiece.place(tower);
          selectedPiece = null;
          break;
        }
      }
    }
  }
}


void keyPressed() {
  reset();
}

// #endregion


class Tower {

  // #region - Main

  PVector bottom;
  PVector size;
  ArrayList<Piece> pieces;


  Tower(PVector bottom_, PVector size_) {
    bottom = bottom_;
    size = size_;
    pieces = new ArrayList<Piece>();
  }


  void show() {
    fill(128, 82, 49);
    noStroke();
    rect(bottom.x - size.x / 2, bottom.y - size.y, size.x, size.y);
  }


  PVector getPos(int index) {
    return new PVector(
      bottom.x,
      bottom.y - pieceSizeY * 2 * (index + 1)
    );
  }

  // #endregion
}


class Piece {

  // #region - Main

  Tower tower;
  float sizeX;
  int towerIndex;

  boolean selected;
  PVector gotoPos;
  PVector pos;


  Piece(Tower tower_, float sizeX_) {
    tower = tower_;
    sizeX = sizeX_;

    towerIndex = tower.pieces.size();
    tower.pieces.add(this);
    selected = false;
    gotoPos = tower.getPos(towerIndex);
    pos = gotoPos;
  }


  void show() {
    if (selected)
      gotoPos = new PVector(mouseX, height * 0.08);
    else gotoPos = tower.getPos(towerIndex);
    pos.add(PVector.mult(PVector.sub(gotoPos, pos), 0.05));

    fill(50);
    noStroke();
    rect(pos.x - sizeX / 2, pos.y - pieceSizeY / 2, sizeX, pieceSizeY);
  }


  void pickup() {
    tower.pieces.remove(this);
    tower = null;
    towerIndex = -1;
    selected = true;
  }


  void place(Tower tower_) {
    tower_.pieces.add(this);
    tower = tower_;
    towerIndex = tower.pieces.size() - 1;
    selected = false;
  }

  // #endregion
}
