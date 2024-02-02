 //<>//

/*

 Generate 2D array, fill with random 0 or 1 (cMap)
 
 Smooth using rules to create cave-esque structure (cMap)

 
 Make list of rooms which are lists of points (rooms <- cMap)
 
 connect each room to closest other room (rooms)
 
 connect each room to main room (rooms)
 
 clear passageways using connections (cMap)
 
 
 Make array of triangle strips based on cMap (mesh)
 
 make array of lines based on cMap (meshlines)
 
 make list of outlines using meshLines (meshOutlines)
 
 */


int[][] testCMap; // 2D Array, 0 or 1 for cave generation                           Just data for use
ArrayList<cRoom> testCRooms; // List of rooms lists, which are lists of position      Reference cMap
int[][][] testMesh; // 2D Array of  meshConfigTriangles that relate to cMap         Relative positions using meshPoints
int[][][][] testMeshLines; // 2D Array of meshConfigLines that relate to cMap       Relative position using meshPoints
ArrayList<ArrayList<PVector[]>> testMeshOutlines; // List of outlines of sections   Absolute positions, not scaled


boolean[] toShow = {
  true, // CMap
  false, // Rooms
  false, // Mesh
  false, // Mesh Grid
  false, // Mesh Background
  false, // Outline
  false, // Show Connections
};
PVector cPos = new PVector(60, 60);
PVector cSize = new PVector(80, 80);
float cSizeMult = 6;




void setup() {
  size(600, 600);
}




void draw() {
  background(220);
  translate(cPos.x, cPos.y);

  if (toShow[0] && testCMap != null) {
    drawMap(testCMap);
  }

  if (toShow[2] && toShow[4] && testMesh != null) {
    drawMeshBackground(testCMap);
  }

  if (toShow[1] && testCRooms != null) {
    drawRooms(testCRooms);
  }

  translate(cSizeMult / 2, cSizeMult / 2);
  if (toShow[2] && testMesh != null) {
    drawMesh(testMesh);
  }
  if (toShow[5] && testMeshOutlines != null) {
    drawMeshOutline(testMeshOutlines);
  }
  if (toShow[6] && testCRooms != null) {
    drawConnections(testCRooms, 8);
  }
}




void keyPressed() {
  if (keyCode == 9) {
    testCMap = new int[(int)cSize.x][(int)cSize.y];
    testCRooms = new ArrayList<cRoom>();
    makeMap(testCMap, testCRooms, 0.5, 4, 2, true, 2, 8); // fillPercent, border, smoothAmount, connectToMain, clearRadius, clearAmount

    //testMesh = new int[testCMap.length - 1][][];
    //testMeshLines = new int[testCMap.length - 1][][][];  
    //testMeshOutlines = new ArrayList<ArrayList<PVector[]>>();
    //makeMesh(testCMap, testMesh, testMeshLines, testMeshOutlines);
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
  if (keyCode == 68) {
    toShow[3] = !toShow[3];
  }
  if (keyCode == 70) {
    toShow[4] = !toShow[4];
  }
  if (keyCode == 86) {
    toShow[5] = !toShow[5];
  }
  if (keyCode == 66) {
    toShow[6] = !toShow[6];
  }
}
