
// #region - Main

ArrayList<int[]> pathfindMap(int[][] map) {
  ArrayList<Node> nodes = mapToNodes(map);
  ArrayList<int[]> path = pathfindNodes0(nodes);
  return path;
}


float distSq(PVector p1, PVector p2) {
  float dx = p2.x-p1.x;
  float dy = p2.y-p1.y;
  return dx*dx + dy*dy;
}

// #endregion


// #region - Map to Nodes

ArrayList<Node> mapToNodes(int[][] map) {
  int sx = map.length; // Setup variables
  int sy = map[0].length;
  ArrayList<Node> nodes = new ArrayList<Node>();
  ArrayList<ArrayList<ArrayList<Node>>> neighbourArrays = new ArrayList<ArrayList<ArrayList<Node>>>();
  neighbourArrays.add(new ArrayList<ArrayList<Node>>());
  neighbourArrays.add(new ArrayList<ArrayList<Node>>());
  int[][] directions = new int[][] {
    new int[] {1,0},
    new int[] {0,1},
    new int[] {-1,0},
    new int[] {0,-1}
  };
  for (int x = 0; x < sx; x++) { // For each position
    neighbourArrays.get(0).add(new ArrayList<Node>());
    for (int y = 0; y < sy; y++) {
      neighbourArrays.get(1).add(new ArrayList<Node>());
      if (map[x][y] == 1) {
        boolean[] open = new boolean[4];
        int count = 0;
        for (int i = 0; i < 4; i++) {
          int nx = x + directions[i][0]; // Count open neighbours
          int ny = y + directions[i][1];
          if (nx>=0 && nx<sx && ny>=0 && ny<sy) {
            if (map[nx][ny] == 1) {
              open[i] = true;
              count++;
            }
          }
        }
        boolean specialCase = false; // If corridor dont add
        if (count == 2) {
          if (!(open[0] && open[2])
            && !(open[1] && open[3])
          ) {specialCase = true;}
        }
        if (count == 1
        || specialCase
        || count == 3
        || count == 4) {
          Node n = new Node(new PVector(x, y)); // Add node and add to neighbour arrays
          neighbourArrays.get(0).get(x).add(n);
          neighbourArrays.get(1).get(y).add(n);
          nodes.add(n);
        }
      }
    }
  }
  for (int i = 0; i < neighbourArrays.size(); i++) { // For each constant axis Array
    for (int o = 0; o < neighbourArrays.get(i).size(); o++) {
      for (int p = 0; p < neighbourArrays.get(i).get(o).size(); p++) {
        for (int dir = -1; dir < 2; dir += 2) {
          if ((p+dir)>=0 && (p+dir)<(neighbourArrays.get(i).get(o).size())) {
            boolean viable = true;
            PVector cPos = neighbourArrays.get(i).get(o).get(p).pos.copy();
            PVector tPos = neighbourArrays.get(i).get(o).get(p+dir).pos.copy();
            while (true) {
              cPos.x += directions[(i+1)%2][0] * dir;
              cPos.y += directions[(i+1)%2][1] * dir;
              if (map[(int)cPos.x][(int)cPos.y] == 0) {viable = false;}
              if (cPos.x == tPos.x && cPos.y == tPos.y) {break;}
            } if (viable) {neighbourArrays.get(i).get(o).get(p).neighbours.add(neighbourArrays.get(i).get(o).get(p+dir));}
          }
        }
      }
    }
  }
  return nodes;
}


class Node {
  // #region - Setup

  PVector pos;
  ArrayList<Node> neighbours;
  Node parent;
  float fCost;
  float gCost;
  float hCost() {return fCost+gCost;}


  Node(PVector pos_) {
    pos = pos_;
    neighbours = new ArrayList<Node>();
    fCost = 0;
    gCost = 0;
  }

  // #endregion
}

// #endregion


// #region - Pathfind nodes 0 (A Star)

ArrayList<int[]> pathfindNodes0(ArrayList<Node> nodes) {
  Node start = nodes.get(0); // Setup variables
  Node finish = nodes.get(nodes.size()-1);
  ArrayList<Node> openSet = new ArrayList<Node>();
  ArrayList<Node> closedSet = new ArrayList<Node>();
  start.fCost = 0;
  start.gCost = distSq(start.pos, finish.pos);
  openSet.add(start);

  while (openSet.size() > 0) {
    Node lowestNode = openSet.get(0); // Get node with lowest hCost
    float lowestCost = lowestNode.hCost();
    for (int i = 0; i < openSet.size(); i++) {
      float cost = openSet.get(i).hCost();
      if (cost < lowestCost) {
        lowestCost = cost;
        lowestNode = openSet.get(i);
      }
    }

    if (lowestNode == finish) { // If reached target
      ArrayList<int[]> path = new ArrayList<int[]>();
      Node nextNode = lowestNode;
      while (true) {
        PVector p = nextNode.pos;
        path.add(0, new int[] {(int)p.x, (int)p.y});
        nextNode = nextNode.parent;
        if (nextNode == null) {
          return path;
        }
      }

    } else {
      openSet.remove(lowestNode);
      closedSet.add(lowestNode);
      for (int i = 0; i < lowestNode.neighbours.size(); i++) { // For each neighbour
        Node neighbour = lowestNode.neighbours.get(i);
        if (!closedSet.contains(neighbour)) {
          float newFCost = lowestNode.fCost + distSq(lowestNode.pos, neighbour.pos);
          if (neighbour.parent == null
          || (neighbour.parent != null && newFCost < neighbour.fCost)) { // Update if better parent
            neighbour.fCost = newFCost;
            neighbour.parent = lowestNode;
            neighbour.gCost = distSq(neighbour.pos, finish.pos);
            if (!openSet.contains(neighbour)) {openSet.add(neighbour);}
          }
        }
      }
    }
  }
  return new ArrayList<int[]>();
}

// #endregion
