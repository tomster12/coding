

int[][] generateMap(PVector size, float fillPercent, int neighbourLimit) {
  int[][] map = new int[(int)size.x][(int)size.y];
  for (int x = 0; x < size.x; x++) { // Random map with 0 border
    for (int y = 0; y < size.y; y++) {
      int v = (random(1) < fillPercent) ? 1 : 0;
      v = (x == 0 || x == size.x - 1 || y == 0 || y == size.y - 1) ? 0 : v;
      map[x][y] = v;
    }
  }
  for (int i = 0; i < 5; i++) {
    for (int x = 1; x < size.x-1; x++) {
      for (int y = 1; y < size.y-1; y++) {
        int nc = 0;
        for (int ox = -1; ox < 2; ox++) {
          for (int oy = -1; oy < 2; oy++) { // Smooth the map
            if (!(ox == 0 && oy == 0)) {
              if (map[x+ox][y+oy] == 1) {
                nc++;
              }
            }
          }
        }
        if (nc > neighbourLimit) {
          map[x][y] = 1;
        } else if (nc < neighbourLimit) {
          map[x][y] = 0;
        }
      }
    }
  }
  return map;
}


PVector[][] getCirclePositions(float size, PVector amount) {
  PVector[][] positions = new PVector[(int)amount.x][(int)amount.y];
  for (int x = 0; x < amount.x; x++) {
    for (int y = 0; y < amount.y; y++) {
      float pX = cos(map(x, 0, amount.x, 0, PI));
      float pY = cos(map(y, 0, amount.y, 0, PI));
      float cpX = pX * sqrt(1 - 0.5 * pY * pY) * size/2;
      float cpY = pY * sqrt(1 - 0.5 * pX * pX) * size/2;
      positions[x][y] = new PVector(cpX, cpY);
    }
  }
  return positions;
}


void drawMap(int[][] map, PVector[][] circlePositions, PVector pos, float[] positions) {
  int mw = map.length;
  int mh = map[0].length;
  int sxA = (int)positions[0];
  int sxP = (int)positions[1];
  int syA = (int)positions[2];
  int syP = (int)positions[3];
  
  for (int x = 0; x < sxA; x++) {
    for (int y = 0; y < syA; y++) {
      PVector p1 = circlePositions[x][y].copy().add(pos);
      float p1V = map[(x + sxP) % mw][(y + syP) % mh];
      
      if (x < sxA - 1) {
        PVector p2 = circlePositions[x + 1][y].copy().add(pos);
        float p2V = map[(x + 1 + sxP) % mw][(y + syP) % mh];
        stroke(p1V == 1 && p2V == 1 ? 255 : 0);
        line(p1.x, p1.y, p2.x, p2.y);
      }
      
      if (y < syA - 1) {
        PVector p3 = circlePositions[x][y + 1].copy().add(pos);
        float p3V = map[(x + sxP) % mw][(y + 1 + syP) % mh];
        stroke(p1V == 1 && p3V == 1 ? 255 : 0);
        line(p1.x, p1.y, p3.x, p3.y);
      }
    }
  }
}
