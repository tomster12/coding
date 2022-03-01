
// #region - Setup

// Declare variables
let moves;
let towers;
let discCount;


function setup() {
  // Main setup
  createCanvas(1000, 800);
  noStroke();
  setupVariables();

  // Setup moves
  move(0, 1, 2, towers[0].length);
}


function setupVariables() {
  // Initialize variables
  moves = [];
  towers = [
    [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
    [],
    [] ];
  discCount = 12;
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
  let tdx = (width - 300) / (towers.length - 1);
  let tpy = 50;
  let tsx = 20;
  let tsy = height - 100;
  for (let i = 0; i < towers.length; i++) {
    let tcpx = 150 + tdx * i;

    // Draw tower
    fill("#625659");
    rect(tcpx - tsx / 2, tpy, tsx, tsy);

    // Draw discs
    for (let o = 0; o < towers[i].length; o++) {
      fill(color(interpColor("#dee734ff", "#d5375fff", towers[i][o] / discCount)));
      let dpy = tpy + tsy - (o + 1) * 60;
      let dsx = (tdx * 0.05) * towers[i][o];
      let dsy = 40;
      rect(tcpx - dsx / 2, dpy, dsx, dsy);
    }
  }
}


function move(start, storage, target, amount) {
  // Recursive movement function
  if (amount == 1) moves.push([start, target]);
  else {
    move(start, target, storage, amount - 1);
    move(start, storage, target, 1);
    move(storage, start, target, amount - 1);
  }
}


function interpColor(a, b, amount) {
  // Interpolates between colors a and b by amount
  let ah = +a.replace("#", "0x");
  let bh = +b.replace("#", "0x");

  let ar = (ah >> 24) & 0xff;
  let ag = (ah >> 16) & 0xff;
  let ab = (ah >> 8) & 0xff;
  let aa = (ah) & 0xff;

  let br = (bh >> 24) & 0xff;
  let bg = (bh >> 16) & 0xff;
  let bb = (bh >> 8) & 0xff;
  let ba = (bh) & 0xff;

  let rr = round(ar + amount * (br - ar));
  let rg = round(ag + amount * (bg - ag));
  let rb = round(ab + amount * (bb - ab));
  let ra = round(aa + amount * (ba - aa));

  return "#" + rr.toString(16) + rg.toString(16) + rb.toString(16) + ra.toString(16);
}

// #endregion
