const singleAttacks = ["1", "2", "3", "4"];
const singleMoves = ["f", "b", "u", "d"];
const allMovesClockwise = ["f", "df", "d", "db", "b", "ub", "u", "uf"];

const cComboBlue = "#37d0ff";
const cComboGreen = "#58ff37";
const cComboYellow = "#f5ff37";
const cComboRed = "#ff3737";
const cComboBack = "#474747";
const cComboOut = "#141414";

const cCardTextTitle = "#1f1f1f";
const cCardTextMeta = "#494949";
const cCardOut = "#201f1e";
const cCardBack1 = "#e9d2f1";
const cCardBack2 = "#d2d2d2";
const cCardBack3 = "#848484";
const cCardComboBack = "#ffffff";

const cardSw = 6;
const cardEdge = 20;
const textTopYGap = 18;
const textSmallXGap = 15;
const textSmallSize = 20;
const textTitleSize = 40;
const metaPct = 0.68;
const comboEdge1 = 5;
const comboEdge2 = 7;
const comboCurve = 10;
const comboSize = 50;
const comboGap = 1;

// ----------------------------

const choiceCount = 3;
let current = 0;
let fontRegular;
let fontBold;
let fontItalic;

let presetsContainer = null;
let defaultPresetsData = [];
let presetsData = [];
let presetsElement = [];
let selectedPreset = -1;

let cardInputs = [];
let inputLeftSymbols;
let inputTitle;
let inputMeta;
let inputRightSymbols;
let inputComboString;
let inputCardBack;
let inputCanvasWidth;
let inputCanvasHeight;

function preload() {
    presetsContainer = document.getElementById("presets");
    fontRegular = loadFont("assets/FontRegular.otf");
    fontBold = loadFont("assets/FontBold.otf");
    loadJSON("assets/presets.json", (presets) => {
        defaultPresetsData = presets;
        if (!loadCache()) {
            defaultPresetsData.forEach((preset) => createPreset(preset));
            setStatus("No browser cache found, defaults loaded.");
        }
    });
}

function setup() {
    createCanvas(650, 135);
    setupInput();
    selectPreset(0);
}

function setupInput() {
    // Card inputs
    inputLeftSymbols = createInput();
    inputTitle = createInput();
    inputMeta = createInput();
    inputRightSymbols = createInput();
    inputComboString = createInput();
    inputCardBack = createInput();

    cardInputs = [
        inputLeftSymbols,
        inputTitle,
        inputMeta,
        inputRightSymbols,
        inputComboString,
        inputCardBack,
    ];

    const cardInputContainer = document.getElementById("card-inputs");
    cardInputs.forEach((i) => i.class("input"));
    cardInputs.forEach((i) => i.input(onInput));
    cardInputs.forEach((i) => i.parent(cardInputContainer));

    // Canvas inputs
    inputCanvasWidth = createInput("", "number");
    inputCanvasHeight = createInput("", "number");

    const canvasInputContainer = document.getElementById("canvas-inputs");
    inputCanvasWidth.class("input");
    inputCanvasHeight.class("input");
    inputCanvasWidth.input(onCanvasInput);
    inputCanvasHeight.input(onCanvasInput);
    inputCanvasWidth.parent(canvasInputContainer);
    inputCanvasHeight.parent(canvasInputContainer);

    inputCanvasWidth.value(width);
    inputCanvasHeight.value(height);

    // Save preset
    document.getElementById("add-preset").onclick = addPreset;
    document.getElementById("clear-presets").onclick = clearPresets;
    document.getElementById("save-cache").onclick = saveCache;
    document.getElementById("load-cache").onclick = loadCache;
    document.getElementById("clear-cache").onclick = clearCache;
    document.getElementById("export").onclick = exportPresets;
}

function addPreset() {
    const preset = [
        inputLeftSymbols.value(),
        inputTitle.value(),
        inputMeta.value(),
        inputRightSymbols.value(),
        inputComboString.value(),
        inputCardBack.value(),
    ];

    createPreset(preset);
    setStatus("Added preset.");
}

function clearPresets() {
    presetsData = [];
    presetsElement = [];
    presetsContainer.innerHTML = "";
    setStatus("Cleared presets.");
}

function saveCache() {
    localStorage.setItem("presets", JSON.stringify(presetsData));
    setStatus("Saved presets to browser cache.");
}

function loadCache() {
    const localPresets = localStorage.getItem("presets");

    if (localPresets) {
        clearPresets();
        const loadedPresets = JSON.parse(localPresets);
        loadedPresets.forEach((preset) => createPreset(preset));
        setStatus("Loaded presets from browser cache.");
        return true;
    }

    setStatus("No presets in browser cache.");
    return false;
}

function clearCache() {
    localStorage.removeItem("presets");
    setStatus("Cleared browser cache.");
}

function exportPresets() {
    saveJSON(presetsData, "presets.json");
    setStatus("Exported presets.json.");
}

function createPreset(p) {
    const el1 = document.createElement("div");
    el1.className = "button";
    el1.innerHTML = p[1];
    const i = presetsElement.length;
    el1.onclick = () => selectPreset(presetsElement.indexOf(el1));

    const el2 = document.createElement("div");
    el2.className = "delete";
    el2.innerHTML = "x";
    el2.onclick = () => deletePreset(presetsElement.indexOf(el1));

    el1.appendChild(el2);

    presetsData.push(p);
    presetsContainer.appendChild(el1);
    presetsElement.push(el1);
}

function selectPreset(i) {
    const [lsymbols, name, meta, rsymbols, comboString, cCardBack] =
        presetsData[i];

    selectedPreset = i;
    presetsElement.forEach((el) => el.classList.remove("selected"));
    presetsElement[i].classList.add("selected");

    inputLeftSymbols.value(lsymbols);
    inputTitle.value(name);
    inputMeta.value(meta);
    inputRightSymbols.value(rsymbols);
    inputComboString.value(comboString);
    inputCardBack.value(cCardBack);

    drawCard(lsymbols, name, meta, rsymbols, comboString, cCardBack);
}

function deletePreset(i) {
    console.log("Deleting " + i);
    presetsData.splice(i, 1);
    presetsElement[i].remove();
    presetsElement.splice(i, 1);
    if (selectedPreset == i) selectPreset(0);
    else if (selectedPreset > i) selectPreset(selectedPreset - 1);
    setStatus("Deleted preset.");
}

function onInput() {
    selectedPreset = -1;
    presetsElement.forEach((el) => el.classList.remove("selected"));

    drawCard(
        inputLeftSymbols.value(),
        inputTitle.value(),
        inputMeta.value(),
        inputRightSymbols.value(),
        inputComboString.value(),
        inputCardBack.value()
    );
}

function onCanvasInput() {
    resizeCanvas(inputCanvasWidth.value(), inputCanvasHeight.value());
    if (selectedPreset != -1) selectPreset(selectedPreset);
    else onInput();
}

function setStatus(s) {
    document.getElementById("status").innerHTML = s;
}

// ----------------------------

function drawCard(lsymbols, name, meta, rsymbols, comboString, cCardBack) {
    clear();
    ellipseMode(CORNER);

    // Background
    stroke(cCardOut);
    strokeWeight(cardSw);
    fill(cCardBack);
    rect(cardSw / 2, cardSw / 2, width - cardSw, height - cardSw, cardEdge);

    // Text
    noStroke();
    fill(cComboOut);

    // - Left Symbols
    textSize(textSmallSize);
    textFont("Verdana");
    textAlign(LEFT, CENTER);
    text(
        lsymbols,
        cardSw + textSmallXGap,
        cardSw + cardSw + textTopYGap + textSmallSize * 0.1
    );

    // - Title
    textSize(textTitleSize);
    textFont(fontBold);
    textAlign(CENTER, CENTER);
    fill(cCardTextTitle);
    text(name, width / 2, cardSw + cardSw + textTopYGap);

    // - Meta
    textSize(textSmallSize);
    textFont(fontRegular);
    textAlign(LEFT, CENTER);
    fill(cCardTextMeta);
    text(
        meta,
        width * metaPct,
        cardSw + cardSw + textTopYGap + textSmallSize * 0.1
    );

    // - Right Symbols
    textSize(textSmallSize);
    textFont("Verdana");
    textAlign(RIGHT, CENTER);
    text(
        rsymbols,
        width - cardSw - textSmallXGap,
        cardSw + cardSw + textTopYGap + textSmallSize * 0.1
    );

    // - Background
    fill(cCardComboBack);
    noStroke();
    rect(
        cardSw + comboEdge1,
        height - cardSw - comboEdge1 - comboSize - comboEdge2 * 2,
        width - comboEdge1 * 2 - cardSw * 2,
        comboSize + comboEdge2 * 2,
        comboCurve
    );

    // -Foreground
    drawCombo(
        comboString,
        cardSw + comboEdge1 + comboEdge2,
        height - cardSw - comboEdge1 - comboEdge2 - comboSize,
        comboSize,
        comboGap
    );
}

function drawCombo(comboString, x, y, s, g) {
    const actions = parseCombo(comboString);
    for (let i = 0; i < actions.length; i++) {
        actions[i].draw(x + i * (s + g), y, s);
    }
}

function drawEllipse(x, y, s, sw) {
    ellipse(x + sw / 2, y + sw / 2, s - sw, s - sw);
}

// ----------------------------

function parseCombo(comboString) {
    let parsedActions = [];

    const isMove = (s) =>
        s.split("").every((n) => singleMoves.includes(n.toLowerCase()));
    const isAttack = (s) => s.split("").every((n) => singleAttacks.includes(n));
    const isNeutral = (s) => s === "n";
    const isSeperator = (s) => s === ",";

    // Split into actions
    const actionStrings = comboString.split("");
    for (let i = 0; i < actionStrings.length; i++) {
        // Ignore spaces
        if (actionStrings[i] === " ") {
            actionStrings.splice(i, 1);
            i--;
        }
        // Join numbers eitherside of "+"
        else if (actionStrings[i] === "+") {
            actionStrings[i - 1] += actionStrings.splice(i + 1, 1)[0];
            actionStrings.splice(i, 1);
            i -= 2;
        }
        // Join together moves
        else if (
            isMove(actionStrings[i]) &&
            actionStrings[i].length == 1 &&
            i < actionStrings.length - 1 &&
            isMove(actionStrings[i + 1]) &&
            actionStrings[i].toLowerCase() != actionStrings[i + 1].toLowerCase()
        ) {
            actionStrings[i] += actionStrings.splice(i + 1, 1)[0];
        }
    }
    // Parse action strings into actions
    return actionStrings.map((s) => {
        if (isMove(s)) return new Move(s);
        else if (isAttack(s)) return new Attack(s);
        else if (isNeutral(s)) return new Neutral();
        else if (isSeperator(s)) return new Seperator();
    });
}

// ----------------------------

class Neutral {
    draw(x, y, s) {
        const gap = s * 0.2;
        fill(255);
        stroke(0);
        strokeWeight(4);
        ellipse(x + gap, y + gap, s - gap * 2, s - gap * 2);
    }
}

class Seperator {
    draw(x, y, s) {
        const sw = s * 0.25;
        const sh = s * 0.25;
        fill(0);
        noStroke();
        triangle(
            x + s / 2 - sw / 2,
            y + s / 2 - sh / 2,
            x + s / 2 + sw / 2,
            y + s / 2,
            x + s / 2 - sw / 2,
            y + s / 2 + sh / 2
        );
    }
}

class Move {
    constructor(moveString) {
        this.isHold = moveString == moveString.toUpperCase();
        this.move = moveString.toLowerCase();
        this.pct =
            allMovesClockwise.indexOf(this.move) / allMovesClockwise.length;
    }

    draw(x, y, s) {
        const w = s * 0.92;
        const h = s * 0.26;
        const wpct = 0.52;
        const hpct = 1;
        const sw = s * 0.09;
        const he = s * 0.09;

        push();
        strokeWeight(sw);

        translate(x + s / 2, y + s / 2);
        rotate(this.pct * TWO_PI);

        fill(255);
        stroke(cComboOut);
        beginShape();
        vertex(-w / 2, -h / 2);
        vertex(-w / 2 + w * wpct, -h / 2);
        vertex(-w / 2 + w * wpct, -h * (0.5 + hpct));
        vertex(w / 2, 0);
        vertex(-w / 2 + w * wpct, h * (0.5 + hpct));
        vertex(-w / 2 + w * wpct, h / 2);
        vertex(-w / 2, h / 2);
        endShape(CLOSE);

        fill(cComboOut);
        noStroke();
        if (this.isHold) {
            beginShape();
            vertex(-w / 2 + he, -h / 2 + he);
            vertex(-w / 2 + w * wpct + he * 0.9, -h / 2 + he);
            vertex(-w / 2 + w * wpct + he * 0.9, -h * (0.5 + hpct) + he * 2);
            vertex(w / 2 - he * 1.25, 0);
            vertex(-w / 2 + w * wpct + he * 0.9, h * (0.5 + hpct) - he * 2);
            vertex(-w / 2 + w * wpct + he * 0.9, h / 2 - he);
            vertex(-w / 2 + he, h / 2 - he);
            endShape(CLOSE);
        }
        pop();
    }
}

class Attack {
    constructor(attackString) {
        this.bits = [0, 0, 0, 0];
        for (const i of attackString.split(""))
            this.bits[["1", "2", "3", "4"].indexOf(i)] = 1;
    }

    draw(x, y, s) {
        const cs = s * 0.44;
        const g = s * 0.01;
        const sw = s * 0.07;

        stroke(cComboOut);
        strokeWeight(sw);
        fill(this.bits[0] ? cComboBlue : cComboBack);
        drawEllipse(x + (s - g) / 2 - cs, y + s - cs - g - cs, cs, sw);
        fill(this.bits[2] ? cComboGreen : cComboBack);
        drawEllipse(x + (s - g) / 2 - cs, y + s - cs, cs, sw);
        fill(this.bits[1] ? cComboYellow : cComboBack);
        drawEllipse(x + (s + g) / 2, y, cs, sw);
        fill(this.bits[3] ? cComboRed : cComboBack);
        drawEllipse(x + (s + g) / 2, y + cs + g, cs, sw);
    }
}
