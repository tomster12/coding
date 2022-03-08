

void drawDungeon(ArrayList<dRoom> rooms) {
  for (dRoom room : rooms) {
    room.show(dSizeMult * 0.1, dSizeMult * 0.4); // wallSize, doorSize
  }
}
