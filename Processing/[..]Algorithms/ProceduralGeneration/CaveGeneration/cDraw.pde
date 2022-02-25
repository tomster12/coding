

void drawMap(int[][] cMap) {
  for (int x = 0; x < cMap.length; x++) {
    for (int y = 0; y < cMap[x].length; y++) {
      noStroke();
      if (cMap[x][y] == 0) {
        fill(100);
      } else {
        fill(200);
      }
      rect(x * cSizeMult, y * cSizeMult, cSizeMult, cSizeMult);
    }
  }
}


void drawRooms(ArrayList<cRoom> rooms) {
  for (int i = 0; i < rooms.size(); i++) {
    for (int o = 0; o < rooms.get(i).points.size(); o++) {
      noStroke();
      fill(cs[i % cs.length][0], cs[i% cs.length][1], cs[i% cs.length][2]);
      rect(rooms.get(i).points.get(o).x * cSizeMult, rooms.get(i).points.get(o).y * cSizeMult, cSizeMult, cSizeMult);
    }
  }
}




void drawMeshBackground(int[][] cMap) {
  noStroke();
  fill(100);
  rect(0, 0, cMap.length * cSizeMult, cMap[0].length * cSizeMult);
  fill(200);
  rect(cSizeMult / 2, cSizeMult / 2, (cMap.length - 1) * cSizeMult, (cMap[0].length - 1) * cSizeMult);
}


void drawMesh(int[][][] mesh) {
  strokeWeight(cSizeMult * 0.1);

  if (toShow[3]) {
    stroke(40);
  } else {
    stroke(100);
  }

  for (int x = 0; x < mesh.length; x++) {
    for (int y = 0; y < mesh[x].length; y++) {
      fill(100);
      beginShape(TRIANGLE_STRIP);
      for (int i = 0; i < mesh[x][y].length; i++) {
        float nx = (x + meshPoints[mesh[x][y][i]] [0]) * cSizeMult;
        float ny = (y + meshPoints[mesh[x][y][i]] [1]) * cSizeMult;
        vertex(nx, ny);
      }
      endShape();
    }
  }
}


void drawMeshOutline(ArrayList<ArrayList<PVector[]>> meshOutlines) {
  for (int i = 0; i < meshOutlines.size(); i++) {
    for (int o = 0; o < meshOutlines.get(i).size(); o++) {
      PVector[] l = meshOutlines.get(i).get(o);
      stroke(0);
      strokeWeight(1.5);
      line(l[0].x * cSizeMult, l[0].y * cSizeMult, l[1].x * cSizeMult, l[1].y * cSizeMult);
    }
  }
}




void drawConnections(ArrayList<cRoom> rooms, int clearAmount) {
  for (int i = 0; i < rooms.size(); i++) {
    if (rooms.get(i).connections.size() > 0) {
      for (int o = 0; o < rooms.get(i).connections.size(); o++) {
        connection cn = rooms.get(i).connections.get(o);
        stroke(200, 100, 100);
        strokeWeight(2);
        float x1 = cn.ep1.x * cSizeMult;
        float y1 = cn.ep1.y * cSizeMult;
        float x2 = cn.ep2.x * cSizeMult;
        float y2 = cn.ep2.y * cSizeMult;
        line(x1, y1, x2, y2);
        PVector dir = new PVector(x2 - x1, y2 - y1);
        dir.x /= clearAmount;
        dir.y /= clearAmount;
        for (int p = 1; p < clearAmount; p++) {
          noStroke();
          fill(0);
          ellipse(x1 + dir.x * p, y1 + dir.y * p, 2, 2);
        }
      }
    }
  }
}
