

let X_AMOUNT = 200;
let SET_AMOUNT = 10;
let MODE, AXIS, SET_SPEED, SET_DISTANCE;
function setMode(mode) {
  MODE = mode;
  if (mode == 0) {
    AXIS = [ [ 0, 3000 ], [ 0, 5000 ] ];
    SET_SPEED = 128;
  } else if (mode == 1) {
    AXIS = [ [ 0, 300 ], [ 0, 1000 ] ];
    SET_DISTANCE = 100;
  } else if (mode == 2) {
    AXIS = [ [ 0, 300 ], [ 0, 1000 ] ];
    SET_DISTANCE = 100;
  }
}
setMode(0);

let cargo = [
  { name: "passengers", col: "#d15ddf",
    base: 3185, days1: 0, days2: 24 },
  { name: "coal", col: "#00ff47",
    base: 5916, days1: 7, days2: 255 },
  { name: "wood", col: "#ff8a00",
    base: 5005, days1: 15, days2: 255 }];


function setup() {
  createCanvas(800, 550);
}


function draw() {
  background(43, 44, 47);
  drawCargoGraph(
    width * 0.5 - 300, height * 0.5 - 200, 600, 400,
    AXIS, X_AMOUNT, cargo,
  );
}


function drawCargoGraph(
  px, py, sx, sy,
  axis, xCount, cargo) {

  // Draw outline
  stroke(255);
  noFill();
  rect(px, py, sx, sy);

  // Calculate and draw graph
  let border = 20;
  let gpx = px + border * 2;
  let gpy = py + sy - border;
  let gsx = sx - border * 4;
  let gsy = sy - border * 2;
  stroke(255);
  noFill();
  line(gpx, gpy, gpx, gpy - gsy);
  line(gpx, gpy, gpx + gsx, gpy);

  // Draw values helper function
  let drawValues = (values, col) => {
    stroke(col);
    noFill();
    for (let i = 0; i < xCount - 1; i++) {
      let xPct0 = (i) / (xCount - 1);
      let yPct0 = (values[i] - axis[1][0]) / (axis[1][1] - axis[1][0]);
      let cx0 = gpx + gsx * xPct0;
      let cy0 = gpy - gsy * yPct0;
      let xPct1 = (i + 1) / (xCount - 1);
      let yPct1 = (values[i + 1] - axis[1][0]) / (axis[1][1] - axis[1][0]);
      let cx1 = gpx + gsx * xPct1;
      let cy1 = gpy - gsy * yPct1;
      if (yPct0 >= 0 && yPct0 <= 1 && yPct1 >= 0 && yPct1 <= 1)
        line(cx0, cy0, cx1, cy1);
    }
  }

  // Calculate all values for all cargo
  let allValues = [];
  for (let i = 0; i < cargo.length; i++) {
    allValues.push([]);
    for (let o = 0; o < xCount; o++) {
      let pct = o / (xCount - 1);
      let vx = axis[0][0] + (axis[0][1] - axis[0][0]) * pct;

      // Show income against distance
      if (MODE == 0) {
        var vkmph = SET_SPEED;
        var c = cargo[i];
        var a = SET_AMOUNT;
        var d = vx;
        var t = d / (vkmph / 17.85);

      // Show income against time
      } else if (MODE == 1) {
        var c = cargo[i];
        var a = SET_AMOUNT;
        var d = SET_DISTANCE;
        var t = vx;

      // Show income against speed
      } else if (MODE == 2) {
        var vkmph = vx;
        var c = cargo[i];
        var a = SET_AMOUNT;
        var d = SET_DISTANCE;
        var t = d / (vkmph / 17.85);
      }

      // Calculate and add value
      let vy = calculateIncome(c, a, d, t);
      allValues[allValues.length - 1].push(vy);
    }
  }

  // Draw temp values
  for (let i = 0; i < cargo.length; i++)
    drawValues(allValues[i], cargo[i].col);

  // Draw labels
  noStroke();
  fill(255);
  textSize(border * 0.55);
  textAlign(CENTER, TOP);
  text(axis[0][0], gpx + border * 0.25, gpy + border * 0.25);
  text((axis[0][0] + axis[0][1]) / 2, gpx + gsx * 0.5, gpy + border * 0.25);
  text(axis[0][1], gpx + gsx, gpy + border * 0.25);
  textAlign(RIGHT, CENTER);
  text(axis[1][0], gpx - border * 0.25, gpy - border * 0.25);
  text((axis[1][0] + axis[1][1]) / 2, gpx - border * 0.255, gpy - gsy * 0.5);
  text(axis[1][1], gpx - border * 0.25, gpy - gsy);

  // Draw title
  textAlign(CENTER, BOTTOM);
  textSize(20);
  if (MODE == 0) text("Distance vs Income - " + SET_SPEED + "km/h, " + SET_AMOUNT + " units", px + sx * 0.5, py - 10);
  else if (MODE == 1) text("Time vs Income - " + SET_DISTANCE + " tiles, " + SET_AMOUNT + " units", px + sx * 0.5, py - 10);
  else if (MODE == 2) text("Speed vs Income - " + SET_DISTANCE + " tiles, " + SET_AMOUNT + " units", px + sx * 0.5, py - 10);

  // Draw hovered value
  if (mouseX > gpx && mouseX < (gpx + gsx)
  && mouseY < gpy && mouseY > (gpy - gsy)) {
    let xPct = (mouseX - gpx) / gsx;
    let vx = axis[0][0] + (axis[0][1] - axis[0][0]) * xPct;
    let x = px + sx - border;

    textSize(border * 0.6);
    textAlign(RIGHT, TOP);
    noStroke();
    fill(255);
    if (MODE == 0) text(nf(vx, 3, 2) + " tiles", x, py + border);
    else if (MODE == 1) text(nf(vx, 3, 2) + " days", x, py + border);
    else if (MODE == 2) text(nf(vx, 3, 2) + "km/h", x, py + border);
    let count = 0;

    for (let i = 0; i < allValues.length; i++) {
      let ind = floor(xPct * xCount);
      let vy = allValues[i][ind];
      let yPct = (vy - axis[1][0]) / (axis[1][1] - axis[1][0]);
      let cx = gpx + gsx * xPct;
      let cy = gpy - gsy * yPct;;

      if (yPct >= 0 && yPct <= 1) {
        let y = py + border * (1 + 0.8 * (count + 1));
        count++;

        noStroke();
        fill(255);
        text(cargo[i].name + " = £" + nf(vy, 3, 2), x - 15, y);

        fill(cargo[i].col);
        noStroke();
        ellipse(x - 5, y + 5, 10, 10);

        stroke(255);
        noFill();
        ellipse(cx, cy, 10, 10);
      }
    }
  }
}


function calculateIncome(c, a, d, t) {
  let val = c.base * a * d * 1 / pow(2, 21);

  if (t <= c.days1)
    val *= max(31, 255);

  else if (t <= (c.days1 + c.days2))
    val *= max(31, 255 - (t - c.days1));

  else if (t > (c.days1 + c.days2))
    val *= max(31, 255 - 2 * (t - c.days1) + c.days2);

  return val;
}