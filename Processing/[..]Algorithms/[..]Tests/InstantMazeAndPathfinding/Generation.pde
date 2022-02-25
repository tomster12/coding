
// #region - Main

int[][] generateMap(int sx, int sy) {
  return generateMap1(sx, sy);
}

// #endregion


// #region - Map Generation type 0 (Full)

int[][] generateMap0(int sx, int sy) {
  int[][] map = new int[sx*2+1][sy*2+1];
  for (int x = 0; x < sx; x++) {
    for (int y = 0; y < sy; y++) {
      map[(x*2+1)][(y*2+1)] = 1;
    }
  }
  return map;
}

// #endregion


// #region - Map Generation type 1 (Depth First)

int[][] generateMap1(int sx, int sy) {
  boolean running = true; // Setup variables
  int[][] map = new int[sx*2+1][sy*2+1];
  boolean[][] visited = new boolean[sx][sy];
  int[] current = new int[] {floor(random(sx)), floor(random(sy))};
  ArrayList<int[]> stack = new ArrayList<int[]>();
  stack.add(current);
  int[][] directions = new int[][] {
    new int[] {1,0},
    new int[] {0,1},
    new int[] {-1,0},
    new int[] {0,-1}
  };

  while (running) {
    ArrayList<Integer> possible = new ArrayList<Integer>(); // Get all viable neighbours
    for (int i = 0; i < 4; i++) {
      int[] possiblePos = new int[] {
        current[0] + directions[i][0],
        current[1] + directions[i][1]
      };
      if (possiblePos[0] >= 0 && possiblePos[0] < sx
      && possiblePos[1] >= 0 && possiblePos[1] < sy
      && !visited[possiblePos[0]][possiblePos[1]]
      ) {possible.add(i);}
    }

    if (possible.size() == 0) { // If no neighbours then move down the stack
      stack.remove(stack.size()-1);
      if (stack.size() > 0) {
        current = stack.get(stack.size()-1);
      } else {running = false;}

    } else { // If has neighbours move to random
      int[] dir = directions[possible.get(floor(random(possible.size())))];
      int[] newPos = new int[] {current[0]+dir[0], current[1]+dir[1]};
      visited[newPos[0]][newPos[1]] = true;
      map[newPos[0]*2+1][newPos[1]*2+1] = 1;
      map[current[0]*2+1 + dir[0]][current[1]*2+1 + dir[1]] = 1;
      current = new int[] {newPos[0], newPos[1]};
      stack.add(current);
    }
  }
  return map;
}

// #endregion


// #region - Map Generation type 2 (Kruskal)

int[][] generateMap2(int sx, int sy) {
  int[][] map = new int[sx*2+1][sy*2+1]; // Setup variables
  TreeNode[][] setTrees = new TreeNode[sx][sy];

  for (int x = 0; x < sx; x++) { // Each cell has seperate set
    for (int y = 0; y < sy; y++) {
      setTrees[x][y] = new TreeNode();
      setTrees[x][y].parent = setTrees[x][y];
      map[x*2+1][y*2+1] = 1;
    }
  }

  ArrayList<int[]> walls = new ArrayList<int[]>(); // Get a list of all walls
  for (int i = 0; i < 2; i++) {
    for (int x = 0; x < ((i==0)?sx:sy); x++) {
      for (int y = 0; y < ((i==0)?(sy-1):(sx-1)); y++) {
        int px = x*2+1;
        int py = y*2+2;
        if (i==0) {walls.add(new int[] {px, py});
        } else {walls.add(new int[] {py, px});}
      }
    }
  }

  while (walls.size() > 0) {
    int ind = floor(random(walls.size())); // Pick a random wall and get cells
    int[] wp = walls.get(ind);
    int[] p1p, p2p;

    if (wp[0] % 2 == 0) { // Vertical wall
      p1p = new int[] {(wp[0])/2-1, (wp[1]-1)/2};
      p2p = new int[] {(wp[0])/2, (wp[1]-1)/2};

    } else { // Horizontal wall
      p1p = new int[] {(wp[0]-1)/2, (wp[1])/2-1};
      p2p = new int[] {(wp[0]-1)/2, (wp[1])/2};
    }

    // If touching cells are different sets break wall
    if (setTrees[p2p[0]][p2p[1]].findRoot() != setTrees[p1p[0]][p1p[1]].findRoot()) {
      setTrees[p2p[0]][p2p[1]].findRoot().parent = setTrees[p1p[0]][p1p[1]].findRoot();
      map[wp[0]][wp[1]] = 1;
    }
    walls.remove(ind);
  }
  return map;
}


class TreeNode {
  TreeNode parent;
  TreeNode() {}
  TreeNode findRoot() {
    if (parent != this) {
      return parent.findRoot();
    } else {
      return this;
    }
  }
}

// #endregion


// #region - Map Generation type 3 (Prim)

int[][] generateMap3(int sx, int sy) {
  int[][] map = new int[sx*2+1][sy*2+1]; // Setup variables
  boolean[][] visited = new boolean[sx][sy];
  ArrayList<int[][]> frontier = new ArrayList<int[][]>();
  int[][] directions = new int[][] {
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

  while (frontier.size() > 0) { // While there is a frontier pick one at random
    for (int i = 0; i < frontier.size(); i++) {
      int[] position = frontier.get(i)[0];
      int[] direction = frontier.get(i)[1];
    }

    int ind = floor(random(frontier.size())); // Open up the position
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
  return map;
}

// #endregion
