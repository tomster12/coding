// #region - Driver

let INPUT;
let T_GRID;
let CAM;

function setup() {
    createCanvas(800, 800);
    noSmooth();

    // Init globals
    for (let i = 0; i < T_TYPES.length; i++)
        T_TYPES[i].color = color(T_TYPES[i].colorHex);
    INPUT = new Input();
    T_GRID = new TerrainGrid(200, 5, 5);
    CAM = new Camera(500, 500, 2);
    generateTerrain(1);
}

function generateTerrain(type) {
    // Populate standard terrain
    if (type == 0) {
        for (let x = 0; x < T_GRID.gridWidth; x++) {
            let grassStart =
                T_GRID.gridHeight * 0.4 +
                floor(noise(x * 0.02) * T_GRID.gridHeight * 0.4);
            let dirtStart = grassStart + 2 + floor(noise(x * 0.3, 100) * 4);
            let stoneStart = dirtStart + 10 + floor(noise(x * 0.3, 200) * 5);

            for (let y = grassStart; y < dirtStart; y++)
                T_GRID.setCell(x, y, "grass");
            for (let y = dirtStart; y < stoneStart; y++)
                T_GRID.setCell(x, y, "dirt");
            for (let y = stoneStart; y < T_GRID.gridHeight; y++)
                T_GRID.setCell(x, y, "stone");
        }

        // Generate cavern like structure
    } else if (type == 1) {
        for (let x = 0; x < T_GRID.gridWidth; x++) {
            for (let y = 0; y < T_GRID.gridHeight; y++) {
                let r = noise(x * 0.02, y * 0.02);

                if (r < 0.5) continue;
                else if (r < 0.55) T_GRID.setCell(x, y, "grass");
                else if (r < 0.6) T_GRID.setCell(x, y, "dirt");
                else T_GRID.setCell(x, y, "stone");
            }
        }
    }
}

function draw() {
    background("#060506");

    // Perform draw functions
    CAM.update();
    CAM.transform();
    T_GRID.show();
    INPUT.draw();
}

// #endregion

// #region - Camera

class Camera {
    MOVE_ACC = 0.5;
    MOVE_DRAG = 0.92;
    SCALE_ACC = 0.5;
    SCALE_DRAG = 0.95;

    constructor(sx, sy, sscale) {
        // Initialize variables
        this.pos = { x: sx, y: sy };
        this.posVel = { x: 0, y: 0 };
        this.scale = sscale;
        this.scaleVel = 0;
    }

    update() {
        // Handle inputs
        this.posVel.x += INPUT.keys.held[37] ? -this.MOVE_ACC : 0;
        this.posVel.x += INPUT.keys.held[39] ? this.MOVE_ACC : 0;
        this.posVel.y += INPUT.keys.held[38] ? -this.MOVE_ACC : 0;
        this.posVel.y += INPUT.keys.held[40] ? this.MOVE_ACC : 0;

        // Update values
        this.pos.x += this.posVel.x;
        this.pos.y += this.posVel.y;
        this.scale += this.scaleVel;
        this.posVel.x *= this.MOVE_DRAG;
        this.posVel.y *= this.MOVE_DRAG;
        this.scaleVel *= this.SCALE_DRAG;
    }

    transform() {
        // Perform transformations
        translate(width * 0.5, height * 0.5);
        scale(this.scale);
        translate(-this.pos.x, -this.pos.y);
    }
}

// #endregion

// #region - Terrain

class TerrainType {
    constructor(name, colorHex) {
        this.name = name;
        this.colorHex = colorHex;
        this.color = null;
    }
}

const T_TYPES = [
    new TerrainType("grass", "#3eb93a", 0.1),
    new TerrainType("dirt", "#423628", 0.2),
    new TerrainType("stone", "#828282", 0.6),
];

const T_TYPES_LOOKUP = {};
for (let i = 0; i < T_TYPES.length; i++) T_TYPES_LOOKUP[T_TYPES[i].name] = i;

class TerrainChunk {
    constructor(size) {
        // Initialize variables
        this.output = createGraphics(size, size);
        this.size = size;
        this.hasChanged = false;

        // Create cell grid
        this.cells = [];
        for (let x = 0; x < this.size; x++) {
            this.cells.push([]);
            for (let y = 0; y < this.size; y++) {
                this.cells[x][y] = null;
            }
        }

        // Initial output update
        this.updateOutput();
    }

    getOutput() {
        // Update output if needed
        if (this.hasChanged) {
            this.updateOutput();
            this.hasChanged = false;
        }

        // Return updated output
        return this.output;
    }

    updateOutput() {
        // Clear output and load pixels
        this.output.clear();
        this.output.loadPixels();

        // Loop over all grid positions
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const cell = this.getCell(x, y);
                if (cell == null) continue;

                // Calculate and draw grid position
                const col = T_TYPES[cell].color;
                this.output.set(x, y, col);
            }
        }

        // Update output with new pixels
        this.output.updatePixels();
    }

    setCell(x, y, type) {
        // Update cell, and check if hasChanged
        if (x < 0 || x > this.size || y < 0 || y > this.size) return;
        if (this.cells[x][y] == type) return;
        this.cells[x][y] = T_TYPES_LOOKUP[type];
        this.hasChanged = true;
    }

    getCell(x, y) {
        if (x < 0 || x > this.size || y < 0 || y > this.size) return;
        return this.cells[x][y];
    }
}

class TerrainGrid {
    constructor(chunkSize, chunkCountX, chunkCountY) {
        // Initialize variables
        this.chunkSize = chunkSize;
        this.chunkCountX = chunkCountX;
        this.chunkCountY = chunkCountY;
        this.gridWidth = this.chunkSize * this.chunkCountX;
        this.gridHeight = this.chunkSize * this.chunkCountY;

        // Create chunk grid
        this.chunks = [];
        for (let x = 0; x < this.chunkCountX; x++) {
            this.chunks.push([]);
            for (let y = 0; y < this.chunkCountY; y++) {
                this.chunks[x][y] = new TerrainChunk(this.chunkSize);
            }
        }
    }

    show() {
        // Loop over and draw all chunks
        for (let x = 0; x < this.chunkCountX; x++) {
            for (let y = 0; y < this.chunkCountY; y++) {
                let output = this.chunks[x][y].getOutput();
                image(output, x * this.chunkSize, y * this.chunkSize);
            }
        }
    }

    setCell(x, y, type) {
        // Pass it on to the correct cell
        let chunkX = floor(x / this.chunkSize);
        let chunkY = floor(y / this.chunkSize);
        if (
            chunkX < 0 ||
            chunkX > this.chunkCountX ||
            chunkY < 0 ||
            chunkY > this.chunkCountY
        )
            return;
        this.chunks[chunkX][chunkY].setCell(
            x - chunkX * this.chunkSize,
            y - chunkY * this.chunkSize,
            type
        );
    }

    getCell(x, y) {
        // Pass it on to the correct cell
        let chunkX = floor(x / this.chunkSize);
        let chunkY = floor(y / this.chunkSize);
        if (
            chunkX < 0 ||
            chunkX > this.chunkCountX ||
            chunkY < 0 ||
            chunkY > this.chunkCountY
        )
            return;
        this.chunks[chunkX][chunkY].getCell(
            x - chunkX * this.chunkSize,
            y - chunkY * this.chunkSize
        );
    }
}

// #endregion
