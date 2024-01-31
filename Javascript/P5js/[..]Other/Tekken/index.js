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

function preload() {
    fontRegular = loadFont("FontRegular.otf");
    fontBold = loadFont("FontBold.otf");
    fontItalic = loadFont("FontItalic.otf");
}

function setup() {
    createCanvas(800, 135);

    // drawCard("🔺", "Quick", "i10,+9", "🌀", "f123", cCardBack1);
    // drawCard("🔹", "Up - Tornado", "i16", "", "df2,df42,f234", cCardBack1);
    // drawCard("🔹🔥", "H. Dash - Combo", "", "", "f1+2,b44", cCardBack1);

    // drawCard("🔺", "Slow Long Poke", "i20", "📏🧱", "f3", cCardBack2);
    // drawCard("🔹", "Power Crush", "i24, +12", "🟥", "b3", cCardBack2);
    // drawCard("🔻", "Slow Low", "i28", "🌀🧱", "db1+21+2", cCardBack2);

    // drawCard("🔹(🕯️/🔥)", "Heat Dash", "i28", "", "f1+2", cCardBack3);
    // drawCard("🔹", "Knockup", "i16, +32", "✈️", "df2", cCardBack3);
    // drawCard(
    //     "🔺(~🔥)",
    //     "Quick - H. Slam",
    //     "i10",
    //     "🌀🟥",
    //     "f123df1",
    //     cCardBack3
    // );
    drawCard("🔹🕯️", "Up - Smash", "i16", "", "df2,2+32+3", cCardBack3);
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
