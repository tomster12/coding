

void generateNCave(ArrayList<dRoom> nDRooms, int[][] nCMap, ArrayList<cRoom> nCRooms, 
  PVector dSize, boolean mr, float roomChance, 
  PVector cSize, float fillPercent, int border, int smoothAmount, boolean connectToMain, int clearRadius, int clearAmount) {


  // Make dungeon
  makeRooms(nDRooms, dSize, mr, roomChance);


  // Make nRooms
  ArrayList<nRoom> nRooms = new ArrayList<nRoom>();
  for (int i = 0; i < nDRooms.size(); i++) {
    dRoom cDR = nDRooms.get(i);
    nRooms.add(new nRoom(cDR.pos, cDR.dir));
  }


  // Tell each to get cMap and cRoom
  for (int i = 0; i < nRooms.size(); i++) {
    nRooms.get(i).getCMap(cSize, fillPercent, border, smoothAmount, connectToMain, clearRadius, clearAmount);
  }
  
  
  // Place them all together
  for (int i = 0; i < nRooms.size(); i++) {
    nRoom cNR = nRooms.get(i);
    for (int x = 0; x < cNR.cMap.length; x++) {
      for (int y = 0; y < cNR.cMap[0].length; y++) {
        nCMap[(int)(x + cNR.pos.x * cSize.x)][(int)(y + cNR.pos.y * cSize.y)] = cNR.cMap[x][y];
      }
    }
  }
  
  
  // Change all cRooms points by position for clearing
  for (int i = 0; i < nRooms.size(); i++) { // - cRooms
    for (int o = 0; o < nRooms.get(i).cRooms.size(); o++) {
      for (int p = 0; p < nRooms.get(i).cRooms.get(o).points.size(); p++) {
        nRooms.get(i).cRooms.get(o).points.get(p).add(nRooms.get(i).pos.x * cSize.x, nRooms.get(i).pos.y * cSize.y);
      }
    }
  }
  
  
  // Clear NCMap by cRoom connections
  for (int i = 0; i < nRooms.size(); i++) {
    clearConnections(nCMap, nRooms.get(i).cRooms, 3, 8);
  }




  // Get NCRooms
  for (int i = 0; i < nRooms.size(); i++) { // - cRoom
    ArrayList<cRoom> TMPCRooms = new ArrayList<cRoom>();
    boolean[][] checked = new boolean[nCMap.length][];
    for (int x = 0; x < nCMap.length; x++) {
      checked[x] = new boolean[nCMap[x].length];
      for (int y = 0; y < nCMap[x].length; y++) {
        if (nCMap[x][y] == 0) {
          checked[x][y] = true;
        }
        if (x < nRooms.get(i).pos.x * cSize.x || x > nRooms.get(i).pos.x * cSize.x + cSize.x || y < nRooms.get(i).pos.y * cSize.y || y > nRooms.get(i).pos.y * cSize.y + cSize.y) {
          checked[x][y] = true;
        }
      }
    }
    getRooms(1, nCMap, TMPCRooms, checked);
    nRooms.get(i).cRoom = TMPCRooms.get(0);
    nRooms.get(i).cRoom.getEdgePoints(nCMap);
    nCRooms.add(nRooms.get(i).cRoom);
  }


  //Connect cRooms together
  for (int i = 0; i < nRooms.size(); i++) { // For each room
    nRoom cNRoom = nRooms.get(i);
    for (int o = 0; o < cNRoom.dir.length; o++) { // For each direction that is connected
      connection cn = null;
      if (cNRoom.dir[o]) {
        PVector[] dirPos = new PVector[] {new PVector(0, -1), new PVector(1, 0), new PVector(0, 1), new PVector(-1, 0)};
        nRoom oNRoom = null;
        for (int p = 0; p < nRooms.size(); p++) { // Get other room in direction
          if (i != p) {
            if (nRooms.get(p).pos.x == cNRoom.pos.x + dirPos[o].x) {
              if (nRooms.get(p).pos.y == cNRoom.pos.y + dirPos[o].y) {
                oNRoom = nRooms.get(p);
              }
            }
          }
        }
        if (oNRoom != null) {
          cn = connectionBetweenRooms(cNRoom.cRoom, oNRoom.cRoom);
          cNRoom.cRoom.connections.add(cn);
        }
      }
    }
  }
  clearConnections(nCMap, nCRooms, clearRadius, clearAmount);
}
