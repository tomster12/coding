

int[][][] meshConfigTriangles = new int[][][] {
/*0*/  {{}},
/*1*/  {{5, 7, 6}},
/*2*/  {{3, 5, 4}},
/*3*/  {{7, 3, 6, 4}},
/*3*/  {{1, 3, 2}},
/*4*/  {{7, 1, 6, 1, 5, 1, 3, 1, 2}},
/*5*/  {{5, 1, 4, 2}},
/*6*/  {{7, 1, 6, 1, 4, 1, 2}},


/*7*/  {{7, 1, 0}},
/*9*/  {{1, 5, 0, 6}},
/*10*/  {{7, 0, 5, 0, 4, 0, 3, 0, 1}},
/*11*/  {{6, 0, 4, 0, 3, 0, 1}},
/*12*/  {{3, 7, 2, 0}},
/*13*/  {{6, 0, 5, 0, 3, 0, 2}},
/*14*/  {{7, 0, 5, 0, 4, 0, 2}},
/*15*/  {{6, 0, 4, 2}}
};


int[][][] meshConfigLines = {
/*0*/  {},
/*1*/  {{5, 7}},
/*2*/  {{3, 5}},
/*3*/  {{3, 7}},
/*4*/  {{1, 3}},
/*5*/  {{1, 7}, {5, 3}},
/*6*/  {{1, 5}},
/*7*/  {{1, 7}},
/*8*/  {{7, 1}},
/*9*/  {{5, 1}},
/*10*/  {{5, 7}, {3, 1}},
/*11*/  {{3, 1}},
/*12*/  {{7, 3}},
/*13*/  {{5, 3}},
/*14*/  {{7, 5}},
/*15*/  {}
};


float[][] meshPoints = {
  {0, 0},
  {0.5, 0},
  {1, 0},
  {1, 0.5},
  {1, 1},
  {0.5, 1},
  {0, 1},
  {0, 0.5}
};


int[][] cs = {
  {252, 205, 78},
  {119, 1, 22},
  {219, 125, 37},
  {216, 88, 41},
  {193, 46, 38}
};




void makeMap(int[][] cMap, ArrayList<cRoom> rooms, float fillPercent, int border, int smoothAmount, boolean connectToMain, int clearRadius, int clearAmount) {
  generateMap(cMap, fillPercent, border);
  smoothMap(cMap, smoothAmount);
  getRooms(1, cMap, rooms);
  connectRooms(cMap, rooms, connectToMain);
  clearConnections(cMap, rooms, clearRadius, clearAmount);
}


void makeMesh(int[][] cMap, int[][][]mesh, int[][][][]meshLines, ArrayList<ArrayList<PVector[]>> meshOutlines) {
  generateMesh(cMap, mesh, meshLines);
  generateMeshOutline(meshLines, meshOutlines);
}




void generateMap(int[][] cMap, float fillPercent, int border) {
  for (int x = 0; x < cSize.x; x++) {
    for (int y = 0; y < cSize.y; y++) {
      cMap[x][y] = getRandom(fillPercent); // Fill entire with random
    }
  }

  for (int i = 0; i < border; i++) {
    int[] blank = new int[(int)cSize.y]; // Make a blank X
    for (int o = 0; o < blank.length; o++) {
      blank[o] = 0;
    }
    cMap[i] = blank; // Set left and right border to blank
    cMap[cMap.length - 1 - i] = blank;
  }

  for (int i = 0; i < cSize.x; i++) {
    for (int o = 0; o < border; o++) { // Set top and bottom border
      cMap[i][o] = 0;
      cMap[i][cMap[i].length - 1 - o] = 0;
    }
  }
}


void smoothMap(int[][] cMap, float smoothAmount) {
  for (int i = 0; i < smoothAmount; i++) {
    for (int x = 0; x < cSize.x; x++) {
      for (int y = 0; y < cSize.y; y++) {
        ArrayList<PVector> neighbours = getNeighboursMap(cMap, x, y, 0);
        int neighbourCount = 0;
        for (int p = 0; p < neighbours.size(); p++) {
          if (cMap[(int)neighbours.get(p).x][(int)neighbours.get(p).y] == 1) {
            neighbourCount++;
          }
        }
        if (neighbourCount > 4) {
          cMap[x][y] = 1;
        } else  if (neighbourCount < 4) {
          cMap[x][y] = 0;
        }
      }
    }
  }
}




ArrayList<cRoom> getRooms(int type, int[][] cMap, ArrayList<cRoom> rooms) {
  boolean[][] checked = new boolean[cMap.length][];

  for (int x = 0; x < cMap.length; x++) {
    checked[x] = new boolean[cMap[x].length];
    for (int y = 0; y < cMap[x].length; y++) {
      checked[x][y] = (cMap[x][y] == Math.abs(type - 1));
    }
  }

  for (int x = 0; x < cMap.length; x++) {
    for (int y = 0; y < cMap[x].length; y++) {
      if (!checked[x][y]) {
        rooms.add(new cRoom());
        floodfillMap(cMap, rooms, x, y, type, checked);
      }
    }
  }

  return rooms;
}


void connectRooms(int[][] cMap, ArrayList<cRoom> rooms, boolean connectToMain) {
  for (int i = 0; i < rooms.size(); i++) { // Get edgepoints
    rooms.get(i).getEdgePoints(cMap);
  }

  if (rooms.size() > 1) { // Connect rooms
    for (int i = 0; i < rooms.size(); i++) { // Go through all rooms
      if (rooms.get(i).connections.size() == 0) {
        connection bestConnection = new connection(null, 100, new PVector(0, 0), new PVector(0, 0), null);
        for (int o = 0; o < rooms.size(); o++) {
          if (i != o) {
            connection cn = connectionBetweenRooms(rooms.get(i), rooms.get(o));
            if (cn.distance < bestConnection.distance) {
              bestConnection = cn;
            }
          }
        }
        rooms.get(i).connections.add(bestConnection); // Add it to itself
        bestConnection.toRoom.connections.add(new connection(bestConnection.fromRoom, bestConnection.distance, bestConnection.ep2, bestConnection.ep1, bestConnection.toRoom)); // Add it to the connected room
      }
    }

    if (connectToMain) {
      cRoom largestRoom = null;
      int largestSize = 0;
      for (int i = 0; i < rooms.size(); i++) {
        if (rooms.get(i).points.size() > largestSize) { // Get the largest room
          largestRoom = rooms.get(i);
          largestSize = rooms.get(i).points.size();
        }
      }

      for (int i = 0; i < rooms.size(); i++) {
        rooms.get(i).checkIfconnectedToMain(largestRoom);
      }
      ArrayList<cRoom> listA = new ArrayList<cRoom>(); // Gets list of rooms not connected to main
      ArrayList<cRoom> listB = new ArrayList<cRoom>(); // Gets list of rooms connected to main
      for (int i = 0; i < rooms.size(); i++) {
        if (rooms.get(i).connectedToMain) {
          listB.add(rooms.get(i));
        } else {
          listA.add(rooms.get(i));
        }
      }

      while (listA.size() > 0) { // While some rooms are not connected to main
        connection bestConnection = new connection(null, 1000, new PVector(0, 0), new PVector(0, 0), null);
        for (int i = 0; i < listA.size(); i++) {
          for (int o = 0; o < listB.size(); o++) {
            connection cn = connectionBetweenRooms(listA.get(i), listB.get(o));
            if (cn.distance < bestConnection.distance) {
              bestConnection = cn;
            }
          }
        } // Add the best connections
        bestConnection.fromRoom.connections.add(new connection(bestConnection.toRoom, bestConnection.distance, bestConnection.ep1, bestConnection.ep2, bestConnection.fromRoom));
        bestConnection.toRoom.connections.add(new connection(bestConnection.fromRoom, bestConnection.distance, bestConnection.ep2, bestConnection.ep1, bestConnection.toRoom));

        for (int i = 0; i < rooms.size(); i++) {
          rooms.get(i).checkIfconnectedToMain(largestRoom);
        }
        listA = new ArrayList<cRoom>(); // Gets list of rooms not connected to main
        listB = new ArrayList<cRoom>(); // Gets list of rooms connected to main
        for (int i = 0; i < rooms.size(); i++) { // Recalculate lists
          if (rooms.get(i).connectedToMain) {
            listB.add(rooms.get(i));
          } else {
            listA.add(rooms.get(i));
          }
        }
      }
    }
  }
}




void clearConnections(int[][] cMap, ArrayList<cRoom> rooms, int clearRadius, int clearAmount) {
  for (int i = 0; i < rooms.size(); i++) {
    for (int o = 0; o < rooms.get(i).connections.size(); o++) {
      connection cn = rooms.get(i).connections.get(o);
      clearConnection(cMap, cn, clearRadius, clearAmount);
    }
  }
}


void clearConnection(int[][] cMap, connection cn, int clearRadius, int clearAmount) {
  float x1 = cn.ep1.x;
  float y1 = cn.ep1.y;
  float x2 = cn.ep2.x;
  float y2 = cn.ep2.y;
  PVector dir = new PVector(x2 - x1, y2 - y1);
  dir.x /= clearAmount;
  dir.y /= clearAmount;
  for (int p = 0; p <= clearAmount; p++) {
    float ix = x1 + dir.x * p;
    float iy = y1 + dir.y * p;
    for (int x = -clearRadius; x < clearRadius; x++) {
      for (int y = -clearRadius; y < clearRadius; y++) {
        if (x*x + y*y <= clearRadius*clearRadius && insideMap(cMap, (int)Math.floor(ix + x), (int)Math.floor(iy + y))) {
          cMap[(int)Math.floor(ix + x)][(int)Math.floor(iy + y)] = 1;
        }
      }
    }
  }
}




void generateMesh(int[][] cMap, int[][][] mesh, int[][][][] meshLines) {
  for (int x = 0; x < cMap.length - 1; x++) {
    mesh[x] = new int[cMap[0].length - 1][];
    meshLines[x] = new int[cMap[0].length - 1][][];
    for (int y = 0; y < cMap[0].length - 1; y++) {
      mesh[x][y] = getMeshConfig(cMap, x, y, meshConfigTriangles)[0];
      meshLines[x][y] = getMeshConfig(cMap, x, y, meshConfigLines);
    }
  }
}


void generateMeshOutline(int[][][][] meshLines, ArrayList<ArrayList<PVector[]>> meshOutlines) {
  ArrayList<PVector[]> lines = new ArrayList<PVector[]>();
  for (int x = 0; x < meshLines.length; x++) {
    for (int y = 0; y < meshLines[x].length; y++) {
      for (int i = 0; i < meshLines[x][y].length; i++) {
        int[] l = meshLines[x][y][i]; // Get mesh positions
        lines.add(new PVector[] {new PVector(meshPoints[l[0]][0] + x, meshPoints[l[0]][1] + y), new PVector(meshPoints[l[1]][0] + x, meshPoints[l[1]][1] + y)}); // Add PVector of absolute positions
      }
    }
  }

  ArrayList<PVector[]> linesConnected = new ArrayList<PVector[]>();
  meshOutlines.add(new ArrayList<PVector[]>());
  PVector[] curLine;

  for (int i = 0; i < lines.size(); i++) { // For every line
    boolean connected = false;
    for (int c = 0; c < linesConnected.size(); c++) {
      if ((lines.get(i)[1].x == linesConnected.get(c)[0].x) && (lines.get(i)[1].y == linesConnected.get(c)[0].y)) {  // Check if unconnected
        connected = true;
      }
    }

    if (!connected) {
      curLine = lines.get(i);
      while (curLine != null) { // If can be connected
        boolean found = false;
        for (int o = 0; o < lines.size(); o++) { // Find another line
          if (curLine[1].x == lines.get(o)[0].x && curLine[1].y == lines.get(o)[0].y) { // Check if endpos = nextline startpos
            found = true;
            meshOutlines.get(meshOutlines.size() - 1).add(curLine); // Connect
            linesConnected.add(curLine);
            curLine = lines.get(o);
            break;
          }
        }

        for (int c = 0; c < linesConnected.size(); c++) {
          if (curLine[1].x == linesConnected.get(c)[1].x && curLine[1].y == linesConnected.get(c)[1].y) { // Finished chain
            meshOutlines.add(new ArrayList<PVector[]>());
            found = false;
          }
        }

        if (found == false) { // Move onto next line
          curLine = null;
        }
      }
    }
  }
}




int getRandom(float chance) {
  float r = random(1);
  if (r < chance) {
    return 1;
  } else {
    return 0;
  }
}




void getRooms(int type, int[][] cMap, ArrayList<cRoom> rooms, boolean[][] checked) {
  for (int x = 0; x < cMap.length; x++) {
    for (int y = 0; y < cMap[x].length; y++) {
      if (!checked[x][y]) {
        rooms.add(new cRoom());
        floodfillMap(cMap, rooms, x, y, type, checked);
      }
    }
  }
}


connection connectionBetweenRooms(cRoom r1, cRoom r2) {
  connection cn = new connection(null, 1000, new PVector(0, 0), new PVector(0, 0), null);
  for (int e1 = 0; e1 < r1.edgePoints.size(); e1++) {
    for (int e2 = 0; e2 < r2.edgePoints.size(); e2++) { // Get shortest connection to another room
      PVector ep1 = r1.edgePoints.get(e1);
      PVector ep2 = r2.edgePoints.get(e2);
      float dst = dist(ep1.x, ep1.y, ep2.x, ep2.y);
      if (dst < cn.distance) { // If a shorter distance change
        cn.toRoom = r2;
        cn.distance = dst;
        cn.ep1 = ep1;
        cn.ep2 = ep2;
        cn.fromRoom = r1;
      }
    }
  }
  return cn;
}


ArrayList<PVector> getNeighboursMap(int[][] cMap, int x_, int y_, int type) {
  ArrayList<PVector> neighbours = new ArrayList<PVector>();
  for (int nx = -1; nx < 2; nx++) {
    for (int ny = -1; ny < 2; ny++) {
      if (insideMap(cMap, x_ + nx, y_ + ny)) {
        if (!(nx == 0 && ny == 0)) {
          if ((type == 1 && (nx == 0 || ny == 0)) || type == 0) {
            neighbours.add(new PVector(x_ + nx, y_ + ny));
          }
        }
      }
    }
  }
  return neighbours;
}


void floodfillMap(int[][] cMap, ArrayList<cRoom> rooms, int x, int y, int type, boolean[][] checked) {
  if (!checked[x][y]) {

    checked[x][y] = true;
    rooms.get(rooms.size() - 1).points.add(new PVector(x, y));

    ArrayList<PVector> neighbours = new ArrayList<PVector>();
    ArrayList<PVector> tmpNeighbours = getNeighboursMap(cMap, x, y, 1);
    for (int i = 0; i < tmpNeighbours.size(); i++) {
      if (!checked[(int)tmpNeighbours.get(i).x][(int)tmpNeighbours.get(i).y]) {
        neighbours.add(tmpNeighbours.get(i));
      }
    }

    for (int i = 0; i < neighbours.size(); i++) {
      floodfillMap(cMap, rooms, (int)neighbours.get(i).x, (int)neighbours.get(i).y, type, checked);
    }
  }
}


boolean insideMap(int[][] cMap, int x, int y) {
  return (x >= 0 && x < cMap.length && y >= 0 && y < cMap[0].length);
}


int[][] getMeshConfig(int[][] cMap, int x_, int y_, int[][][] config_) {
  int meshConfigID = 0;
  if (cMap[x_][y_] == 0) {
    meshConfigID += 8;
  }
  if (cMap[x_ + 1][y_] == 0) {
    meshConfigID += 4;
  }
  if (cMap[x_ + 1][y_ + 1] == 0) {
    meshConfigID += 2;
  }
  if (cMap[x_][y_ + 1] == 0) {
    meshConfigID += 1;
  }
  return config_[meshConfigID];
}
