
/*
Generate 2D array, fill with random 0 or 1 (cMap)
Smooth using rules to create cave-esque structure (cMap)
Make list of rooms which are lists of points (rooms <- cMap)
connect each room to closest other room (rooms)
connect each room to main room (rooms)
Make array of triangles based on cMap (mesh)
make array of lines based on cMap (meshlines)
make list of outlines using meshLines (meshOutlines)
*/


// #region - Setup

// Main variables
let cMap;         // 2D Array, 0 or 1 for cave generation                  Just data for use
let mesh;         // 2D Array of  meshConfigTriangles that relate to cMap  Relative positions using meshConfigPoints
let meshLines;    // 2D Array of meshConfigLines that relate to cMap       Relative position using meshConfigPoints
let meshOutlines; // List of outlines of sections                          Absolute positions, not scaled
let rooms;        // List of rooms lists, which are lists of position      Reference cMap
let checked;

// Mesh config variables
let meshConfigTriangles = [
  /*0*/ [],
  /*1*/ [5, 7, 6],
  /*2*/ [3, 5, 4],
  /*3*/ [7, 3, 6, 4],
  /*3*/ [1, 3, 2],
  /*4*/ [7, 1, 6, 1, 5, 1, 3, 1, 2],
  /*5*/ [5, 1, 4, 2],
  /*6*/ [7, 1, 6, 1, 4, 1, 2],
  /*7*/ [7, 1, 0],
  /*9*/ [1, 5, 0, 6],
  /*10*/ [7, 0, 5, 0, 4, 0, 3, 0, 1],
  /*11*/ [6, 0, 4, 0, 3, 0, 1],
  /*12*/ [3, 7, 2, 0],
  /*13*/ [6, 0, 5, 0, 3, 0, 2],
  /*14*/ [7, 0, 5, 0, 4, 0, 2],
  /*15*/ [6, 0, 4, 2]
];
let meshConfigLines = [
  /*0*/ [],
  /*1*/ [[5, 7]],
  /*2*/ [[3, 5]],
  /*3*/ [[3, 7]],
  /*4*/ [[1, 3]],
  /*5*/ [[1, 7], [5, 3]],
  /*6*/ [[1, 5]],
  /*7*/ [[1, 7]],
  /*8*/ [[7, 1]],
  /*9*/ [[5, 1]],
  /*10*/ [[5, 7], [3, 1]],
  /*11*/ [[3, 1]],
  /*12*/ [[7, 3]],
  /*13*/ [[5, 3]],
  /*14*/ [[7, 5]],
  /*15*/ []
];
let meshConfigPoints = [
  [0, 0],
  [0.5, 0],
  [1, 0],
  [1, 0.5],
  [1, 1],
  [0.5, 1],
  [0, 1],
  [0, 0.5]
]

// Config variables
let toShow = [
  false,  // cMap
  false,  // rooms
  true,   // mesh
  false,  // mesh lines
  true,   // mesh outlines
  false   // connections
]
let cs = [
  [252, 205, 78],
  [119, 1, 22],
  [219, 125, 37],
  [216, 88, 41],
  [193, 46, 38]
]
let fillPercent = 0.5;
let cWidth = 100;
let cHeight = 100;
let cSize = 5;
let cPos = [50, 50];
let connectoToMain = true;
let clearRadius = 3;


function setup() {
  // Setup p5.js variables
  createCanvas(600, 600);
  pixelDensity(3);
  console.log("0 - z - map");
  console.log("1 - x - rooms");
  console.log("2 - c - mesh");
  console.log("3 - v - thick borders");
  console.log("4 - b - meshOutline");
  console.log("5 - n - connections");

  // Setup cave
  makeMapAndMesh();
}

// #endregion


// #region - Draw

function draw() {
  background(220);
  translate(cPos[0], cPos[1]);

  // Main draw
  translate(-cSize / 2, -cSize / 2);
  if (toShow[0] && cMap != null)
    drawMap();
  if (toShow[1] && rooms != null)
    drawRooms();
  translate(cSize / 2, cSize / 2);

  // Mesh draw
  if (toShow[2] && mesh != null)
    drawMesh();
  if (toShow[4] && meshOutlines != null)
    drawMeshOutline();
  if (toShow[5] && rooms != null)
    drawConnections();
}


function drawMap() {
  noStroke();
  for (let x = 0; x < cMap.length; x++) {
    for (let y = 0; y < cMap[x].length; y++) {
      fill(cMap[x][y] == 0 ? 100 : 200);
      rect(x * cSize,  y * cSize, cSize, cSize);
    }
  }
}


function drawRooms() {
  noStroke();
  for (let i = 0; i < rooms.length; i++) {
    for (let o = 0; o < rooms[i].points.length; o++) {
      fill(cs[i % cs.length][0], cs[i% cs.length][1], cs[i% cs.length][2]);
      rect(rooms[i].points[o][0] * cSize, rooms[i].points[o][1] * cSize, cSize, cSize);
    }
  }
}


function drawMesh() {
  strokeWeight(cSize * 0.1);
  stroke(toShow[3] ? 40 : 100);
  fill(100);
  for (let x = 0; x < mesh.length; x++) {
    for (let y = 0; y < mesh[x].length; y++) {
      beginShape(TRIANGLE_STRIP);
      for (let i = 0; i < mesh[x][y].length; i++) {
        let nx = (x + meshConfigPoints[mesh[x][y][i]][0]) * cSize;
        let ny = (y + meshConfigPoints[mesh[x][y][i]][1]) * cSize;
        vertex(nx, ny);
      }
      endShape();
    }
  }
}


function drawMeshOutline() {
  stroke(0);
  strokeWeight(1);
  for (let i = 0; i < meshOutlines.length; i++) {
    for (let o = 0; o < meshOutlines[i].length; o++) {
      let l = meshOutlines[i][o];
      line(l[0][0] * cSize, l[0][1] * cSize, l[1][0] * cSize, l[1][1] * cSize);
    }
  }
}


function drawConnections() {
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].connectedTo.length > 0) {
      for (let o = 0; o < rooms[i].connectedTo.length; o++) {
        let cn = rooms[i].connectedTo[o];
        stroke(200, 100, 100);
        strokeWeight(2);
        let x1 = cn[2][0] * cSize;
        let y1 = cn[2][1] * cSize;
        let x2 = cn[3][0] * cSize;
        let y2 = cn[3][1] * cSize;
        line(x1, y1, x2, y2);

        let interpolatedPosition = [];
        let dir = createVector(x2, y2);
        dir.sub(createVector(x1, y1));
        dir.mult(1 / 5);
        noStroke();
        fill(0);
        for (let i = 1; i < 5 ; i++) {
          ellipse(x1 + dir.x * i, y1 + dir.y * i, 2, 2);
        }
      }
    }
  }
}

// #endregion


// #region - Primary

function makeMapAndMesh() {
  generateMap();
  smoothMap();
  getRooms(1);
  connectRooms();
  clearPassages();
  generateMesh();
  generateMeshOutline();
}


function generateMap() {
  cMap = [];
  for (let x = 0; x < cWidth; x++) {
    cMap.push([]);
    for (let y = 0; y < cHeight; y++) {
      cMap[x].push(
        x % (cWidth-1) == 0 ? 0
        : y % (cHeight-1) == 0 ? 0
        : getRandom()
      );
    }
  }
}


function smoothMap() {
  for (let i = 0; i < 5; i++) {
    for (let x = 0; x < cWidth; x++) {
      for (let y = 0; y < cHeight; y++) {
        let neighbours = getNeighboursMap(x, y, 0);
        let neighbourCount = 0;
        for (let i = 0; i < neighbours.length; i++) {
          if (cMap[neighbours[i][0]][neighbours[i][1]] == 1) {
            neighbourCount++;
          }
        }
        if (neighbourCount > 4) {
          cMap[x][y] = 1;
        } else  if (neighbourCount < 4){
          cMap[x][y] = 0;
        }
      }
    }
  }
}


function getNeighboursMap(x_, y_, type) {
  let neighbours = [];
  for (let nx = -1; nx < 2; nx++) {
    for (let ny = -1; ny < 2; ny++) {
      if (insideMap(x_ + nx, y_ + ny)) {
        if (!(nx == 0 && ny == 0)) {
          if ((type == 1 && (nx == 0 || ny == 0)) || type == 0) {
            neighbours.push([x_ + nx, y_ + ny]);
          }
        }
      }
    }
  }
  return neighbours;
}


function generateMesh() {
  mesh = [];
  meshLines = [];
  for (let x = 0; x < cWidth - 1; x++) {
    mesh.push([]);
    meshLines.push([]);
    for (let y = 0; y < cHeight - 1; y++) {
      mesh[x].push(getMeshConfig(x, y, meshConfigTriangles));
      meshLines[x].push(getMeshConfig(x, y, meshConfigLines));
    }
  }
}


function generateMeshOutline() {
  let lines = [];
  for (let x = 0; x < meshLines.length; x++) {
    for (let y = 0; y < meshLines[x].length; y++) {
      for (let i = 0; i < meshLines[x][y].length; i++) { // Get absolute positions
        let l = meshLines[x][y][i];
        lines.push([[meshConfigPoints[l[0]][0] + x, meshConfigPoints[l[0]][1] + y], [meshConfigPoints[l[1]][0] + x, meshConfigPoints[l[1]][1] + y]]);
      }
    }
  }

  meshOutlines = [[]];
  let linesConnected = [];
  let curLine;
  for (let i = 0; i < lines.length; i++) { // For every line
    let connected = false;
    for (let c = 0; c < linesConnected.length; c++) {
      if (lines[i][1][0] == linesConnected[c][1][0] && lines[i][1][1] == linesConnected[c][1][1]) {  // Check if unconnected
        connected = true;
      }
    }

    if (!connected) {
      curLine = lines[i];
      while (curLine != null) { // If can be conected
        let found = false;
        for (let o = 0; o < lines.length; o++) { // Find another line
          if (curLine[1][0] == lines[o][0][0] && curLine[1][1] == lines[o][0][1]) { // Check if endpos = nextline startpos
            found = true;
            meshOutlines[meshOutlines.length - 1].push(curLine); // Connect
            linesConnected.push(curLine);
            curLine = lines[o];
            break;
          }
        }
        for (let c = 0; c < linesConnected.length; c++) {
          if (curLine[1][0] == linesConnected[c][1][0] && curLine[1][1] == linesConnected[c][1][1]) { // Finished chain
            meshOutlines.push([]);
            found = false;
          }
        }
        if (found == false) { // Move onto next line
          curLine = null;
        }
      }
    }
  }
}


function getRooms(type) {
  rooms = [];
  checked = [];

  for (let x = 0; x < cMap.length; x++) {
    checked.push([]);
    for (let y = 0; y < cMap[x].length; y++) {
      checked[x].push(cMap[x][y] == Math.abs(type - 1));
    }
  }

  for (let x = 0; x < cMap.length; x++) {
    for (let y = 0; y < cMap[x].length; y++) {
      if (!checked[x][y]) {
        rooms.push(new room());
        floodfillMap(x, y, type);
      }
    }
  }
}


function connectRooms() {
  for (let i = 0; i < rooms.length; i++) {
    rooms[i].getEdgepoints();
  }

  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].connectedTo.length == 0) {
      let bestToConnectTo = [null, 1000, [0, 0], [0, 0]];
      for (let o = 0; o < rooms.length; o++) {
        if (i != o) {
          for (let e1 = 0; e1 < rooms[i].edgePoints.length; e1++) {
            for (let e2 = 0; e2 < rooms[o].edgePoints.length; e2++) {
              let ep1 = rooms[i].edgePoints[e1];
              let ep2 = rooms[o].edgePoints[e2];
              let dst = dist(ep1[0], ep1[1], ep2[0], ep2[1]);
              if (dst < bestToConnectTo[1]) {
                bestToConnectTo[0] = rooms[o];
                bestToConnectTo[1] = dst;
                bestToConnectTo[2] = ep1;
                bestToConnectTo[3] = ep2;
              }
            }
          }
        }
      }
      if (bestToConnectTo[0] != null) {
        rooms[i].connectedTo.push(bestToConnectTo);
        bestToConnectTo[0].connectedTo.push([rooms[i], bestToConnectTo[1], bestToConnectTo[3], bestToConnectTo[2]]);
      }
    }
  }

  let largestRoom = null;
  let largestSize = 0;
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].points.length > largestSize) {
      largestRoom = rooms[i];
      largestSize = rooms[i].points.length;
    }
  }

  for (let i = 0; i < rooms.length; i++) {
    rooms[i].checkIfConnectedToMain(largestRoom);
  }
  let listA = [];
  let listB = [];
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].connectedToMain) {
      listB.push(rooms[i]);
    } else {
      listA.push(rooms[i]);
    }
  }
  while (listA.length > 0) {
    let smallestDistance = 1000;
    let smallestConnection = null;
    let bestToConnectTo = [null, 1000, [0, 0], [0, 0], null];
    for (let i = 0; i < listA.length; i++) {
      for (let o = 0; o < listB.length; o++) {
        for (let e1 = 0; e1 < listA[i].edgePoints.length; e1++) {
          for (let e2 = 0; e2 < listB[o].edgePoints.length; e2++) { // Get shortest connection between listA and listB
            let ep1 = listA[i].edgePoints[e1];
            let ep2 = listB[o].edgePoints[e2];
            let dst = dist(ep1[0], ep1[1], ep2[0], ep2[1]);
            if (dst < bestToConnectTo[1]) {
              bestToConnectTo[0] = listB[o];
              bestToConnectTo[1] = dst;
              bestToConnectTo[2] = ep1;
              bestToConnectTo[3] = ep2;
              bestToConnectTo[4] = listA[i];
            }
          }
        }
      }
    }
    if (bestToConnectTo[0] != null) { // Add connection
      bestToConnectTo[4].connectedTo.push([bestToConnectTo[0], bestToConnectTo[1], bestToConnectTo[2], bestToConnectTo[3]]);
      bestToConnectTo[0].connectedTo.push([bestToConnectTo[4], bestToConnectTo[1], bestToConnectTo[3], bestToConnectTo[2]]);
    }

    let largestRoom = null;
    let largestSize = 0;
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].points.length > largestSize) {
        largestRoom = rooms[i];
        largestSize = rooms[i].points.length;
      }
    }
    for (let i = 0; i < rooms.length; i++) {
      rooms[i].checkIfConnectedToMain(largestRoom);
    }

    listA = [];
    listB = [];
    for (let i = 0; i < rooms.length; i++) { // Recalculate lists
      if (rooms[i].connectedToMain) {
        listB.push(rooms[i]);
      } else {
        listA.push(rooms[i]);
      }
    }
  }
}


/*
if Forcing main room accessibility

  make list of rooms not connected to main (roomListA)
  make list of rooms connected to main (roomListB)

  while roomListA.length > 0
    smallest distance = 1000
    shortest path = null

    foreach room in roomListA
      find path
      if path distance < smallest distance
        set path to be shortest path

  connect shortest path
  reevaluate roomLists
*/

function clearPassages() {
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].connectedTo.length > 0) {
      for (let o = 0; o < rooms[i].connectedTo.length; o++) {
        let cn = rooms[i].connectedTo[o];
        let x1 = cn[2][0];
        let y1 = cn[2][1];
        let x2 = cn[3][0];
        let y2 = cn[3][1];
        let interpolatedPosition = [];
        let dir = createVector(x2, y2);
        dir.sub(createVector(x1, y1));
        dir.mult(1 / 5);
        for (let i = 0; i <= 5 ; i++) {
          let ix = x1 + dir.x * i;
          let iy = y1 + dir.y * i;
          for (let x = -clearRadius; x < clearRadius; x++) {
            for (let y = -clearRadius; y < clearRadius; y++) {
              if (x*x + y*y <= clearRadius*clearRadius && insideMap(Math.floor(ix + x), Math.floor(iy + y))) {
                cMap[Math.floor(ix + x)][Math.floor(iy + y)] = 1;
              }
            }
          }
        }
      }
    }
  }
}


// #endregion


// #region - Secondary

function floodfillMap(x, y, type) {
  if (!checked[x][y]) {
    checked[x][y] = true;
    rooms[rooms.length - 1].points.push([x, y]);

    let neighbours = [];
    let tmpNeighbours = getNeighboursMap(x, y, 1);
    for (let i = 0; i < tmpNeighbours.length; i++) {
      if (!checked[tmpNeighbours[i][0]][tmpNeighbours[i][1]]) {
        neighbours.push(tmpNeighbours[i]);
      }
    }

    for (let i = 0; i < neighbours.length; i++) {
      floodfillMap(neighbours[i][0], neighbours[i][1], type, checked);
    }
  }
}


function insideMap(x, y) {
  return (x >= 0 && x < cWidth && y >= 0 && y < cHeight);
}


function getMeshConfig(x_, y_, config_) {
  let meshConfigID = 0;
  if (cMap[x_][y_] == 0) {
    meshConfigID += 8;
  }
  if (cMap[x_ + 1][y_] == 0) {
    meshConfigID += 4;
  }
  if (cMap[x_ + 1][y_ + 1] == 0) {
    meshConfigID += 2;
  }
  if (cMap[x_][y_ + 1] == 0) {
    meshConfigID += 1;
  }
  return config_[meshConfigID];
}

// #endregion


// #region - Other

function getRandom() {
  r = random();
  if (r < fillPercent) {
    return 1;
  } else {
    return 0;
  }
}

 
function keyPressed() {
  if (keyCode == 90)
    toShow[0] = !toShow[0];
  if (keyCode == 88)
    toShow[1] = !toShow[1];
  if (keyCode == 67)
    toShow[2] = !toShow[2];
  if (keyCode == 86)
    toShow[3] = !toShow[3];
  if (keyCode == 66)
    toShow[4] = !toShow[4];
  if (keyCode == 78)
    toShow[5] = !toShow[5];
}

// #endregion


class room {
  // #region - Main

  constructor() {
    this.points = [];
    this.edgePoints = [];
    this.connectedTo = [];
    this.connectedToMain = false;
  }


  getEdgepoints() {
    this.edgePoints = [];
    for (let i = 0; i < this.points.length; i++) {
      let neighbours = getNeighboursMap(this.points[i][0], this.points[i][1], 1);
      for (let o = 0; o < neighbours.length; o++) {
        if (cMap[neighbours[o][0]][neighbours[o][1]] == 0) {
          this.edgePoints.push(this.points[i]);
          break;
        }
      }
    }
  }


  checkIfConnectedToMain(main) {
    for (let i = 0; i < this.connectedTo.length; i++) {
      if (this.connectedTo[i][0] == main || this.connectedTo[i][0].connectedToMain) {
        this.connectToMain();
        break;
      }
    }
  }


  connectToMain() {
    this.connectedToMain = true;
    for (let i = 0; i < this.connectedTo; i++) {
      this.connectedTo[0].connectoToMain();
    }
  }

  // #endregion
}
