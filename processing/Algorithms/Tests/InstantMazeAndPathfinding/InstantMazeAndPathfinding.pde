
// #region - Setup

int[][] map;
ArrayList<int[]> path;
boolean generated;
float camScale;
PVector camPos = new PVector(0, 0);


void setup() {
  size(700, 700);
  generated = false;
  camScale = 1;
  camPos = new PVector(0, 0);
}

// #endregion


// #region - Main

void draw() {
  background(100);
  translate(width/2, height/2);
  scale(camScale);
  translate(-width/2 + camPos.x, -height/2 + camPos.y);
  if (generated) {
    drawMap(map, path, new PVector(50, 50), new PVector(600, 600));
  }
}


void drawMap(int[][] map, ArrayList<int[]> path, PVector pos, PVector size) {
  if (map != null) {
    noStroke();
    float xDif = size.x / (float)map.length;
    float yDif = size.y / (float)map[0].length;
    for (int x = 0; x < map.length; x++) {
      for (int y = 0; y < map[x].length; y++) {
        fill(map[x][y]*255);
        PVector adjPos = new PVector(pos.x + x*xDif, pos.y + y*yDif);
        rect(adjPos.x, adjPos.y, xDif, yDif);
      }
    }

    if (path != null) {
      strokeWeight(xDif*0.4);
      stroke(217, 0, 150);
      fill(217, 0, 150);
      for (int i = 0; i < path.size()-1; i++) {
        int i2 = i+1;
        int[] pos1 = path.get(i);
        int[] pos2 = path.get(i2);
        PVector adjPos1 = new PVector(pos.x + pos1[0]*xDif + xDif/2, pos.y + pos1[1]*yDif + yDif/2);
        PVector adjPos2 = new PVector(pos.x + pos2[0]*xDif + xDif/2, pos.y + pos2[1]*yDif + yDif/2);
        line(adjPos1.x, adjPos1.y, adjPos2.x, adjPos2.y);
      }
    }
  }
}

// #endregion


// #region - Input

void mouseWheel(MouseEvent event) {
  float e = event.getCount();
  camScale += e*0.02;
}

void keyPressed() {
  if (keyCode == 37) {
    camPos.x += 5;
  } else if (keyCode == 38) {
    camPos.y += 5;
  } else if (keyCode == 39) {
    camPos.x -= 5;
  } else if (keyCode == 40) {
    camPos.y -= 5;
  }

  if (keyCode == 9) {
    map = generateMap(50, 50);
    path = null;
    generated = true;

  } else if (keyCode == 81) {
    path = pathfindMap(map);
  }
}

// #endregion
