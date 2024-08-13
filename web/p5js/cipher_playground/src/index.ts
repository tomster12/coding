import p5 from "p5";

class Float2 {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

class Bounds {
    a: Float2;
    b: Float2;

    constructor(ax: number, ay: number, bx: number, by: number) {
        this.a = new Float2(ax, ay);
        this.b = new Float2(bx, by);
    }
}

class bounds {
    x!: number;
    y!: number;
    w!: number;
    h!: number;
}

class UIElement {
    uiManager: UIManager;
    zIndex: number = 0;
    parent: UIElement | null = null;
    children: UIElement[] = [];
    localPosition: Float2;
    globalPosition: Float2;

    constructor(uiManager: UIManager, localPosition: Float2) {
        this.uiManager = uiManager;
        this.localPosition = localPosition;
        this.globalPosition = localPosition;
        this.updateGlobalPosition();
        this.uiManager.addElement(this);
    }

    draw() {}

    addChild(child: UIElement) {
        child.parent = this;
        this.children.push(child);
        child.updateGlobalPosition();
    }

    removeChild(child: UIElement) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            child.parent = null;
            child.updateGlobalPosition();
            this.children.splice(index, 1);
        }
    }

    setLocalPosition(localPosition: Float2) {
        this.localPosition = localPosition;
        this.updateGlobalPosition();
    }

    getLocalPosition(): Float2 {
        return this.localPosition;
    }

    updateGlobalPosition() {
        if (this.parent) {
            this.globalPosition = new Float2(
                this.localPosition.x + this.parent.getGlobalPosition().x,
                this.localPosition.y + this.parent.getGlobalPosition().y
            );
        } else {
            this.globalPosition = this.localPosition;
        }
        this.children.forEach((child) => child.updateGlobalPosition());
    }

    getGlobalPosition(): Float2 {
        return this.globalPosition;
    }

    getBounds(): Bounds {
        return new Bounds(this.getGlobalPosition().x, this.getGlobalPosition().y, 0, 0);
    }
}

class UIPanel extends UIElement {
    width: number;
    height: number;
    bgColour: string;

    constructor(uiManager: UIManager, localPosition: Float2, width: number, height: number, bgColour: string) {
        super(uiManager, localPosition);
        this.width = width;
        this.height = height;
        this.bgColour = bgColour;
    }

    draw() {
        this.uiManager.app.fill(this.bgColour);
        this.uiManager.app.rect(this.getGlobalPosition().x, this.getGlobalPosition().y, this.width, this.height);
    }

    getBounds(): Bounds {
        return new Bounds(
            this.getGlobalPosition().x,
            this.getGlobalPosition().y,
            this.getGlobalPosition().x + this.width,
            this.getGlobalPosition().y + this.height
        );
    }
}

class UIText extends UIElement {
    text!: string;
    textSize: number;
    bounds!: bounds;

    constructor(uiManager: UIManager, localPosition: Float2, text: string, textSize = 12) {
        super(uiManager, localPosition);
        this.text = text;
        this.textSize = textSize;
        this.setText(text);
    }

    draw() {
        this.uiManager.app.textSize(this.textSize);
        this.uiManager.app.textAlign(this.uiManager.app.LEFT, this.uiManager.app.TOP);

        this.uiManager.app.fill("#000000");
        this.uiManager.app.text(this.text, this.getGlobalPosition().x - this.bounds.x, this.getGlobalPosition().y - this.bounds.y);
    }

    setText(text: string) {
        this.text = text;
        this.updateBounds();
    }

    updateBounds() {
        this.uiManager.app.textSize(this.textSize);
        this.uiManager.app.textAlign(this.uiManager.app.LEFT, this.uiManager.app.TOP);

        this.bounds = this.uiManager.app.font.textBounds(this.text, 0, 0) as bounds;
    }
}

class UIManager {
    static instance: UIManager;

    app: App;
    elements: UIElement[];

    constructor(app: App) {
        UIManager.instance = this;
        this.app = app;
        this.elements = [];
    }

    addElement(uiElement: UIElement): UIElement {
        this.elements.push(uiElement);
        return uiElement;
    }

    removeElement(uiElement: UIElement) {
        const index = this.elements.indexOf(uiElement);
        if (index > -1) {
            if (uiElement.parent) uiElement.parent.removeChild(uiElement);
            this.elements.splice(index, 1);
        }
    }

    draw() {
        this.elements.sort((a, b) => a.zIndex - b.zIndex);
        this.elements.forEach((element) => element.draw());
    }
}

class SimpleTextPanel {
    panel: UIPanel;
    textElement: UIText;

    constructor(uiManager: UIManager, localPosition: Float2, bgColour: string, text: string, textSize = 12, margin = 10) {
        this.panel = new UIPanel(uiManager, localPosition, 0, 0, bgColour);

        this.textElement = new UIText(uiManager, new Float2(margin, margin), text, textSize);

        this.panel.addChild(this.textElement);

        this.panel.width = this.textElement.bounds.w + 20;
        this.panel.height = this.textElement.bounds.h + 20;
        this.textElement.zIndex = 2;
    }
}

class App extends p5 {
    uiManager!: UIManager;
    font!: p5.Font;
    tp!: SimpleTextPanel;

    constructor() {
        super(() => {});
    }

    preload() {
        this.font = this.loadFont("assets/FontRegular.ttf");
    }

    setup() {
        const canvas = this.createCanvas(this.windowWidth, this.windowHeight);
        canvas.parent("app");

        this.textFont(this.font);
        this.noSmooth();

        this.uiManager = new UIManager(this);

        this.tp = new SimpleTextPanel(this.uiManager, new Float2(400, 400), "#f3f3f3", "Hello World\nAnother Line", 15, 10);
    }

    windowResized(event?: object | undefined): void {
        this.resizeCanvas(this.windowWidth, this.windowHeight);
    }

    draw() {
        this.background("#1c1c1e");
        this.uiManager.draw();
    }
}

new App();
