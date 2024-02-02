
class Prims extends Generator {

  boolean[][] visited;
  ArrayList<int[][]> frontier;


  Prims(PVector size, PVector pos, PVector drawSize) {
    super(size, pos, drawSize, "Prims");
    resetVariables();
  }


  @Override
  void resetVariables() {
    generated = false;
    map = new int[(int)size.x*2+1][(int)size.y*2+1];
    visited = new boolean[(int)size.x][(int)size.y];
    frontier = new ArrayList<int[][]>();
    int rx = floor(random(size.x));
    int ry = floor(random(size.y));
    frontier.add(new int[][] {
      new int[] {rx,ry},
      new int[] {0,0}
    });
  }


  @Override
  void singleUpdate() {
    if (!generated) {
      if (frontier.size() == 0) {
        generated = true;

      } else {
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
        if (opening[0][0]<size.x-1 && !visited[opening[0][0]+1][opening[0][1]]) neighbours[0]=true;
        if (opening[0][1]<size.y-1 && !visited[opening[0][0]][opening[0][1]+1]) neighbours[1]=true;
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
  }
}
