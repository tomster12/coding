import p5 from "p5";

interface InputElement extends p5.Element {
    input: (fn: () => void) => void;
}

// ----------------------------------

type bit = 0 | 1;

type PresetData = [string, string, string, string, string, string];

const _moveAction = [
    "f",
    "df",
    "fd",
    "d",
    "db",
    "bd",
    "b",
    "ub",
    "bu",
    "u",
    "uf",
    "fu",
];

const _holdMoveAction = [
    "F",
    "DF",
    "FD",
    "D",
    "DB",
    "BD",
    "B",
    "UB",
    "BU",
    "U",
    "UF",
    "FU",
];

const moveToAngle: { [key: string]: number } = {
    f: 0,
    df: 1 / 8,
    fd: 1 / 8,
    d: 2 / 8,
    db: 3 / 8,
    bd: 3 / 8,
    b: 4 / 8,
    ub: 5 / 8,
    bu: 5 / 8,
    u: 6 / 8,
    uf: 7 / 8,
    fu: 7 / 8,
};

type MoveAction =
    | (typeof _moveAction)[number]
    | (typeof _holdMoveAction)[number];

const isMoveAction = (s: string) =>
    _moveAction.includes(s) || _holdMoveAction.includes(s);

const _singleAttackAction = ["1", "2", "3", "4"];

type SingleAttackAction = (typeof _singleAttackAction)[number];

type AttackAction =
    | SingleAttackAction
    | `${SingleAttackAction}+${SingleAttackAction}`;

const isAttackAction = (s: string) =>
    s.split("+").every((a) => _singleAttackAction.includes(a)) &&
    s.split("+").length <= 2;

type NeutralAction = "n";

// ----------------------------------

const ICON_COL_BLUE = "#37d0ff";
const ICON_COL_GREEN = "#58ff37";
const ICON_COL_YELLOW = "#f5ff37";
const ICON_COL_RED = "#ff3737";
const ICON_COL_BG = "#474747";
const ICON_COL_OL = "#141414";
const CARD_COL_TITLE = "#1f1f1f";
const CARD_COL_META = "#494949";
const CARD_COL_OL = "#201f1e";
const CARD_COL_BG1 = "#e9d2f1";
const CARD_COL_BG2 = "#d2d2d2";
const CARD_COL_BG3 = "#848484";
const CARD_COL_COMBO_BG = "#ffffff";
const CARD_SW = 6;
const CARD_EDGE = 20;
const CARD_TEXT_TOP_Y_GAP = 18;
const CARD_TEXT_SMALL_X_GAP = 15;
const CARD_SMALL_FS = 20;
const CARD_TITLE_FS = 40;
const CARD_META_X_PCT = 0.68;
const CARD_COMBO_GAP_1 = 5;
const CARD_COMBO_GAP_2 = 7;
const CARD_COMBO_CURVE = 10;
const CARD_COMBO_ICON_SIZE = 50;
const CARD_COMBO_ICON_GAP = 1;

// ----------------------------------

class App extends p5 {
    constructor() {
        super(() => {});
    }

    fontRegular: p5.Font;
    fontBold: p5.Font;

    presetsContainer: HTMLElement;
    defaultPresetsData: PresetData[] = [];
    presetsData: PresetData[] = [];
    presetsElement: HTMLElement[] = [];
    selectedPreset: number = -1;

    cardInputs: InputElement[] = [];
    inputLeftSymbols: InputElement;
    inputTitle: InputElement;
    inputMeta: InputElement;
    inputRightSymbols: InputElement;
    inputComboString: InputElement;
    inputCardBack: InputElement;
    inputCanvasWidth: InputElement;
    inputCanvasHeight: InputElement;

    preload() {
        this.presetsContainer = document.getElementById("presets")!;
        this.fontRegular = this.loadFont("assets/FontRegular.otf");
        this.fontBold = this.loadFont("assets/FontBold.otf");

        this.loadJSON("assets/presets.json", (presets: PresetData[]) => {
            if (!this.loadCache()) {
                this.defaultPresetsData = presets;
                this.defaultPresetsData.forEach((preset) =>
                    this.addPreset(preset)
                );
                this.setStatus("No browser cache found, defaults loaded.");
            }
        });
    }

    setup() {
        const canvas = this.createCanvas(650, 135);
        canvas.parent("app");
        this.setupInput();
        this.selectPreset(0);
    }

    setupInput() {
        this.inputLeftSymbols = this.createInput() as InputElement;
        this.inputTitle = this.createInput() as InputElement;
        this.inputMeta = this.createInput() as InputElement;
        this.inputRightSymbols = this.createInput() as InputElement;
        this.inputComboString = this.createInput() as InputElement;
        this.inputCardBack = this.createInput() as InputElement;

        this.cardInputs = [
            this.inputLeftSymbols,
            this.inputTitle,
            this.inputMeta,
            this.inputRightSymbols,
            this.inputComboString,
            this.inputCardBack,
        ];

        const cardInputsContainer = document.getElementById("card-inputs")!;
        this.cardInputs.forEach((i) => i.class("input"));
        this.cardInputs.forEach((i) => i.input(() => this.onInput()));
        this.cardInputs.forEach((i) => i.parent(cardInputsContainer));

        this.inputCanvasWidth = this.createInput("", "number") as InputElement;
        this.inputCanvasHeight = this.createInput("", "number") as InputElement;

        const canvasInputsContainer = document.getElementById("canvas-inputs")!;
        this.inputCanvasWidth.class("input");
        this.inputCanvasHeight.class("input");
        this.inputCanvasWidth.input(() => this.onCanvasInput());
        this.inputCanvasHeight.input(() => this.onCanvasInput());
        this.inputCanvasWidth.parent(canvasInputsContainer);
        this.inputCanvasHeight.parent(canvasInputsContainer);

        this.inputCanvasWidth.value(this.width);
        this.inputCanvasHeight.value(this.height);

        document.getElementById("add-preset")!.onclick = () =>
            this.addPresetFromInputs();
        document.getElementById("clear-presets")!.onclick = () =>
            this.clearPresets();
        document.getElementById("save-cache")!.onclick = () => this.saveCache();
        document.getElementById("load-cache")!.onclick = () => this.loadCache();
        document.getElementById("clear-cache")!.onclick = () =>
            this.clearCache();
        document.getElementById("export")!.onclick = () => this.exportPresets();
    }

    // ----------------------------------

    addPresetFromInputs() {
        const preset = [
            this.inputLeftSymbols.value(),
            this.inputTitle.value(),
            this.inputMeta.value(),
            this.inputRightSymbols.value(),
            this.inputComboString.value(),
            this.inputCardBack.value(),
        ] as PresetData;

        this.addPreset(preset);
        this.setStatus("Added preset.");
    }

    addPreset(p: PresetData) {
        const el1 = document.createElement("div");
        el1.className = "button";
        el1.innerHTML = p[1];
        const i = this.presetsElement.length;
        el1.onclick = () => this.selectPreset(this.presetsElement.indexOf(el1));

        const el2 = document.createElement("div");
        el2.className = "delete";
        el2.innerHTML = "x";
        el2.onclick = () => this.deletePreset(this.presetsElement.indexOf(el1));

        el1.appendChild(el2);

        this.presetsData.push(p);
        this.presetsContainer.appendChild(el1);
        this.presetsElement.push(el1);
    }

    selectPreset(i: number) {
        if (i == -1) return;

        const [lsymbols, name, meta, rsymbols, comboString, cCardBack] =
            this.presetsData[i];

        this.selectedPreset = i;
        this.presetsElement.forEach((el) => el.classList.remove("selected"));
        this.presetsElement[i].classList.add("selected");

        this.inputLeftSymbols.value(lsymbols);
        this.inputTitle.value(name);
        this.inputMeta.value(meta);
        this.inputRightSymbols.value(rsymbols);
        this.inputComboString.value(comboString);
        this.inputCardBack.value(cCardBack);

        this.drawCard(lsymbols, name, meta, rsymbols, comboString, cCardBack);
    }

    deletePreset(i: number) {
        this.presetsData.splice(i, 1);
        this.presetsElement[i].remove();
        this.presetsElement.splice(i, 1);
        if (this.selectedPreset == i) this.selectPreset(0);
        else if (this.selectedPreset > i)
            this.selectPreset(this.selectedPreset - 1);
        this.setStatus("Deleted preset.");
    }

    clearPresets() {
        this.presetsData = [];
        this.presetsElement = [];
        this.presetsContainer.innerHTML = "";
        this.setStatus("Cleared presets.");
    }

    saveCache() {
        localStorage.setItem("presets", JSON.stringify(this.presetsData));
        this.setStatus("Saved presets to browser cache.");
    }

    loadCache() {
        const localPresets = localStorage.getItem("presets");

        if (localPresets) {
            this.clearPresets();
            const loadedPresets = JSON.parse(localPresets);
            loadedPresets.forEach((preset: PresetData) =>
                this.addPreset(preset)
            );
            this.setStatus("Loaded presets from browser cache.");
            return true;
        }

        this.setStatus("No presets in browser cache.");
        return false;
    }

    clearCache() {
        localStorage.removeItem("presets");
        this.setStatus("Cleared browser cache.");
    }

    exportPresets() {
        this.saveJSON(this.presetsData, "presets.json");
        this.setStatus("Exported presets.json.");
    }

    // ----------------------------------

    drawCard(
        lsymbols: string,
        name: string,
        meta: string,
        rsymbols: string,
        comboString: string,
        cCardBack: string
    ) {
        this.clear();
        this.ellipseMode(this.CORNER);

        // Background
        this.stroke(CARD_COL_OL);
        this.strokeWeight(CARD_SW);
        this.fill(cCardBack);
        this.rect(
            CARD_SW / 2,
            CARD_SW / 2,
            this.width - CARD_SW,
            this.height - CARD_SW,
            CARD_EDGE
        );

        // Text
        this.noStroke();
        this.fill(ICON_COL_OL);

        // - Left Symbols
        this.textSize(CARD_SMALL_FS);
        this.textFont("Verdana");
        this.textAlign(this.LEFT, this.CENTER);
        this.text(
            lsymbols,
            CARD_SW + CARD_TEXT_SMALL_X_GAP,
            CARD_SW + CARD_SW + CARD_TEXT_TOP_Y_GAP + CARD_SMALL_FS * 0.1
        );

        // - Title
        this.textSize(CARD_TITLE_FS);
        this.textFont(this.fontBold);
        this.textAlign(this.CENTER, this.CENTER);
        this.fill(CARD_COL_TITLE);
        this.text(
            name,
            this.width / 2,
            CARD_SW + CARD_SW + CARD_TEXT_TOP_Y_GAP
        );

        // - Meta
        this.textSize(CARD_SMALL_FS);
        this.textFont(this.fontRegular);
        this.textAlign(this.LEFT, this.CENTER);
        this.fill(CARD_COL_META);
        this.text(
            meta,
            this.width * CARD_META_X_PCT,
            CARD_SW + CARD_SW + CARD_TEXT_TOP_Y_GAP + CARD_SMALL_FS * 0.1
        );

        // - Right Symbols
        this.textSize(CARD_SMALL_FS);
        this.textFont("Verdana");
        this.textAlign(this.RIGHT, this.CENTER);
        this.text(
            rsymbols,
            this.width - CARD_SW - CARD_TEXT_SMALL_X_GAP,
            CARD_SW + CARD_SW + CARD_TEXT_TOP_Y_GAP + CARD_SMALL_FS * 0.1
        );

        // - Background
        this.fill(CARD_COL_COMBO_BG);
        this.noStroke();
        this.rect(
            CARD_SW + CARD_COMBO_GAP_1,
            this.height -
                CARD_SW -
                CARD_COMBO_GAP_1 -
                CARD_COMBO_ICON_SIZE -
                CARD_COMBO_GAP_2 * 2,
            this.width - CARD_COMBO_GAP_1 * 2 - CARD_SW * 2,
            CARD_COMBO_ICON_SIZE + CARD_COMBO_GAP_2 * 2,
            CARD_COMBO_CURVE
        );

        // -Foreground
        this.drawCombo(
            comboString,
            CARD_SW + CARD_COMBO_GAP_1 + CARD_COMBO_GAP_2,
            this.height -
                CARD_SW -
                CARD_COMBO_GAP_1 -
                CARD_COMBO_GAP_2 -
                CARD_COMBO_ICON_SIZE,
            CARD_COMBO_ICON_SIZE,
            CARD_COMBO_ICON_GAP
        );
    }

    drawCombo(comboString: string, x: number, y: number, s: number, g: number) {
        const actions = this.parseCombo(comboString);
        for (let i = 0; i < actions.length; i++) {
            actions[i].draw(x + i * (s + g), y, s);
        }
    }

    drawEllipse(x: number, y: number, s: number, sw: number) {
        this.ellipse(x + sw / 2, y + sw / 2, s - sw, s - sw);
    }

    setStatus(s: string) {
        document.getElementById("status")!.innerHTML = s;
    }

    // ----------------------------------

    onInput() {
        this.selectedPreset = -1;
        this.presetsElement.forEach((el) => el.classList.remove("selected"));

        this.drawCard(
            this.inputLeftSymbols.value() as string,
            this.inputTitle.value() as string,
            this.inputMeta.value() as string,
            this.inputRightSymbols.value() as string,
            this.inputComboString.value() as string,
            this.inputCardBack.value() as string
        );
    }

    onCanvasInput() {
        this.resizeCanvas(
            this.inputCanvasWidth.value() as number,
            this.inputCanvasHeight.value() as number
        );
        if (this.selectedPreset != -1) this.selectPreset(this.selectedPreset);
        else this.onInput();
    }

    parseCombo(comboString: string): Action[] {
        const parseNext: (s: string) => [number, Action | undefined] = (s) => {
            // Parse note
            if (s[0] === "(") {
                const endIndex = s.indexOf(")");
                if (endIndex === -1) return [1, undefined];
                return [endIndex + 1, new Note(this, s.slice(0, endIndex + 1))];
            }

            // Parse 2 length move
            if (s.length >= 2 && isMoveAction(s.substring(0, 2)))
                return [2, new Move(this, s.substring(0, 2) as MoveAction)];

            // Parse 1 length move
            if (isMoveAction(s[0]))
                return [1, new Move(this, s[0] as MoveAction)];

            // Parse 3 length attack
            if (s.length >= 3 && isAttackAction(s.substring(0, 3)))
                return [3, new Attack(this, s.substring(0, 3) as AttackAction)];

            // Parse 1 length attack
            if (isAttackAction(s[0]))
                return [1, new Attack(this, s[0] as AttackAction)];

            // Parse neutral
            if (s[0] === "n") return [1, new Neutral(this)];

            // Parse seperator
            if (s[0] === ",") return [1, new Seperator(this)];

            // Otherwise ignore
            return [1, undefined];
        };

        // Main parse loop
        let actions: Action[] = [];
        let current = comboString;

        while (current.length > 0) {
            const [taken, action] = parseNext(current);
            if (action) actions.push(action);
            current = current.substring(taken, current.length);
        }

        return actions;
    }
}

type Action = Move | Attack | Neutral | Seperator | Note;

class Note {
    app: App;
    note: string;

    constructor(app: App, note: string) {
        this.app = app;
        this.note = note.slice(1, note.length - 1);
    }

    draw(x: number, y: number, s: number) {
        const w = s * 0.8;
        const h = s * 0.45;
        const ts = h * 0.7;
        const e = s * 0.1;

        this.app.noStroke();
        this.app.fill("#bd4b4b");
        this.app.rect(x + (s - w) / 2, y + (s - h) / 2, w, h, e);

        this.app.fill(255);
        this.app.textAlign(this.app.CENTER, this.app.CENTER);
        this.app.textSize(ts);
        this.app.text(this.note, x + s / 2, y + s / 2);
    }
}

class Neutral {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    draw(x: number, y: number, s: number) {
        const gap = s * 0.2;
        this.app.fill(255);
        this.app.stroke(0);
        this.app.strokeWeight(4);
        this.app.ellipse(x + gap, y + gap, s - gap * 2, s - gap * 2);
    }
}

class Seperator {
    app: App;

    constructor(app: App) {
        this.app = app;
    }

    draw(x: number, y: number, s: number) {
        const app = this.app;
        const sw = s * 0.25;
        const sh = s * 0.25;

        app.fill(0);
        app.noStroke();
        app.triangle(
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
    app: App;
    isHold: boolean;
    angle: number;

    constructor(app: App, move: MoveAction) {
        this.app = app;
        this.isHold = move == move.toUpperCase();
        this.angle = moveToAngle[move.toLowerCase()];
    }

    draw(x: number, y: number, s: number) {
        const app = this.app;
        const w = s * 0.92;
        const h = s * 0.26;
        const wpct = 0.52;
        const hpct = 1;
        const sw = s * 0.09;
        const he = s * 0.09;

        app.push();
        app.strokeWeight(sw);

        app.translate(x + s / 2, y + s / 2);
        app.rotate(this.angle * app.TWO_PI);

        app.fill(255);
        app.stroke(ICON_COL_OL);
        app.beginShape();
        app.vertex(-w / 2, -h / 2);
        app.vertex(-w / 2 + w * wpct, -h / 2);
        app.vertex(-w / 2 + w * wpct, -h * (0.5 + hpct));
        app.vertex(w / 2, 0);
        app.vertex(-w / 2 + w * wpct, h * (0.5 + hpct));
        app.vertex(-w / 2 + w * wpct, h / 2);
        app.vertex(-w / 2, h / 2);
        app.endShape(app.CLOSE);

        app.fill(ICON_COL_OL);
        app.noStroke();
        if (this.isHold) {
            app.beginShape();
            app.vertex(-w / 2 + he, -h / 2 + he);
            app.vertex(-w / 2 + w * wpct + he * 0.9, -h / 2 + he);
            app.vertex(
                -w / 2 + w * wpct + he * 0.9,
                -h * (0.5 + hpct) + he * 2
            );
            app.vertex(w / 2 - he * 1.25, 0);
            app.vertex(-w / 2 + w * wpct + he * 0.9, h * (0.5 + hpct) - he * 2);
            app.vertex(-w / 2 + w * wpct + he * 0.9, h / 2 - he);
            app.vertex(-w / 2 + he, h / 2 - he);
            app.endShape(app.CLOSE);
        }
        app.pop();
    }
}

class Attack {
    app: App;
    bits: [bit, bit, bit, bit];

    constructor(app: App, attack: AttackAction) {
        this.app = app;
        this.bits = [0, 0, 0, 0];
        for (const i of attack.split("+"))
            this.bits[["1", "2", "3", "4"].indexOf(i)] = 1;
    }

    draw(x: number, y: number, s: number) {
        const app = this.app;
        const cs = s * 0.44;
        const g = s * 0.01;
        const sw = s * 0.07;

        app.stroke(ICON_COL_OL);
        app.strokeWeight(sw);
        app.fill(this.bits[0] ? ICON_COL_BLUE : ICON_COL_BG);
        app.drawEllipse(x + (s - g) / 2 - cs, y + s - cs - g - cs, cs, sw);
        app.fill(this.bits[2] ? ICON_COL_GREEN : ICON_COL_BG);
        app.drawEllipse(x + (s - g) / 2 - cs, y + s - cs, cs, sw);
        app.fill(this.bits[1] ? ICON_COL_YELLOW : ICON_COL_BG);
        app.drawEllipse(x + (s + g) / 2, y, cs, sw);
        app.fill(this.bits[3] ? ICON_COL_RED : ICON_COL_BG);
        app.drawEllipse(x + (s + g) / 2, y + cs + g, cs, sw);
    }
}

new App();
