

class cRoom {


  ArrayList<PVector> points;
  ArrayList<PVector> edgePoints;
  ArrayList<connection> connections;
  boolean connectedToMain;


  cRoom() {
    points = new ArrayList<PVector>();
    edgePoints = new ArrayList<PVector>();
    connections = new ArrayList<connection>();
    connectedToMain = false;
  }


  void getEdgePoints(int[][] cMap) {
    edgePoints = new ArrayList<PVector>();
    for (int i = 0; i < points.size(); i++) {
      ArrayList<PVector> neighbours = getNeighboursMap(cMap, (int)points.get(i).x, (int)points.get(i).y, 1);
      boolean found = false;
      for (int o = 0; o < neighbours.size(); o++) {
        if (cMap[(int)neighbours.get(o).x][(int)neighbours.get(o).y] == 0) {
          found = true;
          break;
        }
      }
      if (found) {
        edgePoints.add(points.get(i));
      }
    }
  }


  void checkIfconnectedToMain(cRoom main) {
    if (this != main) {
      for (int i = 0; i < connections.size(); i++) {
        if (this.connections.get(i).toRoom == main || connections.get(i).toRoom.connectedToMain) {
          this.connectToMain();
          break;
        }
      }
    } else {
      this.connectToMain();
    }
  }


  void connectToMain() {
    connectedToMain = true;
    for (int i = 0; i < connections.size(); i++) {
      if (!connections.get(i).toRoom.connectedToMain) {
        connections.get(i).toRoom.connectToMain();
      }
    }
  }
}




class connection {
  
  
  cRoom toRoom;
  float distance;
  PVector ep1;
  PVector ep2;
  cRoom fromRoom;
  
  
  connection(cRoom toRoom_, float distance_, PVector ep1_, PVector ep2_, cRoom fromRoom_) {
    toRoom = toRoom_;
    distance = distance_;
    ep1 = ep1_;
    ep2 = ep2_;
    fromRoom = fromRoom_;
  }
}
