
class Kruskal extends Generator {

  KruskalTreeNode[][] setTrees;
  ArrayList<int[]> walls;


  Kruskal(PVector size, PVector pos, PVector drawSize) {
    super(size, pos, drawSize, "Kruskal");
    resetVariables();
  }


  @Override
  void resetVariables() {
    generated = false;
    map = new int[(int)size.x*2+1][(int)size.y*2+1];
    setTrees = new KruskalTreeNode[(int)size.x][(int)size.y];
    walls = new ArrayList<int[]>();
    for (int x = 0; x < size.x; x++) { // Each cell has seperate set
      for (int y = 0; y < size.y; y++) {
        setTrees[x][y] = new KruskalTreeNode();
        setTrees[x][y].parent = setTrees[x][y];
        map[x*2+1][y*2+1] = 1;
      }
    }
    for (int i = 0; i < 2; i++) { // Get a list of walls
      for (int x = 0; x < ((i==0)?size.x:size.y); x++) {
        for (int y = 0; y < ((i==0)?(size.y-1):(size.x-1)); y++) {
          int px = x*2+1;
          int py = y*2+2;
          if (i==0) {walls.add(new int[] {px, py});
          } else {walls.add(new int[] {py, px});}
        }
      }
    }
  }


  @Override
  void singleUpdate() {
    if (!generated) {
      if (walls.size() == 0) {
        generated = true;

      } else {
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
    }
  }
}


class KruskalTreeNode {
  KruskalTreeNode parent;
  KruskalTreeNode() {}
  KruskalTreeNode findRoot() {
    if (parent != this) {
      return parent.findRoot();
    } else {
      return this;
    }
  }
}
