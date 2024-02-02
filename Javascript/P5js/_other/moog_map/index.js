
// #region - Setup

let inputs;
let imgDatas;
let camCentreOffset;
let camCentreOffsetVel;
let camScale;
let camScaleVel;


function setup() {
  createCanvas(900, 900, P2D);
  strokeWeight(4);
  setupVariables();
}


function setupVariables() {
  inputs = {};
  imgDatas = [
    { "toShow": true, "col": color(20),
      "image": loadImage("assets/MapMain.png") },
    { "toShow": true, "col": color(255, 0, 220),
      "image": loadImage("assets/MapPath.png") },
    { "toShow": true, "col": color(0, 255, 33),
      "image": loadImage("assets/MapResidential.png") },
    { "toShow": true, "col": color(0, 255, 255),
      "image": loadImage("assets/MapFarm.png") },
    { "toShow": true, "col": color(255, 106, 0),
      "image": loadImage("assets/MapOther.png") },
    { "toShow": false, "col": color(255, 255, 255),
      "image": loadImage("assets/MapSewers.png") }
  ];
  camCentreOffset = {x: 0, y: 0};
  camCentreOffsetVel = {x: 0, y: 0};
  camScale = 1;
  camScaleVel = 0;
}

// #endregion


// #region - Main

function draw() {
  background(120);

  // Update Cam Scale
  camScale += camScaleVel;
  camScaleVel *= 0.9;
  camScale = constrain(camScale, 1, 4);

  // Update Cam Offset
  if (getKey(37)) camCentreOffsetVel.x--;
  if (getKey(38)) camCentreOffsetVel.y--;
  if (getKey(39)) camCentreOffsetVel.x++;
  if (getKey(40)) camCentreOffsetVel.y++;
  camCentreOffset.x += camCentreOffsetVel.x;
  camCentreOffset.y += camCentreOffsetVel.y;
  camCentreOffsetVel.x *= 0.9;
  camCentreOffsetVel.y *= 0.9;
  camCentreOffset = {
    x: constrain(camCentreOffset.x, -(height/1.355) / 2, (height/1.355) / 2),
    y: constrain(camCentreOffset.y, -height/2, height/2)}

  // Move Camera
  translate(width/2, height/2);
  scale(camScale);
  translate(-width/2, -height/2);
  translate(-camCentreOffset.x, -camCentreOffset.y);

  // Show Images
  for (let imgData of imgDatas) {
    if (imgData.toShow) {
      image(imgData.image, (width-(height/1.355)) / 2, 0, (height/1.355), height);
    }
  }

  // Move Camera Back
  translate(camCentreOffset.x, camCentreOffset.y);
  translate(width/2, height/2);
  scale(1/camScale);
  translate(-width/2, -height/2);

  // Draw UI
  for (let i = 0; i < imgDatas.length; i++) {
    noStroke();
    if (imgDatas[i].toShow)
      stroke(64);
    fill(imgDatas[i].col);
    ellipse(50, 50 + 70 * i, 50, 50);

    if (distSq(mouseX, mouseY, 50, 50 + 70 * i) < 25*25) {
      fill(255, 100);
      ellipse(50, 50 + 70 * i, 50, 50);
    }
  }
}


function distSq(x0, y0, x1, y1) {
  return (x1-x0)*(x1-x0) + (y1-y0)*(y1-y0);
}


// Inputs
function mouseWheel(e) {
  camScaleVel -= e.delta*0.0002;
}

function getKey(requestedKey) {
  if (!inputs.hasOwnProperty(requestedKey))
    return false;
  else return inputs[requestedKey];
}

function keyPressed() {
  inputs[keyCode] = true;
}

function keyReleased() {
  inputs[keyCode] = false;
}

function mousePressed() {
  for (let i = 0; i < imgDatas.length; i++) {
    if (distSq(mouseX, mouseY, 50, 50 + 70 * i) < 25*25) {
      imgDatas[i].toShow = !imgDatas[i].toShow;
    }
  }
}

function mouseDragged() {
  let dx = mouseX-pmouseX;
  let dy = mouseY-pmouseY;
  camCentreOffsetVel.x -= dx * 0.2 / camScale;
  camCentreOffsetVel.y -= dy * 0.2 / camScale;
}

// #endregion
