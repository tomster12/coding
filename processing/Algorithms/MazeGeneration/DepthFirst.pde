
class DepthFirst extends Generator {

  boolean[][] visited;
  int[] current;
  ArrayList<int[]> stack;


  DepthFirst(PVector size, PVector pos, PVector drawSize) {
    super(size, pos, drawSize, "Depth First");
    resetVariables();
  }


  @Override
  void resetVariables() {
    generated = false;
    map = new int[(int)size.x*2+1][(int)size.y*2+1];
    visited = new boolean[(int)size.x][(int)size.y];
    stack = new ArrayList<int[]>();
    current = new int[] {floor(random(size.x)), floor(random(size.y))};
    stack.add(current);
  }


  @Override
  void singleUpdate() {
    if (!generated) {
      ArrayList<Integer> possible = new ArrayList<Integer>(); // Get all viable neighbours
      for (int i = 0; i < 4; i++) {
        int[] possiblePos = new int[] {
          current[0] + directions[i][0],
          current[1] + directions[i][1]
        };
        if (possiblePos[0] >= 0 && possiblePos[0] < size.x
        && possiblePos[1] >= 0 && possiblePos[1] < size.y
        && !visited[possiblePos[0]][possiblePos[1]]
        ) {possible.add(i);}
      }

      if (possible.size() == 0) { // If no neighbours then move down the stack
        stack.remove(stack.size()-1);
        if (stack.size() > 0) {
          current = stack.get(stack.size()-1);
        } else {generated = true;}

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
  }
}
