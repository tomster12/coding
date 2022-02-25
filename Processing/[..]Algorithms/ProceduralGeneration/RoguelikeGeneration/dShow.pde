

void drawDungeon(ArrayList<dRoom> rooms, float wallSize, float doorSize) {
  for (dRoom room : rooms) {
    room.show(wallSize, doorSize); // wallSize, doorSize
  }
}
