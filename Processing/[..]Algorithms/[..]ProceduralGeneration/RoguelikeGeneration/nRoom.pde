

class nRoom {


  PVector pos;
  boolean[] dir;
  int[][] cMap;
  cRoom cRoom;
  ArrayList<cRoom> cRooms;


  nRoom(PVector pos_, boolean[] dir_) {
    pos = pos_;
    dir = dir_;
  }


  void getCMap(PVector cSize, float fillPercent, int border, int smoothAmount, boolean connectToMain, int clearRadius, int clearAmount) {
    cMap = new int[(int)cSize.x][(int)cSize.y];
    cRooms = new ArrayList<cRoom>();
    makeMap(cMap, cRooms, cSize, fillPercent, border, smoothAmount, connectToMain, clearRadius, clearAmount); // Make map


    boolean found = false;
    for (int x = 0; x < cMap.length; x++) {
      for (int y = 0; y < cMap[x].length; y++) {
        if (cMap[x][y] == 1) {
          found = true;
        }
      }
    }
    if (found == false) {
      print("\nNo room - Remaking cMap: " + pos.x + " : " + pos.y);
      getCMap(cSize, fillPercent, border, smoothAmount, connectToMain, clearRadius, clearAmount);
      return;
    }
  }
}
