
// #region - Setup

// Declare variables
let moves;
let towers;


function setup() {
  // Main setup
  createCanvas(800, 800);
  setupVariables();
}


function setupVariables() {
  // Initialize variables
  moves = [];
  towers = [
    [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
    [],
    []
  ];
}

// #endregion


// #region - Main

function draw() {
  background("#e2e2e2");

  // Do moves
  if (moves.length > 0 && frameCount % 20 == 0) {
    towers[moves[0][1]].push(towers[moves[0][0]].pop());
    moves.splice(0, 1);
  }

  // For each tower
  for (let i = 0; i < towers.length; i++) {

    // Position and size
    let tdx = (width - 300) / (towers.length - 1);
    let tcpx = 150 + tdx * i;
    let tpy = (height - 50);
    let tsx = 20;
    let tsy = 720;

    // Draw tower
    noStroke();
    fill("#625659");
    rect(tcpx - tsx / 2, tpy - tsy, tsx, tsy);

    // Draw discs
    for (let o = 0; o < towers[i].length; o++) {
      let dpy = tpy - o * 60 - 60;
      let dsx = (tdx * 0.1) * towers[i][o];
      let dsy = 40;
      noStroke();
      fill("#d5375f");
      rect(tcpx - dsx / 2, dpy - dsy, dsx, dsy);
    }
  }
}


function move(start, storage, target, amount) {
  if (amount == 1) moves.push([start, target]);
  else {
    move(start, target, storage, amount - 1);
    move(start, storage, target, 1);
    move(storage, start, target, amount - 1);
  }
}

// #endregion
