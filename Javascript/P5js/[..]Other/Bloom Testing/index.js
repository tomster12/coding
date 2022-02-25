
class Processor {

  // #region - Main

  constructor() {}


  preload() {
    // Load shaders
    this.blurH = loadShader("base.vert", "blur.frag");
    this.blurV = loadShader("base.vert", "blur.frag");
  }


  setup() {
    // Pass 1 - Horizontal blur
    this.blurHPass = createGraphics(windowWidth, windowHeight, WEBGL);
    this.blurHPass.noStroke();
    this.blurHPass.shader(this.blurH);
    this.blurH.setUniform("texelSize", [1.0 / width, 1.0 / height]);
    this.blurH.setUniform("direction", [1.0, 0.0]);

    // Pass 2 - Vertical blur
    this.blurVPass = createGraphics(windowWidth, windowHeight, WEBGL);
    this.blurVPass.noStroke();
    this.blurVPass.shader(this.blurV);
    this.blurV.setUniform("texelSize", [1.0 / width, 1.0 / height]);
    this.blurV.setUniform("direction", [0.0, 1.0]);
  }


  bloom(input) {
    // Pass 1 - Horizontal blur
    this.blurH.setUniform("tex0", input);
    this.blurHPass.rect(0, 0, width, height);

    // Pass 2 - Vertical blur
    this.blurV.setUniform("tex0", this.blurHPass);
    this.blurVPass.rect(0, 0, width, height);

    // Draw blurred ADD blended
    output.push();
    output.blendMode(ADD);
    output.image(this.blurVPass, 0, 0, width, height);
    output.pop();
  }

  // #endregion
}


// Declare variables
let output;
let processor = new Processor();


function preload() {
  // Load assets
  processor.preload();
}


function setup() {
  // Setup canvas
  createCanvas(800, 800);
  noStroke();

  // Initialize variables
  output = createGraphics(800, 800);
  processor.setup();
}


function draw() {
  background("#1f1f1f");
  output.clear();

  // Draw onto output
  output.strokeWeight(2);
  output.stroke("#f93498");
  output.noFill();
  output.ellipse(mouseX, mouseY,
    100 + sin(frameCount * 0.1) * 50,
    100 + sin(frameCount * 0.1) * 50);

  // Post process then draw output
  processor.bloom(output);
  push();
  blendMode(ADD);
  image(output, 0, 0, width, height);
  pop();
}
