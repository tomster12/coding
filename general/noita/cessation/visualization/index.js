const COLOURS = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
];

const POS_SPEED = 2;
const ROT_SPEED = 0.006;
const GLYPH_BOX_SIZE = 8;
const GLYPH_SIZE = GLYPH_BOX_SIZE * 5;

const MESSAGES = [
    "22411111321211111120",
    "311411241111311130",
    "1211411111121112112220",
    "3242151211211130",
    "32411114111112111120",
    "122421141112122120",
    "111152241221211120",
    "12151111412221230",
    "12242241221211120",
    "113411114111112121110",
    "12151124111212230",
    "12151341112212120",
    "12111122241211122120",
    "31521141112211130",
    "1134224212221120",
    "122421141211211130",
    "31511241211122120",
    "315211411122111120",
    "121511241121111230",
    "31511241221111130",
    "12114221111212112130",
    "1211111111242111212110",
    "12114211412221230",
    "3151115121121230",
    "324224212221120",
    "31141124112312120",
    "31513421211110",
];

const GLYPH_MAP = [
    [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
    ],
    [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ],
    [
        [0, 1, 0],
        [0, 0, 0],
        [0, 1, 0],
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
    ],
    [
        [0, 1, 0],
        [1, 0, 1],
        [0, 1, 0],
    ],
    [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0],
    ],
];

// ----------------------------------

let rot = { x: 0, z: 0 };
let pos = { x: 0, y: 0 };
let zoom = 1;
let isOrtho = false;
let keyboardInput = {};

function setup() {
    createCanvas(1280, 720, WEBGL);
}

// ----------------------------------

function draw() {
    background(0);

    // Handle mouse input
    if (mouseIsPressed) {
        rot.x += (pmouseY - mouseY) * ROT_SPEED;
        rot.z += (pmouseX - mouseX) * ROT_SPEED;
    }

    // Handle keyboard input
    if (keyboardInput["a"]) pos.x += POS_SPEED;
    if (keyboardInput["d"]) pos.x -= POS_SPEED;
    if (keyboardInput["w"]) pos.y += POS_SPEED;
    if (keyboardInput["s"]) pos.y -= POS_SPEED;

    // Apply transformations
    scale(zoom);
    rotateX(rot.x);
    rotateZ(rot.z);
    translate(pos.x, pos.y, 0);

    // Draw messages
    translate(-GLYPH_SIZE * 12, -GLYPH_SIZE * 13.5, 0);
    for (let i = 0; i < MESSAGES.length; i++) {
        drawMessage(MESSAGES[i]);
        translate(0, GLYPH_SIZE, 0);
    }
}

function drawMessage(message) {
    push();
    for (let i = 0; i < message.length; i++) {
        const size = Number(message[i]);
        if (size < 2) {
            drawGlyph(message[i]);
        } else {
            push();
            for (let j = 0; j < size; j++) {
                drawGlyph(message[i]);
                translate(0, 0, GLYPH_BOX_SIZE);
            }
            pop();
        }
        translate(GLYPH_SIZE * size, 0, 0);
    }
    pop();
}

function drawGlyph(glyph) {
    fill(COLOURS[glyph]);
    noStroke();
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            if (GLYPH_MAP[glyph][y][x] === 1) {
                push();
                translate(
                    (1.5 + x) * GLYPH_BOX_SIZE,
                    (1.5 + y) * GLYPH_BOX_SIZE,
                    0
                );
                box(GLYPH_BOX_SIZE);
                pop();
            }
        }
    }
}

function mouseWheel(event) {
    zoom += event.delta * -0.001;
    zoom = constrain(zoom, 0.1, 10);
}

function keyPressed() {
    if (keyCode == 32) {
        if (!isOrtho) {
            ortho();
            isOrtho = true;
        } else {
            perspective();
            isOrtho = false;
        }
    }

    keyboardInput[key] = true;
}

function keyReleased() {
    keyboardInput[key] = false;
}
