
// #region - Configs

let fireworkConfigs = [];


fireworkConfigs.push(() => ({
  dirOffset: randomBetween(PI * -0.05, PI * 0.05),
  dirVel: randomBetween(30, 35),
  bodyConfig: {
    fadeOut: false,
    bodyColour: "#3cf575",
    bodySize: randomBetween(3, 4),
    maxTime: randomBetween(0.8, 0.9)},

  onExplode: (fw) => {
    let explodeConfig = {
      amount: randomBetween(180, 220),

      getParticleConfig: () => ({
        dirOffset: randomBetween(PI * -0.05, PI * 0.05),
        dirVel: randomBetween(0, 8),
        bodyConfig: {
          fadeOut: true,
          bodyColour: "#3cf575",
          bodySize: randomBetween(2, 3),
          maxTime: randomBetween(0.6, 0.7)},

        onExplode: (fw) => {}
      }) };

    Particle.angleExplode(fw, explodeConfig, 0, TWO_PI);
  }
}));


fireworkConfigs.push(() => ({
  dirOffset: randomBetween(PI * -0.05, PI * 0.05),
  dirVel: randomBetween(40, 45),
  bodyConfig: {
    fadeOut: false,
    bodyColour: "#3cf5bd",
    bodySize: randomBetween(3, 4),
    maxTime: randomBetween(0.8, 0.9)},

  onExplode: (fw) => {
    let explodeConfig = {
      amount: randomBetween(80, 120),

      getParticleConfig: () => ({
        dirOffset: randomBetween(PI * -0.05, PI * 0.05),
        dirVel: randomBetween(0, 8),
        bodyConfig: {
          fadeOut: true,
          bodyColour: "#3cf5bd",
          bodySize: randomBetween(2, 3),
          maxTime: randomBetween(1, 2)},

        onExplode: (fw) => {}
      }) };

    Particle.angleExplode(fw, explodeConfig, PI * -0.05, PI * 0.05);
    Particle.angleExplode(fw, explodeConfig, PI * 0.45, PI * 0.55);
    Particle.angleExplode(fw, explodeConfig, PI * 0.95, PI * 1.05);
    Particle.angleExplode(fw, explodeConfig, PI * -0.55, PI * -0.45);
  }
}));


fireworkConfigs.push(() => ({
  dirOffset: randomBetween(PI * -0.05, PI * 0.05),
  dirVel: randomBetween(35, 40),
  bodyConfig: {
    fadeOut: false,
    bodyColour: "#f1ad46",
    bodySize: randomBetween(3, 5),
    maxTime: randomBetween(0.8, 0.9)},

  onExplode: (fw) => {
    let explodeConfig = {
      amount: randomBetween(180, 220),

      getParticleConfig: () => ({
        dirOffset: randomBetween(PI * -0.05, PI * 0.05),
        dirVel: randomBetween(0.1, 5),
        bodyConfig: {
          fadeOut: true,
          bodyColour: "#f1ad46",
          bodySize: randomBetween(1, 2),
          maxTime: randomBetween(4, 4.2)},

        onExplode: (fw) => {}
      }) };

    Particle.angleExplode(fw, explodeConfig, -PI * 0.4, PI * 0.4);
  }
}));


fireworkConfigs.push(() => ({
  dirOffset: randomBetween(PI * -0.12, PI * 0.12),
  dirVel: randomBetween(35, 40),
  bodyConfig: {
    fadeOut: true,
    bodyColour: "#f04028",
    bodySize: randomBetween(3, 4),
    maxTime: randomBetween(0.4, 0.5)},

  onExplode: (fw) => {}
}));

// #endregion


// #region - Setup

// Declare variables
let sounds;
let objects;


function preload() {
  // Load firework sfxs
}


function setup() {
  createCanvas(800, 800, P2D);
  background(0);
  noStroke();
  setupVariables();
}


function setupVariables() {
  // Initialize variables
  objects = [];
  objects.push(new FireworkMaker(
    { x: width * 0.5, y: height * 0.8 },
    [ {time: 0, firework: 3, amount: 2},
      {time: 0, firework: 0, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 2},
      {time: 0.05, firework: 3, amount: 20},
      {time: 0.3, firework: 3, amount: 2},
      {time: 0.5, firework: 3, amount: 2},
      {time: 0.7, firework: 3, amount: 2},
      {time: 0.9, firework: 3, amount: 2},
      {time: 1.1, firework: 2, amount: 2},
      {time: 0.8, firework: 3, amount: 2},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4},
      {time: 0.02, firework: 3, amount: 4} ]
  ));
}

// #endregion


// #region - Main

function draw() {
  background(0, 100);
  let dt = 1 / frameRate();

  // Show and update all objects
  for (let obj of objects) obj.update(dt);
  for (let obj of objects) obj.show();
}


function randomBetween(a, b) {
  // Returns a random number between limits
  return a + random() * (b - a);
}


function alphaColor(aColor, alpha) {
  // Return a hex colour with a given alpha
  let c = color(aColor);
  return color('rgba(' +  [red(c), green(c), blue(c), alpha].join(',') + ')');
}

// #endregion


// #region - Input

function mousePressed() {
  // Add a firework at the mouse
  objects.push(new Particle(
    fireworkConfigs[floor(random(fireworkConfigs.length))](),
    { x: mouseX, y: mouseY },
    { x: 0, y: 0 },
    PI * -0.5
  ));
}

// #endregion



class FireworkMaker {

    // #region - Setup

    constructor(pos_, processes_) {
      // Declare and initialize variables
      this.pos = pos_;
      this.processes = processes_;
      this.running = false;
      this.time = 0;
      this.currentIndex = 0;
    }

    // #endregion


    // #region - Main


    update(dt) {
      // Update time when running
      if (this.running) {
        this.time += dt;
        let currentProcess = this.processes[this.currentIndex];

        // Create firework when it is time
        if (this.time > currentProcess.time) {
          for (let i = 0; i < currentProcess.amount; i++) {
            objects.push(new Particle(
              fireworkConfigs[currentProcess.firework](),
              { x: this.pos.x, y: this.pos.y },
              { x: 0, y: 0 },
              PI * -0.5)
            );
          }

          // Move to next process and stop if needed
          this.time = 0;
          this.currentIndex += 1;
          if (this.currentIndex >= this.processes.length) this.stop();
        }
      }
    }


    show() {
      // Show as box
      stroke(255);
      noFill();
      rect(this.pos.x - 5, this.pos.y, 10, 10);
      noStroke();
    }


    start() {
      // Start the maker
      this.running = true;
      this.time = 0;
      this.currentIndex = 0;
    }


    stop() {
      // Stop the maker
      this.running = false;
      this.time = 0;
      this.currentIndex = 0;
    }

    // #endregion
}


class Particle {

  // #region - Setup

  constructor(config_, startPos, startVel, startDir) {
    // Declare and initialize variables
    this.config = config_;
    this.bodyConfig = config_.bodyConfig;
    this.pos = startPos;
    this.dir = startDir + config_.dirOffset;
    this.vel = {
      x: startVel.x + cos(this.dir) * this.config.dirVel / this.bodyConfig.bodySize,
      y: startVel.y + sin(this.dir) * this.config.dirVel / this.bodyConfig.bodySize };
    this.time = 0;
  }

  // #endregion


  // #region - Main

  update(dt) {
    // Update time
    this.time += dt;
    if (this.time >= this.bodyConfig.maxTime) {
      objects.splice(objects.indexOf(this), 1);
      this.config.onExplode(this);
    }

    // Add gravity (A = F / M)
    this.vel.y += 0.3 / this.bodyConfig.bodySize;

    // Update position
    this.vel.x *= 0.99;
    this.vel.y *= 0.99;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }


  show() {
    // Show body
    let alpha = 1;
    if (this.bodyConfig.fadeOut)
      alpha -= this.time / this.bodyConfig.maxTime;
    fill(alphaColor(this.bodyConfig.bodyColour, alpha));
    ellipse(this.pos.x, this.pos.y,
      this.bodyConfig.bodySize,
      this.bodyConfig.bodySize
    );
  }


  static angleExplode(fw, explodeConfig, angleA, angleB) {
    // Release objects circularly with a given config
    for (let i = 0; i < explodeConfig.amount; i++) {
      let particleConfig = explodeConfig.getParticleConfig();
      let angle = fw.dir + angleA + (i / explodeConfig.amount) * (angleB - angleA);
      let dir = { x: cos(angle), y: sin(angle) };
      objects.push(new Particle(
        particleConfig,
        { x: fw.pos.x, y: fw.pos.y },
        { x: fw.vel.x, y: fw.vel.y },
        angle
      ));
    }
  }

  // #endregion
}
