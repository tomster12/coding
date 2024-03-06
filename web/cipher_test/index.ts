const main = document.getElementById("main") as HTMLElement;

function createHTMLElement(elementString: string): HTMLElement {
    const div = document.createElement("div");
    div.innerHTML = elementString;
    return div.firstElementChild as HTMLElement;
}

function assert(condition: boolean, message: string) {
    if (!condition) throw new Error(message);
}

class TextContent {
    text: string[];

    constructor(text: string | string[]) {
        if (Array.isArray(text)) this.text = text;
        else this.text = text.split("");
    }

    toHTML(): string {
        return this.text.map((t) => `<span>${t}</span>`).join("");
    }
}

class EventBus {
    events: { [key: string]: Function[] };

    constructor() {
        this.events = {};
    }

    on(event: string, callback: Function) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }

    remove(event: string, callback: Function) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter((cb) => cb !== callback);
    }

    emit(event: string, ...args: any[]) {
        if (!this.events[event]) return;
        this.events[event].forEach((callback) => callback(...args));
    }
}

// ----------------------------------------------

class Entity {
    element: HTMLElement;
    events: EventBus;
    position: { x: number; y: number };

    constructor(elementString: string) {
        this.element = createHTMLElement(elementString);
        main.appendChild(this.element);
        this.events = new EventBus();
    }

    remove() {
        this.events.emit("remove");
        this.element.remove();
    }

    getPosition() {
        return this.position;
    }

    setPosition(x: number, y: number) {
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
        this.position = { x, y };
        this.events.emit("move", this.position);
    }

    getHTMLElement(): HTMLElement {
        return this.element;
    }
}

interface IPanelContent extends Entity {
    setPanel(panel: PanelEntity): void;
    setInputNodeValue(index: number, value: TextContent[]): void;
    getOutputNodeValue(index: number): TextContent[];
}

type PanelNodeType = "input" | "output";

class PanelEntity extends Entity {
    element: HTMLElement;
    elementBar: HTMLElement;
    elementBarTitle: HTMLElement;
    elementBarClose: HTMLElement;
    elementContent: HTMLElement;
    elementNodesInput: HTMLElement;
    elementNodesOutput: HTMLElement;
    content: IPanelContent | null;

    nodeCounts: { input: number; output: number } = { input: 0, output: 0 };
    isDragging: boolean;
    initialMouseX: number;
    initialMouseY: number;
    initialOffsetX: number;
    initialOffsetY: number;

    constructor(content: IPanelContent | null, title = "") {
        // Setup HTML elements
        super(`
            <div class="panel-entity">
                <div class="panel-bar">
                    <div class="panel-bar-title">Panel</div>
                    <div class="panel-bar-close">X</div>
                </div>
                <div class="panel-body">
                    <div class="panel-nodes input"></div>
                    <div class="panel-content"></div>
                    <div class="panel-nodes output"></div>
                </div>
            </div>`);

        this.elementBar = this.element.querySelector(
            ".panel-bar"
        ) as HTMLElement;

        this.elementBarTitle = this.element.querySelector(
            ".panel-bar-title"
        ) as HTMLElement;

        this.elementBarClose = this.element.querySelector(
            ".panel-bar-close"
        ) as HTMLElement;

        this.elementContent = this.element.querySelector(
            ".panel-content"
        ) as HTMLElement;

        this.elementNodesInput = this.element.querySelector(
            ".panel-nodes.input"
        ) as HTMLElement;

        this.elementNodesOutput = this.element.querySelector(
            ".panel-nodes.output"
        ) as HTMLElement;

        // Update content
        this.content = content;
        if (this.content) {
            this.elementContent.appendChild(this.content.getHTMLElement());
            this.content.setPanel(this);
        }

        // Setup event listeners
        this.elementBarClose.addEventListener("mousedown", (e) =>
            this.onCloseMouseDown(e)
        );
        this.elementBar.addEventListener("mousedown", (e) =>
            this.onMouseDown(e)
        );
        document.addEventListener("mousemove", (e) => this.onMouseMove(e));
        document.addEventListener("mouseup", (e) => this.onMouseUp(e));

        // Setup state
        this.isDragging = false;
        this.initialMouseX = 0;
        this.initialMouseY = 0;
        this.initialOffsetX = 0;
        this.initialOffsetY = 0;
    }

    setTitle(title: string) {
        this.elementBarTitle.innerHTML = title;
    }

    setNodeCount(type: PanelNodeType, count: number) {
        if (type === "input") {
            this.nodeCounts.input = count;
            this.elementNodesInput.innerHTML = "";
            for (let i = 0; i < count; i++) {
                const el = createHTMLElement(`<div class="panel-node"></div>`);
                el.addEventListener("mousedown", (e) => {
                    PanelConnectionManager.instance.onInputNodeMouseDown(
                        e,
                        this,
                        i
                    );
                });
                this.elementNodesInput.appendChild(el);
            }
        } else {
            this.nodeCounts.output = count;
            this.elementNodesOutput.innerHTML = "";
            for (let i = 0; i < count; i++) {
                const el = createHTMLElement(`<div class="panel-node"></div>`);
                el.addEventListener("mousedown", (e) => {
                    PanelConnectionManager.instance.onOutputNodeMouseDown(
                        e,
                        this,
                        i
                    );
                });
                this.elementNodesOutput.appendChild(el);
            }
        }
        this.events.emit("move", this.position);
    }

    getNodeHTML(type: PanelNodeType, index: number): HTMLElement {
        if (type === "input") {
            return this.elementNodesInput.querySelectorAll(".panel-node")[
                index
            ] as HTMLElement;
        } else {
            return this.elementNodesOutput.querySelectorAll(".panel-node")[
                index
            ] as HTMLElement;
        }
    }

    setInputNodeValue(index: number, value: TextContent[]) {
        assert(this.content !== null, "Panel does not have any content");
        (this.content as IPanelContent).setInputNodeValue(index, value);
    }

    getOutputNodeValue(index: number): TextContent[] {
        assert(this.content !== null, "Panel does not have any content");
        return (this.content as IPanelContent).getOutputNodeValue(index);
    }

    getContent(): IPanelContent | null {
        return this.content;
    }

    onCloseMouseDown(e: MouseEvent) {
        this.remove();
    }

    onMouseDown(e: MouseEvent) {
        this.isDragging = true;
        this.initialMouseX = e.clientX;
        this.initialMouseY = e.clientY;
        this.initialOffsetX = this.element.offsetLeft;
        this.initialOffsetY = this.element.offsetTop;
    }

    onMouseMove(e: MouseEvent) {
        if (!this.isDragging) return;
        const deltaX = e.clientX - this.initialMouseX;
        const deltaY = e.clientY - this.initialMouseY;
        this.setPosition(
            this.initialOffsetX + deltaX,
            this.initialOffsetY + deltaY
        );
    }

    onMouseUp(e: MouseEvent) {
        this.isDragging = false;
    }
}

class PanelConnection extends Entity {
    isConnected: boolean;
    sourcePanel: PanelEntity;
    sourceNodeIndex: number;
    sourceHTML: HTMLElement;
    sourcePos: { x: number; y: number };
    targetPanel: PanelEntity;
    targetNodeIndex: number;
    targetHTML: HTMLElement;
    targetPos: { x: number; y: number };
    sourceMoveListener: () => void;
    sourceOutputUpdateListener: (index: number) => void;
    targetMoveListener: () => void;
    removeListener: () => void;
    mouseMoveListener: (e: MouseEvent) => void;

    constructor() {
        // Setup HTML elements
        super(`<div class="panel-connection"></div>`);

        // Setup state
        this.isConnected = false;

        // Setup event listeners
        this.mouseMoveListener = (e) => this.onMouseMoved(e);
        document.addEventListener("mousemove", this.mouseMoveListener);
        this.removeListener = () => this.remove();
    }

    remove() {
        if (this.sourcePanel) {
            this.sourcePanel.events.remove("move", this.sourceMoveListener);
        }
        if (this.targetPanel) {
            this.targetPanel.events.remove("move", this.targetMoveListener);
        }
        document.removeEventListener("mousemove", this.mouseMoveListener);
        this.element.remove();
    }

    onMouseMoved(e: MouseEvent) {
        if (!this.isConnected) {
            // Update the source / target position if not connected
            const mousePos = { x: e.clientX, y: e.clientY };

            if (!this.sourcePanel) this.sourcePos = mousePos;
            else this.calculateSourcePos();

            if (!this.targetPanel) this.targetPos = mousePos;
            else this.calculateTargetPos();

            this.updateElement();
        } else {
            // Dont care about the mouse position if it's already connected
            document.removeEventListener("mousemove", this.mouseMoveListener);
        }
    }

    setSource(panel: PanelEntity, nodeIndex: number) {
        assert(!this.isConnected, "Connection is already connected");

        // Setup source panel and node
        this.sourcePanel = panel;
        this.sourceNodeIndex = nodeIndex;
        this.sourceHTML = this.sourcePanel.getNodeHTML("output", nodeIndex);

        // Setup event listeners
        this.sourceMoveListener = () => {
            this.calculateSourcePos();
            this.updateElement();
        };
        this.sourcePanel.events.on("move", this.sourceMoveListener);
        this.sourcePanel.events.on("remove", this.removeListener);

        // Calculate source position and check connection
        this.calculateSourcePos();
        if (!this.targetPanel) this.targetPos = this.sourcePos;
        else this.establishConnection();

        // Update element
        this.updateElement();
    }

    setTarget(panel: PanelEntity, nodeIndex: number) {
        assert(!this.isConnected, "Connection is already connected");

        // Setup target panel and node
        this.targetPanel = panel;
        this.targetNodeIndex = nodeIndex;
        this.targetHTML = this.targetPanel.getNodeHTML("input", nodeIndex);

        // Setup event listeners
        this.targetMoveListener = () => {
            this.calculateTargetPos();
            this.updateElement();
        };
        this.targetPanel.events.on("move", this.targetMoveListener);
        this.targetPanel.events.on("remove", this.removeListener);

        // Calculate target position and check connection
        this.calculateTargetPos();
        if (!this.sourcePanel) this.sourcePos = this.targetPos;
        else this.establishConnection();

        // Update element
        this.updateElement();
    }

    establishConnection() {
        this.isConnected = true;

        // Listen on source node changes
        this.sourceOutputUpdateListener = (index: number) => {
            if (index === this.sourceNodeIndex) this.propogate();
        };
        this.sourcePanel.events.on(
            "outputUpdate",
            this.sourceOutputUpdateListener
        );

        // Propogate the source value to the target
        this.propogate();
    }

    propogate() {
        if (!this.isConnected) return;

        // Propogate the source value to the target
        const sourceValue = this.sourcePanel.getOutputNodeValue(
            this.sourceNodeIndex
        );

        this.targetPanel.setInputNodeValue(this.targetNodeIndex, sourceValue);
    }

    calculateSourcePos() {
        if (!this.sourcePanel) return;

        // Get the center of the source node
        const sourcePos = this.sourceHTML.getBoundingClientRect();
        this.sourcePos = {
            x: sourcePos.left + sourcePos.width / 2,
            y: sourcePos.top + sourcePos.height / 2,
        };
    }

    calculateTargetPos() {
        if (!this.targetPanel) return;

        // Get the center of the target node
        const targetPos = this.targetHTML.getBoundingClientRect();
        this.targetPos = {
            x: targetPos.left + targetPos.width / 2,
            y: targetPos.top + targetPos.height / 2,
        };
    }

    updateElement() {
        this.element.style.left = this.sourcePos.x + "px";
        this.element.style.top = this.sourcePos.y + "px";
        this.element.style.width = this.targetPos.x - this.sourcePos.x + "px";
        this.element.style.height = this.targetPos.y - this.sourcePos.y + "px";
    }
}

class PanelConnectionManager {
    static instance: PanelConnectionManager;
    currentConnection: PanelConnection | null;
    connections: PanelConnection[];

    constructor() {
        PanelConnectionManager.instance = this;
        this.currentConnection = null;
        this.connections = [];

        main.addEventListener("mousedown", (e) => this.onMainMouseDown(e));
    }

    onInputNodeMouseDown(e: MouseEvent, panel: PanelEntity, nodeIndex: number) {
        e.stopPropagation();
        if (this.currentConnection) {
            if (
                this.currentConnection.sourcePanel === panel ||
                this.currentConnection.targetPanel != null
            ) {
                this.currentConnection.remove();
                this.currentConnection = null;
                return;
            }
            this.currentConnection.setTarget(panel, nodeIndex);
            if (this.currentConnection.isConnected) {
                this.connections.push(this.currentConnection);
                this.currentConnection = null;
            }
        } else {
            this.currentConnection = new PanelConnection();
            this.currentConnection.setTarget(panel, nodeIndex);
        }
    }

    onOutputNodeMouseDown(
        e: MouseEvent,
        panel: PanelEntity,
        nodeIndex: number
    ) {
        e.stopPropagation();
        if (this.currentConnection) {
            if (
                this.currentConnection.targetPanel === panel ||
                this.currentConnection.sourcePanel != null
            ) {
                this.currentConnection.remove();
                this.currentConnection = null;
                return;
            }
            this.currentConnection.setSource(panel, nodeIndex);
            if (this.currentConnection.isConnected) {
                this.connections.push(this.currentConnection);
                this.currentConnection = null;
            }
        } else {
            this.currentConnection = new PanelConnection();
            this.currentConnection.setSource(panel, nodeIndex);
        }
    }

    onMainMouseDown(e: MouseEvent) {
        if (this.currentConnection) {
            this.currentConnection.remove();
            this.currentConnection = null;
        }
    }
}

class TextEntity extends Entity implements IPanelContent {
    panel: PanelEntity;
    element: HTMLElement;
    contentList: TextContent[];

    constructor(contentList: TextContent[]) {
        // Setup HTML elements
        super(`<div class="text-entity"></div>`);

        // Update content with passed content
        this.setContentList(contentList);
    }

    setPanel(panel: PanelEntity) {
        this.panel = panel;
        this.panel.setTitle("Text");
        this.panel.setNodeCount("input", 0);
        this.panel.setNodeCount("output", 1);
    }

    setContentList(contentList: TextContent[]) {
        // Update content
        this.contentList = contentList;

        // Add each line to the element
        this.element.innerHTML = "";
        this.contentList.forEach((content: TextContent) => {
            this.element.appendChild(
                createHTMLElement(
                    `<div class="text-content">${content.toHTML()}</div>`
                )
            );
        });
    }

    setInputNodeValue(index: number, value: TextContent[]) {
        assert(false, "TextEntity does not have any inputs");
    }

    getOutputNodeValue(index: number): TextContent[] {
        assert(index == 0, "TextEntity only has one output");
        return this.contentList;
    }
}

class SplitTextEntity extends Entity implements IPanelContent {
    panel: PanelEntity;
    element: HTMLElement;
    contentList: TextContent[];

    constructor() {
        // Setup HTML elements
        super(`<div class="split-text-entity"></div>`);
    }

    setPanel(panel: PanelEntity) {
        this.panel = panel;
        this.panel.setTitle("Split");
        this.panel.setNodeCount("input", 1);
        this.panel.setNodeCount("output", 0);
    }

    setContentList(contentList: TextContent[]) {
        // Update content
        this.contentList = contentList;

        // Add each line to the element
        this.element.innerHTML = "";
        this.contentList.forEach((content: TextContent) => {
            this.element.appendChild(
                createHTMLElement(
                    `<div class="text-content">${content.toHTML()}</div>`
                )
            );
        });
    }

    setInputNodeValue(index: number, value: TextContent[]) {
        assert(index == 0, "SplitTextEntity only has one input");
        this.setContentList(value);
        this.panel.setNodeCount("output", this.contentList.length);
        this.events.emit("outputUpdate", 0);
    }

    getOutputNodeValue(index: number): TextContent[] {
        assert(index < this.contentList.length, "Invalid output index");
        return [this.contentList[index]];
    }
}

// ----------------------------------------------

new PanelConnectionManager();

const p1 = new PanelEntity(new TextEntity([new TextContent("Hello World")]));

const p2 = new PanelEntity(
    new TextEntity([
        new TextContent("01232324334252323"),
        new TextContent("45645632234456454"),
        new TextContent("13231212323232"),
    ])
);

const p3 = new PanelEntity(new SplitTextEntity());

p1.setPosition(50, 50);
p2.setPosition(70, 300);
p3.setPosition(350, 300);
