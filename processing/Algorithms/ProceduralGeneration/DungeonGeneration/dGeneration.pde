

ArrayList<dRoom> makeRooms(ArrayList<dRoom> rooms, PVector dSize, boolean mr, float roomChance) {
  rooms.add(new dRoom(rooms, new PVector(floor(dSize.x / 2), floor(dSize.y / 2)), new boolean[] {true, true, true, true}));
  while (true) {
    updateRooms(rooms, dSize, mr, roomChance);
    if (checkDone(rooms)) {
      cleanRooms(rooms);
      return rooms;
    }
  }
}


void updateRooms(ArrayList<dRoom> rooms, PVector dSize,  boolean mr, float roomChance) {
  int l = rooms.size();
  for (int i = 0; i < l; i++) {
    if (!rooms.get(i).done) {
      rooms.get(i).addRooms(dSize, mr, roomChance);
    }
  }
}


void cleanRooms(ArrayList<dRoom> rooms) {
  for (int i = 0; i < rooms.size(); i++) {
    dRoom r = rooms.get(i);
    for (int o = 0; o < r.dir.length; o++) { // For each direction of each room
      if (r.dir[o]) {

        PVector[] dirPos = new PVector[] {new PVector(0, -1), new PVector(1, 0), new PVector(0, 1), new PVector(-1, 0)};
        dRoom or = getRoom(rooms, r.pos.copy().add(dirPos[o])); // If there is a room in the direction
        if (or != null) {

          if (!or.dir[(o + 2) % 4]) {
            r.dir[o] = false;
          }
        }
      }
    }
  }
}


boolean isRoom(ArrayList<dRoom> rooms, PVector pos) {
  for (int i = 0; i < rooms.size(); i++) {
    if (rooms.get(i).pos.x == pos.x && rooms.get(i).pos.y == pos.y) {
      return true;
    }
  }
  return false;
}


dRoom getRoom(ArrayList<dRoom> rooms, PVector pos) {
  for (int i = 0; i < rooms.size(); i++) {
    if (rooms.get(i).pos.x == pos.x && rooms.get(i).pos.y == pos.y) {
      return rooms.get(i);
    }
  }
  return null;
}




boolean onscreen(PVector dSize, PVector pos) {
  if (pos.x < 0 || pos.x >= dSize.x || pos.y < 0 || pos.y >= dSize.y) {
    return false;
  } 
  return true;
}


boolean checkDone(ArrayList<dRoom> rooms) {
  boolean done = true;
  for (int i = 0; i < rooms.size(); i++) {
    if (!rooms.get(i).done) {
      done = false;
      break;
    }
  } 
  return done;
}
