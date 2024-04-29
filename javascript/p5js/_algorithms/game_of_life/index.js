const CELL_SIZE = 4;
const GRID_SIZE = 300;
const ABSORB_PCT = 0.5;
const MIN_ENERGY = 0.1;
const MAX_ENERGY = 20;

let paused = true;
let data;
let world;
let graphics;

function create2DArray(rows, cols, map) {
    let a = [];
    for (let i = 0; i < rows; i++) {
        a.push([]);
        for (let j = 0; j < cols; j++) {
            a[i].push(map(i, j));
        }
    }
    return a;
}

function setup() {
    createCanvas(CELL_SIZE * GRID_SIZE, CELL_SIZE * GRID_SIZE);
    colorMode(HSB, 255);
    textSize(20);

    // Initialize variables
    data = create2DArray(GRID_SIZE, GRID_SIZE, (_) => (random() < 0.3 ? 1 + random() : 0));
    world = create2DArray(GRID_SIZE, GRID_SIZE, (_) => 0);
    graphics = createGraphics(GRID_SIZE, GRID_SIZE);
    graphics.pixelDensity(1);
    graphics.noStroke();
    noSmooth();
}

function draw() {
    handleInput();
    if (!paused && frameCount) iterateSimulation();
    renderSimulation();
}

function handleInput() {
    if (mouseIsPressed) {
        let i = floor(mouseX / CELL_SIZE);
        let j = floor(mouseY / CELL_SIZE);
        if (i >= 0 && i < GRID_SIZE && j >= 0 && j < GRID_SIZE) data[i][j] = 1;
    }
}

function iterateSimulation() {
    let newDataBool = create2DArray(GRID_SIZE, GRID_SIZE, (_) => false);
    let newDataValue = create2DArray(GRID_SIZE, GRID_SIZE, (_) => 0);
    let dataMovements = create2DArray(GRID_SIZE, GRID_SIZE, (_) => []);
    let newWorld = create2DArray(GRID_SIZE, GRID_SIZE, (_) => 0);

    // Iterate cells
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            // Count and track neighbours
            let neighbors = [];
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x === 0 && y === 0) continue;
                    let ni = (i + x + GRID_SIZE) % GRID_SIZE;
                    let nj = (j + y + GRID_SIZE) % GRID_SIZE;
                    if (data[ni][nj] > 0) neighbors.push([ni, nj]);
                }
            }

            // Perform rules, tracking energy movements
            let nc = neighbors.length;
            if (data[i][j] > 0) {
                if (nc < 2 || nc > 3 || data[i][j] < MIN_ENERGY || data[i][j] > MAX_ENERGY) {
                    newDataBool[i][j] = false;
                    for (let n of neighbors) dataMovements[i][j].push(n);
                } else {
                    newDataBool[i][j] = true;
                    for (let n of neighbors) dataMovements[i][j].push(n);
                }
            } else {
                if (nc === 3) {
                    newDataBool[i][j] = true;
                    for (let n of neighbors) dataMovements[n[0]][n[1]].push([i, j]);
                } else {
                    newDataBool[i][j] = false;
                }
            }
        }
    }

    // Move energy between cells
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            // Count number of places to split energy between
            let realMovements = 0;
            if (newDataBool[i][j]) realMovements++;
            for (let m of dataMovements[i][j]) {
                if (newDataBool[m[0]][m[1]]) realMovements++;
            }

            // If no movements dissipate to world
            if (realMovements === 0) {
                world[i][j] += data[i][j];
            } else {
                // Absorb some energy from world
                if (world[i][j] < data[i][j]) {
                    data[i][j] += world[i][j] * ABSORB_PCT;
                    world[i][j] -= world[i][j] * ABSORB_PCT;
                }

                // Split energy between neighbours and self
                if (newDataBool[i][j]) newDataValue[i][j] += data[i][j] / realMovements;
                for (let m of dataMovements[i][j]) {
                    if (newDataBool[m[0]][m[1]]) {
                        newDataValue[m[0]][m[1]] += data[i][j] / realMovements;
                    }
                }
            }
        }
    }

    // Diffuse world energy
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (world[i][j] === 0) continue;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    let ni = (i + x + GRID_SIZE) % GRID_SIZE;
                    let nj = (j + y + GRID_SIZE) % GRID_SIZE;
                    newWorld[ni][nj] += world[i][j] / 9;
                }
            }
        }
    }

    data = newDataValue;
    world = newWorld;
}

function renderSimulation() {
    graphics.background(0);

    // Draw to graphics with pixels
    graphics.loadPixels();
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            let c = null;
            if (data[i][j] > 0) c = getDataColour(data[i][j]);
            else if (world[i][j] > 0) c = getEnergyColor(world[i][j]);
            if (c != null) {
                c = HSBToRGB(c);
                let index = 4 * (i + j * GRID_SIZE);
                graphics.pixels[index + 0] = c[0];
                graphics.pixels[index + 1] = c[1];
                graphics.pixels[index + 2] = c[2];
            }
        }
    }
    graphics.updatePixels();

    image(graphics, 0, 0, CELL_SIZE * GRID_SIZE, CELL_SIZE * GRID_SIZE);

    // Sum energy over world and data
    let totalEnergy = 0;
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            totalEnergy += data[i][j] + world[i][j];
        }
    }
    fill(255);
    text("Total Energy: " + totalEnergy.toFixed(2), 10, 30);
}

function getDataColour(value) {
    let pct = value / MAX_ENERGY;
    let h = Math.min(pct, 0.9) * 255;
    let s = pct < 0.9 ? 255 : 255 * (1 - (pct - 0.9) / 0.1);
    return [Math.min(h, 220), s, 255];
}

function getEnergyColor(value) {
    let pct = value / 2;

    // 0 -> 1 : [0, 255, 0 -> 150]
    if (pct < 1) return [0, 255, pct * 150];

    // 1 -> 2 : [0, 255 -> 0, 150 -> 255]
    if (pct < 2) return [0, 255 * (2 - pct), 150 + 105 * (pct - 1)];

    // 2 -> inf: [0 -> 255, 0 -> 255, 255]
    return [255 * (pct - 2), 255 * (pct - 2), 255];
}

function HSBToRGB(c) {
    h = (c[0] * 360) / 255;
    s = c[1] / 255;
    b = c[2] / 255;
    const k = (n) => (n + h / 60) % 6;
    const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
    return [255 * f(5), 255 * f(3), 255 * f(1)];
}

function keyPressed() {
    if (key === " ") paused = !paused;
}
