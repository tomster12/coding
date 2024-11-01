// ================= Constants =================

const CONSTANTS = {};

CONSTANTS.GRID_SIZE = 120;
CONSTANTS.WIRE_SIZE = CONSTANTS.GRID_SIZE * 0.15;
CONSTANTS.COL_WIRE = "#ffd2a9";

CONSTANTS.MODULE_BASE_HEIGHT = CONSTANTS.GRID_SIZE * 0.15;
CONSTANTS.MODULE_BASE_RADIUS = CONSTANTS.GRID_SIZE * 0.14;
CONSTANTS.MODULE_COL_BASE_LIGHT = "#989898";
CONSTANTS.MODULE_COL_BASE_DARK = "#a8a8a8";

CONSTANTS.CABLE_SHAPE = {};
CONSTANTS.CABLE_SHAPE.WIDTH = CONSTANTS.WIRE_SIZE * 0.65;
CONSTANTS.CABLE_SHAPE.COL_OFF = "#b95b5b";
CONSTANTS.CABLE_SHAPE.COL_ON = "#eb5e5e";
CONSTANTS.CABLE_SHAPE.COL_END = "#a44e4e";

CONSTANTS.PEG_HOLE_SHAPE = {};
CONSTANTS.PEG_HOLE_SHAPE.SIZE = CONSTANTS.GRID_SIZE * 0.2;
CONSTANTS.PEG_HOLE_SHAPE.COL = "#eaeaea";

CONSTANTS.PEG_SHAPE = {};
CONSTANTS.PEG_SHAPE.HEIGHT = CONSTANTS.GRID_SIZE * 0.25;
CONSTANTS.PEG_SHAPE.COL_LIGHT = "#937762";
CONSTANTS.PEG_SHAPE.COL_DARK = "#7e6959";

CONSTANTS.BULB_SHAPE = {};
CONSTANTS.BULB_SHAPE.BASE_SIZE = CONSTANTS.GRID_SIZE * 0.7;
CONSTANTS.BULB_SHAPE.JAR_RADIUS = CONSTANTS.BULB_SHAPE.BASE_SIZE * 0.35;
CONSTANTS.BULB_SHAPE.JAR_HEIGHT = CONSTANTS.BULB_SHAPE.BASE_SIZE * 0.5;
CONSTANTS.BULB_SHAPE.BLIP_WIDTH = CONSTANTS.BULB_SHAPE.JAR_RADIUS * 0.5;
CONSTANTS.BULB_SHAPE.BLIP_STEM_WIDTH = CONSTANTS.BULB_SHAPE.JAR_RADIUS * 0.35;
CONSTANTS.BULB_SHAPE.BLIP_HEIGHT = CONSTANTS.BULB_SHAPE.JAR_HEIGHT * 0.65;
CONSTANTS.BULB_SHAPE.COL_JAR_BASE = "#868686";
CONSTANTS.BULB_SHAPE.COL_JAR_GLASS = "#cecece9d";
CONSTANTS.BULB_SHAPE.COL_BLIP = "#414141";
CONSTANTS.BULB_SHAPE.COL_BLIP_ON = "#ffc74d";

CONSTANTS.BUTTON_SHAPE = {};
CONSTANTS.BUTTON_SHAPE.BASE_SIZE = CONSTANTS.GRID_SIZE * 0.55;
CONSTANTS.BUTTON_SHAPE.BUTTON_HEIGHT_UP = CONSTANTS.GRID_SIZE * 0.1;
CONSTANTS.BUTTON_SHAPE.BUTTON_HEIGHT_DOWN = CONSTANTS.GRID_SIZE * 0.06;
CONSTANTS.BUTTON_SHAPE.COL_DARK = "#663737";
CONSTANTS.BUTTON_SHAPE.COL_LIGHT = "#ad5959";

// ================= Util =================

class ShapeUtil {
    static renderRoundSquare(ctx, x, y, size, radius) {
        ctx.beginPath();
        ctx.moveTo(x - size * 0.5 + radius, y - size * 0.5);
        ctx.arcTo(x + size * 0.5, y - size * 0.5, x + size * 0.5, y + size * 0.5, radius);
        ctx.arcTo(x + size * 0.5, y + size * 0.5, x - size * 0.5, y + size * 0.5, radius);
        ctx.arcTo(x - size * 0.5, y + size * 0.5, x - size * 0.5, y - size * 0.5, radius);
        ctx.arcTo(x - size * 0.5, y - size * 0.5, x + size * 0.5, y - size * 0.5, radius);
        ctx.closePath();
        ctx.fill();
    }

    static renderPegHole(ctx, x, y) {
        const { SIZE, COL } = CONSTANTS.PEG_HOLE_SHAPE;

        ctx.fillStyle = COL;
        ctx.beginPath();
        ctx.arc(x, y, SIZE * 0.5, 0, 2 * Math.PI);
        ctx.fill();
    }

    static renderPeg(ctx, x, y) {
        const { HEIGHT, COL_LIGHT, COL_DARK } = CONSTANTS.PEG_SHAPE;

        ctx.fillStyle = COL_DARK;
        ctx.beginPath();
        ctx.fillRect(x - CONSTANTS.PEG_HOLE_SHAPE.SIZE * 0.5, y - HEIGHT, CONSTANTS.PEG_HOLE_SHAPE.SIZE, HEIGHT);

        ctx.fillStyle = COL_LIGHT;
        ctx.beginPath();
        ctx.arc(x, y - HEIGHT, CONSTANTS.PEG_HOLE_SHAPE.SIZE * 0.5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = COL_DARK;
        ctx.beginPath();
        ctx.arc(x, y, CONSTANTS.PEG_HOLE_SHAPE.SIZE * 0.5, 0, 2 * Math.PI);
        ctx.fill();
    }

    static renderBulb(ctx, x, y, on = false) {
        const { BASE_SIZE, JAR_RADIUS, JAR_HEIGHT, BLIP_WIDTH, BLIP_STEM_WIDTH, BLIP_HEIGHT, COL_JAR_BASE, COL_JAR_GLASS, COL_BLIP, COL_BLIP_ON } =
            CONSTANTS.BULB_SHAPE;

        // Draw base
        ctx.fillStyle = CONSTANTS.MODULE_COL_BASE_LIGHT;
        ShapeUtil.renderRoundSquare(ctx, x, y, BASE_SIZE, CONSTANTS.MODULE_BASE_RADIUS);
        ctx.fillStyle = CONSTANTS.MODULE_COL_BASE_DARK;
        ShapeUtil.renderRoundSquare(ctx, x, y - CONSTANTS.MODULE_BASE_HEIGHT, BASE_SIZE, CONSTANTS.MODULE_BASE_RADIUS);

        // Draw bulb jar base
        ctx.fillStyle = COL_JAR_BASE;
        ctx.beginPath();
        ctx.arc(x, y - CONSTANTS.MODULE_BASE_HEIGHT, JAR_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        // Draw bulb blip
        ctx.fillStyle = COL_BLIP;
        ctx.beginPath();
        ctx.arc(x, y - CONSTANTS.MODULE_BASE_HEIGHT, BLIP_STEM_WIDTH * 0.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillRect(x - BLIP_STEM_WIDTH * 0.5, y - CONSTANTS.MODULE_BASE_HEIGHT - BLIP_HEIGHT, BLIP_STEM_WIDTH, BLIP_HEIGHT);
        ctx.fillStyle = on ? COL_BLIP_ON : COL_BLIP;
        ctx.beginPath();
        ctx.arc(x, y - CONSTANTS.MODULE_BASE_HEIGHT - BLIP_HEIGHT, BLIP_WIDTH, 0, 2 * Math.PI);
        ctx.fill();

        // Draw bulb jar
        ctx.fillStyle = COL_JAR_GLASS;
        ctx.beginPath();
        ctx.moveTo(x - JAR_RADIUS, y - CONSTANTS.MODULE_BASE_HEIGHT);
        ctx.lineTo(x + JAR_RADIUS, y - CONSTANTS.MODULE_BASE_HEIGHT);
        ctx.arcTo(x + JAR_RADIUS, y - CONSTANTS.MODULE_BASE_HEIGHT + JAR_RADIUS, x, y - CONSTANTS.MODULE_BASE_HEIGHT + JAR_RADIUS, JAR_RADIUS);
        ctx.arcTo(x - JAR_RADIUS, y - CONSTANTS.MODULE_BASE_HEIGHT + JAR_RADIUS, x - JAR_RADIUS, y - CONSTANTS.MODULE_BASE_HEIGHT, JAR_RADIUS);
        ctx.lineTo(x - JAR_RADIUS, y - CONSTANTS.MODULE_BASE_HEIGHT - JAR_HEIGHT);
        ctx.arcTo(
            x - JAR_RADIUS,
            y - CONSTANTS.MODULE_BASE_HEIGHT - JAR_HEIGHT - JAR_RADIUS,
            x,
            y - CONSTANTS.MODULE_BASE_HEIGHT - JAR_HEIGHT - JAR_RADIUS,
            JAR_RADIUS
        );
        ctx.arcTo(
            x + JAR_RADIUS,
            y - CONSTANTS.MODULE_BASE_HEIGHT - JAR_HEIGHT - JAR_RADIUS,
            x + JAR_RADIUS,
            y - CONSTANTS.MODULE_BASE_HEIGHT - JAR_HEIGHT,
            JAR_RADIUS
        );
        ctx.lineTo(x + JAR_RADIUS, y - CONSTANTS.MODULE_BASE_HEIGHT);
        ctx.closePath();
        ctx.fill();

        // Setup bulb glow if needed
        if (!this.renderBulb.glowCanvas) {
            console.log("Creating bulb glow canvas");
            const glowCanvas = document.createElement("canvas");
            const glowCtx = glowCanvas.getContext("2d");
            glowCanvas.width = CONSTANTS.GRID_SIZE;
            glowCanvas.height = CONSTANTS.GRID_SIZE;
            const gradient = glowCtx.createRadialGradient(
                CONSTANTS.GRID_SIZE / 2,
                CONSTANTS.GRID_SIZE / 2,
                0,
                CONSTANTS.GRID_SIZE / 2,
                CONSTANTS.GRID_SIZE / 2,
                CONSTANTS.GRID_SIZE / 2
            );
            gradient.addColorStop(0, "#ffd36d75");
            gradient.addColorStop(0.2, "#ffd36d75");
            gradient.addColorStop(1, "transparent");
            glowCtx.fillStyle = gradient;
            glowCtx.fillRect(0, 0, CONSTANTS.GRID_SIZE, CONSTANTS.GRID_SIZE);
            this.renderBulb.glowCanvas = glowCanvas;
        }

        // Draw bulb glow
        if (on) {
            ctx.drawImage(this.renderBulb.glowCanvas, x - CONSTANTS.GRID_SIZE / 2, y - CONSTANTS.MODULE_BASE_HEIGHT - BLIP_HEIGHT - CONSTANTS.GRID_SIZE / 2);
        }
    }

    static renderWireHook(ctx, x, y, dir) {
        ctx.fillStyle = CONSTANTS.COL_WIRE;
        const rx = Math.cos(dir * Math.PI * 0.5) * CONSTANTS.GRID_SIZE * 0.5;
        const ry = Math.sin(dir * Math.PI * 0.5) * CONSTANTS.GRID_SIZE * 0.5;
        const wx = Math.cos(dir * Math.PI * 0.5) * CONSTANTS.GRID_SIZE + Math.sin(dir * Math.PI * 0.5) * CONSTANTS.WIRE_SIZE;
        const wy = Math.sin(dir * Math.PI * 0.5) * CONSTANTS.GRID_SIZE + Math.cos(dir * Math.PI * 0.5) * CONSTANTS.WIRE_SIZE;
        ctx.fillRect(x + rx - wx * 0.5, y + ry - wy * 0.5, wx, wy);

        ctx.fillStyle = CONSTANTS.COL_WIRE;
        ctx.lineWidth = CONSTANTS.WIRE_SIZE;
        ctx.beginPath();
        ctx.arc(x, y, CONSTANTS.PEG_HOLE_SHAPE.SIZE * 0.5 + CONSTANTS.WIRE_SIZE, 0, 2 * Math.PI);
        ctx.fill();
    }

    static renderButton(ctx, x, y, down = false) {
        const { BASE_SIZE, BUTTON_HEIGHT_DOWN, BUTTON_HEIGHT_UP, COL_DARK, COL_LIGHT } = CONSTANTS.BUTTON_SHAPE;

        // Draw base
        ctx.fillStyle = CONSTANTS.MODULE_COL_BASE_LIGHT;
        ShapeUtil.renderRoundSquare(ctx, x, y, BASE_SIZE, CONSTANTS.MODULE_BASE_RADIUS);
        ctx.fillStyle = CONSTANTS.MODULE_COL_BASE_DARK;
        ShapeUtil.renderRoundSquare(ctx, x, y - CONSTANTS.MODULE_BASE_HEIGHT, BASE_SIZE, CONSTANTS.MODULE_BASE_RADIUS);

        // Draw button
        const buttonHeight = down ? BUTTON_HEIGHT_DOWN : BUTTON_HEIGHT_UP;
        ctx.fillStyle = COL_DARK;
        ShapeUtil.renderRoundSquare(ctx, x, y - CONSTANTS.MODULE_BASE_HEIGHT, BASE_SIZE * 0.8, CONSTANTS.MODULE_BASE_RADIUS * 0.8);
        ctx.fillStyle = COL_LIGHT;
        ShapeUtil.renderRoundSquare(ctx, x, y - CONSTANTS.MODULE_BASE_HEIGHT - buttonHeight, BASE_SIZE * 0.8, CONSTANTS.MODULE_BASE_RADIUS * 0.8);
    }
}

class GridUtil {
    static gridToWorld(x, y) {
        return {
            x: (x + 0.5) * CONSTANTS.GRID_SIZE,
            y: (y + 0.5) * CONSTANTS.GRID_SIZE,
        };
    }

    static worldToGrid(x, y) {
        return {
            x: Math.floor(x / CONSTANTS.GRID_SIZE),
            y: Math.floor(y / CONSTANTS.GRID_SIZE),
        };
    }
}

class VisualCable {
    constructor(startGrid, endGrid, cablePointCount) {
        this.startGrid = startGrid;
        this.endGrid = endGrid;

        this.isPowered = false;
        this.cablePointCount = cablePointCount;
        this.cablePoints = [];
        for (let i = 0; i < cablePointCount; i++) {
            this.cablePoints.push({ x: 0, y: 0 });
        }

        this.updateSegments();
    }

    setStartGrid(startGrid) {
        this.startGrid = startGrid;
        this.updateSegments();
    }

    setEndGrid(endGrid) {
        this.endGrid = endGrid;
        this.updateSegments();
    }

    setPowered(isPowered) {
        this.isPowered = isPowered;
    }

    updateSegments() {
        if (!this.cablePoints) return;

        this.startWorld = GridUtil.gridToWorld(this.startGrid.x, this.startGrid.y);
        this.endWorld = GridUtil.gridToWorld(this.endGrid.x, this.endGrid.y);

        this.cableStart = { x: this.startWorld.x, y: this.startWorld.y - CONSTANTS.PEG_SHAPE.HEIGHT };
        this.cableEnd = { x: this.endWorld.x, y: this.endWorld.y - CONSTANTS.PEG_SHAPE.HEIGHT };

        const dx = this.cableEnd.x - this.cableStart.x;
        const dy = this.cableEnd.y - this.cableStart.y;
        const segLenX = dx / (this.cablePointCount + 1);
        const segLenY = dy / (this.cablePointCount + 1);
        const maxSag = Math.hypot(dx, dy) * 0.15;

        for (let i = 0; i < this.cablePointCount; i++) {
            this.cablePoints[i].x = this.cableStart.x + segLenX * (i + 1);
            this.cablePoints[i].y = this.cableStart.y + segLenY * (i + 1);

            const t = (i + 1) / (this.cablePointCount + 1);
            const sag = maxSag * Math.sin(t * Math.PI);
            this.cablePoints[i].y += sag;
        }
    }

    draw(ctx) {
        // Draw pegs
        ShapeUtil.renderPeg(ctx, this.startWorld.x, this.startWorld.y);
        ShapeUtil.renderPeg(ctx, this.endWorld.x, this.endWorld.y);

        // Draw cable segments
        ctx.beginPath();
        ctx.strokeStyle = this.isPowered ? CONSTANTS.CABLE_SHAPE.COL_ON : CONSTANTS.CABLE_SHAPE.COL_OFF;
        ctx.lineWidth = CONSTANTS.CABLE_SHAPE.WIDTH;
        ctx.moveTo(this.cableStart.x, this.cableStart.y);
        for (let i = 0; i < this.cablePointCount; i++) {
            ctx.lineTo(this.cablePoints[i].x, this.cablePoints[i].y);
        }
        ctx.lineTo(this.cableEnd.x, this.cableEnd.y);
        ctx.stroke();

        // Draw cable ends
        ctx.fillStyle = CONSTANTS.CABLE_SHAPE.COL_END;
        ctx.beginPath();
        ctx.arc(this.cableStart.x, this.cableStart.y, CONSTANTS.CABLE_SHAPE.WIDTH * 0.65, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.cableEnd.x, this.cableEnd.y, CONSTANTS.CABLE_SHAPE.WIDTH * 0.65, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// ================= Main =================

class Button {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;

        this.game.registerElementRender(this, (ctx) => this.render(ctx), 1);
    }

    render(ctx) {
        ShapeUtil.renderButton(ctx, this.x, this.y);
    }

    onInteract(type) {}
}

class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.elements = [];
        this.elementRenders = [];
        this.elementInteractions = [];

        this.assets = {};
        this.mousePos = { x: 0, y: 0 };
        this.isMouseDown = false;
        this.mainAudio = new Audio();
        this.mainAudio.volume = 0.5;

        this.setupAssets();
        this.setupScene();
    }

    setupAssets() {
        // Setup background pattern
        const backgroundCanvas = document.createElement("canvas");
        const backgroundCtx = backgroundCanvas.getContext("2d");
        backgroundCanvas.width = CONSTANTS.GRID_SIZE;
        backgroundCanvas.height = CONSTANTS.GRID_SIZE;
        ShapeUtil.renderPegHole(backgroundCtx, CONSTANTS.GRID_SIZE / 2, CONSTANTS.GRID_SIZE / 2);
        this.assets.backgroundPattern = this.ctx.createPattern(backgroundCanvas, "repeat");
    }

    setupScene() {
        // Setup elements
        this.testWire = new VisualCable({ x: 1, y: 2 }, { x: 3, y: 3 }, 10);
    }

    draw() {
        // Draw wire hook
        const wireHook1Pos = GridUtil.gridToWorld(1, 2);
        ShapeUtil.renderWireHook(this.ctx, wireHook1Pos.x, wireHook1Pos.y, 3);
        const wireHook2Pos = GridUtil.gridToWorld(3, 3);
        ShapeUtil.renderWireHook(this.ctx, wireHook2Pos.x, wireHook2Pos.y, 0);

        // Draw peg holes
        this.ctx.fillStyle = this.assets.backgroundPattern;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw objects
        const bulbPos = GridUtil.gridToWorld(1, 1);
        ShapeUtil.renderBulb(this.ctx, bulbPos.x, bulbPos.y, this.isMouseDown);
        const buttonPos = GridUtil.gridToWorld(4, 3);
        ShapeUtil.renderButton(this.ctx, buttonPos.x, buttonPos.y, this.isMouseDown);

        // Draw wires
        this.testWire.setPowered(this.isMouseDown);
        this.testWire.draw(this.ctx);
    }

    registerElementRender(element, renderFunc, zIndex) {
        this.elementRenders.push({ element, renderFunc, zIndex });
        this.elementRenders.sort((a, b) => a.zIndex - b.zIndex);
    }

    registerElementInteraction(element, rect, interactionFunc) {
        this.elementInteractions.push({ element, rect, interactionFunc });
    }

    onMouseClicked(e) {}

    onMouseMoved(e) {
        this.mousePos = { x: e.clientX, y: e.clientY };
    }

    onMouseDown(e) {
        this.isMouseDown = true;
        this.mainAudio.src = "assets/click_heavy_1_a.mp3";
        this.mainAudio.play();
    }

    onMouseUp(e) {
        this.isMouseDown = false;
        this.mainAudio.src = "assets/click_heavy_1_b.mp3";
        this.mainAudio.play();
    }

    onWindowResized() {}
}

// ================= Global Driver =================

(() => {
    const canvas = document.getElementById("mainCanvas");

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const game = new Game(canvas, ctx);
    canvas.addEventListener("click", (e) => game.onMouseClicked(e));
    canvas.addEventListener("mousemove", (e) => game.onMouseMoved(e));
    canvas.addEventListener("mousedown", (e) => game.onMouseDown(e));
    canvas.addEventListener("mouseup", (e) => game.onMouseUp(e));

    function onWindowResized() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        game.onWindowResized();
    }

    window.addEventListener("resize", () => onWindowResized());
    onWindowResized();

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.draw();
        requestAnimationFrame(draw);
    }

    draw();
})();
