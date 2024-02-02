
class Generator {
  // #region - Setup

  PVector size;
  PVector pos;
  PVector drawSize;
  String name;

  int[][] map;
  boolean generated;
  int[][] directions;

  Generator(PVector size_, PVector pos_, PVector drawSize_, String name_) {
    size = size_;
    pos = pos_;
    drawSize = drawSize_;
    name = name_;

    map = new int[(int)size.x*2+1][(int)size.y*2+1];
    generated = false;
    directions = new int[][] {
      new int[] {1,0},
      new int[] {0,1},
      new int[] {-1,0},
      new int[] {0,-1}
    };
  }

  // #endregion


  // #region - Main

  void showMap() {
    float xDif = drawSize.x / map.length;
    float yDif = drawSize.y / map[0].length;
    stroke(255);
    fill(255);
    rect(pos.x, pos.x, drawSize.x, drawSize.y);
    noStroke();
    fill(0);
    for (int x = 0; x < map.length; x++) {
      for (int y = 0; y < map[x].length; y++) {
        float px = pos.x + x*xDif;
        float py = pos.y + y*yDif;
        if (map[x][y] == 1) {
          rect(px, py, xDif, yDif);
        }
      }
    }

    fill(255);
    text("Generator: " + name, width/2, 20);
    text("Generated: " + generated, width/2, 40);
  }


  void fullUpdate() {
    while (!generated) {
      singleUpdate();
    }
  }

  // #endregion


  // #region - Other

  void resetVariables() {}
  void singleUpdate() {}

  // #endregion
}
