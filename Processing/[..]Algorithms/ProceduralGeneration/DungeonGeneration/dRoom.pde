class dRoom {


  ArrayList<dRoom> pRooms;
  PVector pos;
  boolean[] dir;
  boolean done;


  dRoom(ArrayList<dRoom> pRooms_, PVector pos_, boolean[] dir_) {
    pRooms = pRooms_;
    pos = pos_;
    dir = dir_;
    done = false;
  }


  void show(float wallSize, float doorSize) {
    float pX = (pos.x * dSizeMult) + dPos.x;
    float pY = (pos.y * dSizeMult) + dPos.y;

    noStroke();
    fill(200);
    rect(pX, pY, dSizeMult, dSizeMult);

    noStroke();
    fill(100);
    rect(pX + wallSize, pY + wallSize, dSizeMult - wallSize * 2, dSizeMult - wallSize * 2);

    if (dir[0]) {
      rect(pX + (dSizeMult - doorSize) / 2, pY, doorSize, wallSize);
    }
    if (dir[1]) {
      rect(pX + dSizeMult - wallSize, pY + (dSizeMult - doorSize) / 2, wallSize, doorSize);
    }
    if (dir[2]) {
      rect(pX + (dSizeMult - doorSize) / 2, pY + dSizeMult - wallSize, doorSize, wallSize);
    }
    if (dir[3]) {
      rect(pX, pY + (dSizeMult - doorSize) / 2, wallSize, doorSize);
    }
  }




  void addRooms(PVector dSize, boolean mr, float roomChance) {
    PVector[] dirPos = new PVector[] {new PVector(0, -1), new PVector(1, 0), new PVector(0, 1), new PVector(-1, 0)};
    for (int i = 0; i < dir.length; i++) { // For each activate direction
      if (dir[i]) {
        PVector tmpPos = new PVector(pos.x + dirPos[i].x, pos.y + dirPos[i].y);
        if (onscreen(dSize, tmpPos)) { // If room is onscreen
          if (!isRoom(pRooms, tmpPos)) {  // If there isnt already a room
            boolean[] tmpDir = { // Set the open doors
              (i == 2)?true:false, 
              (i == 3)?true:false, 
              (i == 0)?true:false, 
              (i == 1)?true:false
            };
            if (mr) {
              for (int o = 0; o < tmpDir.length; o++) { // If multi-room
                if (random(1) < roomChance) {
                  tmpDir[o] = true;
                }
              }
            } else {
              if (random(1) < roomChance) { // If Single-room
                tmpDir[floor(random(tmpDir.length))] = true;
              }
            }
            pRooms.add(new dRoom(pRooms, tmpPos, tmpDir)); // Add room
          }
        } else {
          dir[i] = false; // If Offscreen
        }
      }
    }
    done = true;
  }
}
