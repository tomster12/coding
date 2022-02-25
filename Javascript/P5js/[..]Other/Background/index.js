
// setInterval(() => {planetAngle0 += 0.01;}, 5);
// setInterval(() => {planetAngle1 += 0.005;}, 5);


// #region - Setup

// Declare variables
let planetRadius;
let planetAtmosphereDist0;
let planetAtmosphereDist1;
let planetAngle0;
let planetAngle1;
let planetLand;
let starsAmount;
let stars;

function setup() {
  // Main setup
  createCanvas(window.innerWidth, window.innerHeight);
  fullscreen();
  setupVariables();
}


function setupVariables() {
  // Initialize variables
  planetRadius = 75;
  planetAtmosphereDist0 = 20;
  planetAtmosphereDist1 = 3;
  planetAngle0 = 0;
  planetAngle1 = 0;
  planetLand = [];
  starsAmount = window.innerHeight * window.innerWidth / 16000;
  stars = [];

  // Other setupVariables
  populateStars();
  generatePlanetLand();
}


function populateStars() {
  // Populate stars
  for (let i = 0; i < starsAmount; i++) {

    // While havent found a valid position
    let radius = random(10) + 1;
    let count = 0;
    let pos;
    let valid = false;
    while (!valid) {
      count++;
      if (count > 20) break;
      pos = createVector(random(width), random(height));
      valid = true;

      // Too close to planet
      if (dist(pos.x, pos.y, width * 0.5, height * 0.5) <
      (planetRadius + planetAtmosphereDist0 + planetAtmosphereDist1 + 20))
        valid = false;

      // Too close to other stars
      for (let o = 0; o < stars.length; o++) {
        if (dist(pos.x, pos.y, stars[o][0].x, stars[o][0].y) <
        (stars[o][1] + radius))
          valid = false;
      }
    }

    // Found valid position
    if (valid) {
      stars.push([pos, radius]);
    } else break;
  }
}


function generatePlanetLand() {
  // for (let i = 0; i < 40; i++) {
  //   let pointAngle0 = random(TWO_PI);
  //   let pointAngle1 = random(TWO_PI) - PI;
  //   planetLand.push([pointAngle0, pointAngle1]);
  // }

  planetLand.push([]);
  let centreAngle0 = random(TWO_PI);
  let centreAngle1 = random(TWO_PI) - PI;
  let maxDist = random(PI * 0.2) + PI * 0.2;
  let points = random(5) + 10;
  for (let i = 0; i < points; i++) {
    let pointAngle0 = centreAngle0 + cos(TWO_PI * i / points) * maxDist;
    let pointAngle1 = centreAngle1 + sin(TWO_PI * i / points) * maxDist;
    planetLand[0].push([pointAngle0, pointAngle1]);
  }
}

// #endregion


// #region - Main

function draw() {
  // Background
  background(35, 31, 32);

  // Main update
  drawStars();
  drawPlanet();
}


function drawStars() {
  // Stars
  noStroke();
  fill(255, 255, 255);
  for (let star of stars)
    ellipse(star[0].x, star[0].y, star[1], star[1]);
}


function drawPlanet() {
  // Body
  noStroke();
  fill(95, 170, 199);
  ellipse(width * 0.5, height * 0.5,
    (planetRadius) * 2, (planetRadius) * 2);

  // Atmosphere
  stroke(255, 255, 255);
  noFill();
  ellipse(width * 0.5, height * 0.5,
    (planetRadius + planetAtmosphereDist0) * 2,
    (planetRadius + planetAtmosphereDist0) * 2);
  stroke(126, 205, 222);
  ellipse(width * 0.5, height * 0.5,
    (planetRadius + planetAtmosphereDist0 + planetAtmosphereDist1) * 2,
    (planetRadius + planetAtmosphereDist0 + planetAtmosphereDist1) * 2);

  // Land
  noStroke();
  fill(255);
  for (let land of planetLand) {
    if (land.length > 2) {
      beginShape();

      // Point 0
      let finalAngle00 = land[0][0] + planetAngle0;
      let finalAngle01 = land[0][1] + planetAngle1;
      let point3D0 = createVector(
        cos(finalAngle00) * cos(finalAngle01) * planetRadius,
        sin(finalAngle00) * cos(finalAngle01) * planetRadius,
        sin(finalAngle01) * planetRadius
      );

      // Connect to other points
      for (let i = 1; i < land.length - 2; i++) {
        // vertex(width * 0.5 + point3D0.x, height * 0.5 + point3D0.z);
        ellipse(width * 0.5 + point3D0.x, height * 0.5 + point3D0.z, 10, 10);

        // Point 1
        let finalAngle10 = land[i][0] + planetAngle0;
        let finalAngle11 = land[i][1] + planetAngle1;
        let point3D1 = createVector(
          cos(finalAngle10) * cos(finalAngle11) * planetRadius,
          sin(finalAngle10) * cos(finalAngle11) * planetRadius,
          sin(finalAngle11) * planetRadius
        );
        // vertex(width * 0.5 + point3D1.x, height * 0.5 + point3D1.z);
        ellipse(width * 0.5 + point3D1.x, height * 0.5 + point3D1.z, 10, 10);

        // Point 2
        let finalAngle20 = land[i + 1][0] + planetAngle0;
        let finalAngle21 = land[i + 1][1] + planetAngle1;
        let point3D2 = createVector(
          cos(finalAngle20) * cos(finalAngle21) * planetRadius,
          sin(finalAngle20) * cos(finalAngle21) * planetRadius,
          sin(finalAngle21) * planetRadius
        );
        // vertex(width * 0.5 + point3D2.x, height * 0.5 + point3D2.z);
        ellipse(width * 0.5 + point3D2.x, height * 0.5 + point3D2.z, 10, 10);
        endShape();
      }
    }
  }
}

// #endregion
