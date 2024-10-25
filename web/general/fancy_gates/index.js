const GRID_SIZE = 100;

let mainCanvas, mainCtx;
let mousePos = { x: 0, y: 0 };
let isMouseDown = false;
let bgPattern;

function setup() {
    mainCanvas = document.getElementById("mainCanvas");
    mainCtx = mainCanvas.getContext("2d");
    mainCtx.imageSmoothingEnabled = false;

    window.addEventListener("resize", onWindowResized);
    mainCanvas.addEventListener("click", onMouseClicked);
    mainCanvas.addEventListener("mousemove", onMouseMoved);
    mainCanvas.addEventListener("mousedown", onMouseDown);
    mainCanvas.addEventListener("mouseup", onMouseUp);
    onWindowResized();

    createBackgroundPattern();
}

function createBackgroundPattern() {
    const patternCanvas = document.createElement("canvas");
    const patternCtx = patternCanvas.getContext("2d");
    patternCanvas.width = GRID_SIZE;
    patternCanvas.height = GRID_SIZE;
    drawPeg(patternCtx, GRID_SIZE / 2, GRID_SIZE / 2);
    bgPattern = mainCtx.createPattern(patternCanvas, "repeat");
}

function draw() {
    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    mainCtx.fillStyle = bgPattern;
    mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    mainCtx.fill();

    drawBulb(mainCtx, (2 + 0.5) * GRID_SIZE, (2 + 0.5) * GRID_SIZE, isMouseDown);

    requestAnimationFrame(draw);
}

function drawRoundedSquare(ctx, x, y, size, radius) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5 + radius, y - size * 0.5);
    ctx.arcTo(x + size * 0.5, y - size * 0.5, x + size * 0.5, y + size * 0.5, radius);
    ctx.arcTo(x + size * 0.5, y + size * 0.5, x - size * 0.5, y + size * 0.5, radius);
    ctx.arcTo(x - size * 0.5, y + size * 0.5, x - size * 0.5, y - size * 0.5, radius);
    ctx.arcTo(x - size * 0.5, y - size * 0.5, x + size * 0.5, y - size * 0.5, radius);
    ctx.closePath();
    ctx.fill();
}

function drawPeg(ctx, x, y) {
    const PEG_SIZE = GRID_SIZE * 0.1;

    ctx.fillStyle = "#eaeaea";
    ctx.beginPath();
    ctx.arc(x - PEG_SIZE * 0.5, y - PEG_SIZE * 0.5, PEG_SIZE, 0, 2 * Math.PI);
    ctx.fill();
}

function drawBulb(ctx, x, y, on = false) {
    const SIZE = GRID_SIZE * 0.7;
    const BASE_HEIGHT = GRID_SIZE * 0.15;
    const BASE_RADIUS = SIZE * 0.2;
    const JAR_RADIUS = SIZE * 0.35;
    const JAR_HEIGHT = SIZE * 0.5;
    const INDICATOR_WIDTH = JAR_RADIUS * 0.5;
    const INDICATOR_STEM_WIDTH = JAR_RADIUS * 0.35;
    const INDICTOR_HEIGHT = JAR_HEIGHT * 0.65;

    // Draw base
    ctx.fillStyle = "#989898";
    drawRoundedSquare(ctx, x, y, SIZE, BASE_RADIUS);
    ctx.fillStyle = "#a8a8a8";
    drawRoundedSquare(ctx, x, y - BASE_HEIGHT, SIZE, BASE_RADIUS);

    // Draw bulb jar base
    ctx.fillStyle = "#868686";
    ctx.beginPath();
    ctx.arc(x, y - BASE_HEIGHT, JAR_RADIUS, 0, 2 * Math.PI);
    ctx.fill();

    // Draw bulb indicator
    ctx.fillStyle = "#414141";
    ctx.beginPath();
    ctx.arc(x, y - BASE_HEIGHT, INDICATOR_STEM_WIDTH * 0.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillRect(x - INDICATOR_STEM_WIDTH * 0.5, y - BASE_HEIGHT - INDICTOR_HEIGHT, INDICATOR_STEM_WIDTH, INDICTOR_HEIGHT);
    ctx.fillStyle = on ? "#ffc74d" : "#414141";
    ctx.beginPath();
    ctx.arc(x, y - BASE_HEIGHT - INDICTOR_HEIGHT, INDICATOR_WIDTH, 0, 2 * Math.PI);
    ctx.fill();

    // Draw bulb jar
    ctx.fillStyle = on ? "#ded0af9d" : "#cecece9d";
    ctx.beginPath();
    ctx.moveTo(x - JAR_RADIUS, y - BASE_HEIGHT);
    ctx.lineTo(x + JAR_RADIUS, y - BASE_HEIGHT);
    ctx.arcTo(x + JAR_RADIUS, y - BASE_HEIGHT + JAR_RADIUS, x, y - BASE_HEIGHT + JAR_RADIUS, JAR_RADIUS);
    ctx.arcTo(x - JAR_RADIUS, y - BASE_HEIGHT + JAR_RADIUS, x - JAR_RADIUS, y - BASE_HEIGHT, JAR_RADIUS);
    ctx.lineTo(x - JAR_RADIUS, y - BASE_HEIGHT - JAR_HEIGHT);
    ctx.arcTo(x - JAR_RADIUS, y - BASE_HEIGHT - JAR_HEIGHT - JAR_RADIUS, x, y - BASE_HEIGHT - JAR_HEIGHT - JAR_RADIUS, JAR_RADIUS);
    ctx.arcTo(x + JAR_RADIUS, y - BASE_HEIGHT - JAR_HEIGHT - JAR_RADIUS, x + JAR_RADIUS, y - BASE_HEIGHT - JAR_HEIGHT, JAR_RADIUS);
    ctx.lineTo(x + JAR_RADIUS, y - BASE_HEIGHT);
    ctx.closePath();
    ctx.fill();
}

// ================= Event Handlers =================

function onMouseClicked(e) {}

function onMouseMoved(e) {
    mousePos = { x: e.clientX, y: e.clientY };
}

function onMouseDown(e) {
    isMouseDown = true;
}

function onMouseUp(e) {
    isMouseDown = false;
}

function onWindowResized() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
}

// ================= Driver =================

setup();
draw();
