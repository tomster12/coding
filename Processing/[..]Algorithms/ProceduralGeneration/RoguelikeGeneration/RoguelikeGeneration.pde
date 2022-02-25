

/*

 DungeonGeneration - Create rooms
 
 Create 2d array of nRoom With:
 Position
 Direction
 cMap
 cMapRoom
 
 Create individual cMap for each:
 Random cMap
 Smooth once
 Generate border
 Get rooms
 Connect rooms
 clear passageways
 
 Get room for each cMap, assign to nRoom
 
 Connect each nRooms cMapRoom to each nRoom cMapRoom in each direction
 
 Create large cMap with each nRoom cMap
 
 Add nRoom cMapRooms to large room list
 
 Clear connections
 
 */




PVector dPos = new PVector(50, 50);
PVector dSize = new PVector(5, 5);
float dSizeMult = 20;

PVector cSize = new PVector(32, 32);
float cSizeMult = 2;


PVector nCPos = new PVector(200, 50);
ArrayList<dRoom> nDRooms;
int[][] nCMap;
ArrayList<cRoom> nCRooms;
boolean[] toShow = {
  true, // CMap
  false, // Rooms
  false, // Show Connections
  true, // Dungeon
};




void setup() {
  size(600, 600);
}




void draw() {
  background(200);


  if (nDRooms != null && nCMap != null) {
    translate(nCPos.x, nCPos.y);
    if (toShow[0]) {
      drawMap(nCMap);
    }
    if (toShow[1]) {
      drawRooms(nCRooms);
    }
    if (toShow[2]) {
      drawConnections(nCRooms, 8);
    }
    if (toShow[3]) {
      translate(-nCPos.x, -nCPos.y);
      drawDungeon(nDRooms, dSizeMult * 0.08, dSizeMult * 0.3);
    }
  }
}




void keyPressed() {

  if (keyCode == 9) {
    nDRooms = new ArrayList<dRoom>();
    nCMap = new int[(int)(dSize.x * cSize.x)][(int)(dSize.y * cSize.y)];
    nCRooms = new ArrayList<cRoom>();

    generateNCave(  
      nDRooms, nCMap, nCRooms, // int[][] nCMap, ArrayList<cRoom> nCRooms,
      dSize, true, 0.5, // PVector dSize, boolean mr, float roomChance
      cSize, 0.45, 3, 1, true, 3, 15 // float fillPercent, int border, int smoothAmount, boolean connectToMain, int clearRadius, int clearAmount
      );
  }

  if (keyCode == 90) {
    toShow[0] = !toShow[0];
  }
  if (keyCode == 88) {
    toShow[1] = !toShow[1];
  }
  if (keyCode == 67) {
    toShow[2] = !toShow[2];
  }
  if (keyCode == 86) {
    toShow[3] = !toShow[3];
  }
}
