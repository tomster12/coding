
// Setup global variables
let currentScreen = 0;

// Setup pipeline variables
let pipelines = [
  { count: 0,
    parrallel: true,
    processors: [
      [[0], 0.01],
      [[], 0.03],
      [[], 0.02]
    ] },
  { count: 0,
    parrallel: false,
    processors: [
      [[0], 0.01],
      [[], 0.03],
      [[], 0.02]
    ] }
];

// Setup CPU variables
let cyclePosition = 0;
let cycleWaiting = false;
let cycleWaitingTime = 0;
let cycleWaitingTimeMax = 60;
let cycleFrameStart = 0;
let cycleFramesTaken = 0;
let cycleWaitingFrameStart = 0;
let cycleWaitingFramesTaken = 0;


function setup() {
  // Main setup
  createCanvas(800, 800);
  textAlign(CENTER);
}


function draw() {
  background(220);

  // Pipelining example
  if (currentScreen == 0) {

    // Show input text
    noStroke();
    fill(0);
    textSize(30);
    text("Arrow keys to change screen", width * 0.5, 60);
    text("Each dot above represent steps of a process.", width * 0.5, height - 150);
    text("Starting the next cycle during the processing", width * 0.5, height - 120);
    text("of the first is quicker. This is parallelism.", width * 0.5, height - 90);

    // For each pipeline
    for (let i = 0; i < pipelines.length; i++) {
      let pipeline = pipelines[i];

      // Draw central line
      let startX = 50;
      let endX = width - 50;
      let posY = height * 0.3 * (i + 1);
      strokeWeight(2);
      stroke(200, 50, 50);
      noFill();
      line(startX, posY,
        endX, posY);

      // Show count
      noStroke();
      fill(0);
      text(pipeline.count, width * 0.5, posY - 30);

      // Show each processor
      for (let i = 0; i < pipeline.processors.length; i++) {
        let localStartX = map(i, 0, pipeline.processors.length, startX, endX);
        let localEndX = map(i + 1, 0, pipeline.processors.length, startX, endX);
        fill(50, 200, 50);
        ellipse(localEndX, posY, 30, 30);

        // Show first process
        fill(50, 50, 200);
        for (let process of pipeline.processors[i][0])
          ellipse(map(process, 0, 1, localStartX, localEndX), posY, 20, 20);

        // Handle first process
        if (pipeline.processors[i][0].length > 0) {
          pipeline.processors[i][0][0] += pipeline.processors[i][1];
          if (pipeline.processors[i][0][0] >= 1) {
            pipeline.processors[i][0].splice(0, 1);
            if (i < pipeline.processors.length - 1) pipeline.processors[i + 1][0].push(0);
            if (i == pipeline.processors.length - 1) pipeline.count++;
            if (i == 0 && pipeline.parrallel
              || (i == pipeline.processors.length - 1 && !pipeline.parrallel))
              pipeline.processors[0][0].push(0);
          }
        }
      }
    }

  // Von Neumman Bottleneck example
  } else if (currentScreen == 1) {

    // Show speed
    noStroke();
    fill(0);
    textSize(30);
    text("Arrow keys to change screen", width * 0.5, 60);
    text(nf(cycleFramesTaken / 60, 1, 3) + "s for cycle", width * 0.5, 90);
    text(nf(cycleWaitingFramesTaken / 60, 1, 3) + "s for storage", width * 0.5, 120);
    text("This represents the main cycle and the waiting", width * 0.5, height - 150);
    text("time in between of reading / writing to storage.", width * 0.5, height - 120);
    text("although this is a dramatization this causes", width * 0.5, height - 90);
    text("a large bottleneck with von neumman architecture.", width * 0.5, height - 60);

    // Cycle in process
    if (!cycleWaiting) {
      cyclePosition += 0.1;
      if (cyclePosition > TWO_PI) {
        cycleWaiting = true;
        cyclePosition = 0;
        cycleWaitingFrameStart = frameCount;
      }

    // Cycle waiting
    } else {
      cycleWaitingTime++;
      if (cycleWaitingTime > cycleWaitingTimeMax) {
        cycleWaiting = false;
        cycleWaitingTime = 0;
        cycleFramesTaken = frameCount - cycleFrameStart;
        cycleFrameStart = frameCount;
        cycleWaitingFramesTaken = frameCount - cycleWaitingFrameStart;
      }
    }

    // Show cycle
    stroke(30);
    noFill();
    ellipse(width * 0.5, height * 0.45, 150, 150);
    noStroke();
    fill(50, 200, 50);
    ellipse(width * 0.5, height * 0.45 + 75, 30, 30);

    // Show current position during movement
    fill(50, 50, 200);
    if (!cycleWaiting) {
      let posX = width * 0.5 + cos(cyclePosition + PI / 2) * 75;
      let posY = height * 0.45 + sin(cyclePosition + PI / 2) * 75;
      ellipse(posX, posY, 20, 20);

    // Show current position during waiting
    } else {
      let posX = width * 0.5;
      let posY = height * 0.45 + 75
      + (cycleWaitingTime < (cycleWaitingTimeMax / 2)
        ? cycleWaitingTime * 2
        : cycleWaitingTimeMax * 2 - cycleWaitingTime * 2);
      ellipse(posX, posY, 20, 20);
    }
  }
}


function keyPressed() {
  // Change screen
  if (keyCode == 37 || keyCode == 39)
    currentScreen = (currentScreen + 1) % 2;
}
