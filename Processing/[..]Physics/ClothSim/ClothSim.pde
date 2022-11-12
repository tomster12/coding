
// Constants
float DT_MULT = 3;

// Globals
PWorld PWORLD;
Cloth CLOTH;
float DT;


void setup() {
  size(1400, 800);
  rectMode(CENTER);
  PWORLD = new PWorld();
  CLOTH = new Cloth(PWORLD, 100, 50, 32, 121, 10);
}


void draw() {
  background(17, 15, 18);
  DT = DT_MULT / frameRate;
  PWORLD.draw();
}


class Cloth {

  PWorld world;
  int rows, cols;
  PWorld.PPoint[][] points;
  ArrayList<PWorld.PStick> sticks;


  Cloth(PWorld world, int px, int py, int rows, int cols, float scaling) {
    this.world = world;
    this.rows = rows;
    this.cols = cols;
    
    points = new PWorld.PPoint[cols][rows];    
    for (int x = 0; x < cols; x++) {
      for (int y = 0; y < rows; y++) {
        points[x][y] = world.addPoint(px + x * scaling, py + y * scaling, 1);
        if (x % 2 == 0 && y == 0) points[x][y].pin();
      }
    }

    sticks = new ArrayList<PWorld.PStick>();
    for (int x = 0; x < cols; x++) {
      for (int y = 0; y < rows; y++) {
        if (x < cols - 1) sticks.add(world.addStick(points[x][y], points[x + 1][y]));
        if (y < rows - 1) sticks.add(world.addStick(points[x][y], points[x][y + 1]));
      }
    }
  }
}
