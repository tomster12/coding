
// #region - setup

int sx;
int sy;
int[][] map;
boolean[][] visited;
ArrayList<int[][]> frontier;
int[][] directions;


void setup() {
  size(600, 600);
  setupVariables();
}


void setupVariables() {
  resetMap();
}


void resetMap() {
  sx = 50;
  sy = 50;
  map = new int[sx*2+1][sy*2+1];
  visited = new boolean[sx][sy];
  frontier = new ArrayList<int[][]>();
  directions = new int[][] {
    new int[] {1,0},
    new int[] {0,1},
    new int[] {-1,0},
    new int[] {0,-1}
  };

  int rx = floor(random(sx));
  int ry = floor(random(sy));
  frontier.add(new int[][] {
    new int[] {rx,ry},
    new int[] {0,0}
  });

}

// #endregion


// #region - Main

void draw() {
  updateMap();
  showMap();
}


void updateMap() {
  if (frontier.size() > 0) {
    int ind = floor(random(frontier.size())); // Open up a random position position
    int[][] opening = frontier.get(ind);
    map[opening[0][0]*2+1][opening[0][1]*2+1] = 1;
    map[opening[0][0]*2+1+opening[1][0]][opening[0][1]*2+1+opening[1][1]] = 1;
    visited[opening[0][0]][opening[0][1]] = true;

    boolean[] neighbours = new boolean[4]; // Check all neighbours
    if (opening[0][0]<sx-1 && !visited[opening[0][0]+1][opening[0][1]]) neighbours[0]=true;
    if (opening[0][1]<sy-1 && !visited[opening[0][0]][opening[0][1]+1]) neighbours[1]=true;
    if (opening[0][0]>0 && !visited[opening[0][0]-1][opening[0][1]]) neighbours[2]=true;
    if (opening[0][1]>0 && !visited[opening[0][0]][opening[0][1]-1]) neighbours[3]=true;

    for (int i = 0; i < neighbours.length; i++) { // Add all viables neighbours
      if (neighbours[i]) {
        frontier.add(new int[][] {
          new int[] {opening[0][0]+directions[i][0], opening[0][1]+directions[i][1]},
          new int[] {directions[i][0]*-1, directions[i][1]*-1}
        });
      }
    }

    for (int i = 0; i < frontier.size(); i++) { // Remove position from frontier list
      if (frontier.get(i)[0][0] == opening[0][0] && frontier.get(i)[0][1] == opening[0][1]) {
        frontier.remove(i);
        i--;
      }
    }
  }
}


void showMap() {
  background(0);
  noStroke();
  fill(255);
  float xDif = width / (float)map.length;
  float yDif = height / (float)map[0].length;
  for (int x = 0; x < map.length; x++) {
    for (int y = 0; y < map[x].length; y++) {
      if (map[x][y] == 1) {
        PVector adjPos = new PVector(x*xDif, y*yDif);
        rect(adjPos.x, adjPos.y, xDif, yDif);
      }
    }
  }
}

// #endregion


// #region - Input

void keyPressed() {
  if (keyCode == 9) {
    resetMap();
  }
}

// #endregion
