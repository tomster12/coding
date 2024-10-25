let canvas, ctx;
let mousePos = { x: 0, y: 0 };
let isMouseDown = false;

function setup() {
    canvas = document.getElementById("mainCanvas");
    ctx = canvas.getContext("2d");

    window.addEventListener("resize", onWindowResized);
    canvas.addEventListener("click", onMouseClicked);
    canvas.addEventListener("mousemove", onMouseMoved);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);

    onWindowResized();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = isMouseDown ? "red" : "blue";
    ctx.fill();

    requestAnimationFrame(draw);
}

// --- Event Handlers ---

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
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// --- Driver ---

setup();
draw();
