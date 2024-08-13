namespace Globals {
    export let main: HTMLElement;
    export let logManager: Entities.LogManager;
    export let pagePanelManager: Entities.PagePanelManager;
}

namespace Util {
    /** Create an HTML element from a string using innerHTML of a div.*/
    export function createHTMLElement(elementString: string): HTMLElement {
        const div = document.createElement("div");
        div.innerHTML = elementString;
        return div.firstElementChild as HTMLElement;
    }

    /** Assert a condition is true, otherwise throw an error with the given message. */
    export function assert(condition: boolean, message: string) {
        if (!condition) throw new Error(message);
    }

    /** A simple event bus for passing events between to listeners. */
    export class EventBus {
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
}

namespace Cipher {
    /** Generic message class used by cryptography. */
    export class Message {
        text: string;

        constructor(text: string) {
            this.text = text;
        }

        toHTML(): string {
            return `<span>${this.text}</span>`;
        }
    }
}

namespace Entities {
    /** References a global log element and provides a way to log messages to it. */
    export class LogManager {
        logs: { timestamp: string; message: string }[];
        logParent: HTMLElement;
        logContainer: HTMLElement;

        constructor(logParent: HTMLElement) {
            this.logs = [];
            this.logParent = logParent;
            this.logContainer = logParent.querySelector(".logs-container") as HTMLElement;
        }

        log(message: string) {
            const timestamp = new Date().toLocaleTimeString();
            this.logs.push({ timestamp, message });
            this.logContainer.innerHTML += `<div class="log">${timestamp}: ${message}</div>`;
        }
    }

    /** A proxy to a HTML element which can be moved around and removed. */
    export class PageEntity {
        element: HTMLElement;
        events: Util.EventBus;
        position: { x: number; y: number };

        constructor(elementString: string) {
            this.element = Util.createHTMLElement(elementString);
            this.events = new Util.EventBus();
            this.position = { x: 0, y: 0 };
            this.setParent(Globals.main);
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

        setParent(parent: HTMLElement) {
            parent.appendChild(this.element);
        }

        getHTMLElement(): HTMLElement {
            return this.element;
        }
    }

    /** Content which can be placed inside a PagePanel. */
    export interface IPagePanelContent extends PageEntity {
        setPanel(panel: PagePanel): void;
        setInputNodeValue(index: number, value: Cipher.Message[]): void;
        getOutputNodeValue(index: number): Cipher.Message[];
    }

    export type PagePanelNodeType = "input" | "output";

    /** Panel which can contain content and have input / output nodes. */
    export class PagePanel extends PageEntity {
        elementBar: HTMLElement;
        elementBarTitle: HTMLElement;
        elementBarClose: HTMLElement;
        elementContent: HTMLElement;
        elementNodesInput: HTMLElement;
        elementNodesOutput: HTMLElement;

        content: IPagePanelContent;
        nodeCounts: { input: number; output: number } = { input: 0, output: 0 };
        isDragging: boolean;
        initialMouseX: number;
        initialMouseY: number;
        initialOffsetX: number;
        initialOffsetY: number;

        constructor(content: IPagePanelContent, title = "") {
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
            this.elementBar = this.element.querySelector(".panel-bar") as HTMLElement;
            this.elementBarTitle = this.element.querySelector(".panel-bar-title") as HTMLElement;
            this.elementBarClose = this.element.querySelector(".panel-bar-close") as HTMLElement;
            this.elementContent = this.element.querySelector(".panel-content") as HTMLElement;
            this.elementNodesInput = this.element.querySelector(".panel-nodes.input") as HTMLElement;
            this.elementNodesOutput = this.element.querySelector(".panel-nodes.output") as HTMLElement;

            this.elementBarClose.addEventListener("mousedown", (e) => this.onCloseMouseDown(e));
            this.elementBar.addEventListener("mousedown", (e) => this.onBarMouseDown(e));
            document.addEventListener("mousemove", (e) => this.onMouseMove(e));
            document.addEventListener("mouseup", (e) => this.onMouseUp(e));

            this.isDragging = false;
            this.initialMouseX = 0;
            this.initialMouseY = 0;
            this.initialOffsetX = 0;
            this.initialOffsetY = 0;

            this.content = content;
            this.elementContent.appendChild(this.content.getHTMLElement());
            this.content.setPanel(this);
            this.content.events.on("outputUpdate", (index: number) => this.events.emit("outputUpdate", index));

            Globals.pagePanelManager.registerPanel(this);
        }

        setNodeCount(inputCount: number, outputCount: number) {
            if (inputCount != this.nodeCounts.input) {
                this.elementNodesInput.innerHTML = "";
                for (let i = 0; i < inputCount; i++) {
                    const el = Util.createHTMLElement(`<div class="panel-node"></div>`);
                    el.addEventListener("mousedown", (e) => {
                        e.stopPropagation();
                        this.events.emit("nodeClicked", "input", i);
                    });
                    this.elementNodesInput.appendChild(el);
                }
            }

            if (outputCount != this.nodeCounts.output) {
                this.elementNodesOutput.innerHTML = "";
                for (let i = 0; i < outputCount; i++) {
                    const el = Util.createHTMLElement(`<div class="panel-node"></div>`);
                    el.addEventListener("mousedown", (e) => {
                        e.stopPropagation();
                        this.events.emit("nodeClicked", "output", i);
                    });
                    this.elementNodesOutput.appendChild(el);
                }
            }

            this.nodeCounts.input = inputCount;
            this.nodeCounts.output = outputCount;
            this.events.emit("move", this.position);
        }

        getNodeHTML(type: PagePanelNodeType, index: number): HTMLElement {
            if (type === "input") {
                return this.elementNodesInput.querySelectorAll(".panel-node")[index] as HTMLElement;
            } else {
                return this.elementNodesOutput.querySelectorAll(".panel-node")[index] as HTMLElement;
            }
        }

        setInputNodeValue(index: number, value: Cipher.Message[]) {
            Util.assert(this.content !== null, "Panel does not have any content");
            (this.content as IPagePanelContent).setInputNodeValue(index, value);
        }

        getOutputNodeValue(index: number): Cipher.Message[] {
            Util.assert(this.content !== null, "Panel does not have any content");
            return (this.content as IPagePanelContent).getOutputNodeValue(index);
        }

        onCloseMouseDown(e: MouseEvent) {
            this.remove();
        }

        onBarMouseDown(e: MouseEvent) {
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
            this.setPosition(this.initialOffsetX + deltaX, this.initialOffsetY + deltaY);
        }

        onMouseUp(e: MouseEvent) {
            this.isDragging = false;
        }
    }

    /** Global manager referenced by PagePanels to manage connections between them. */
    export class PagePanelManager {
        panels: PagePanel[];
        connections: PagePanelConnection[];
        currentConnection: PagePanelConnection | null;

        constructor() {
            this.panels = [];
            this.connections = [];
            this.currentConnection = null;
            Globals.main.addEventListener("mousedown", (e) => this.onMainMouseDown(e));
        }

        registerPanel(panel: PagePanel) {
            panel.events.on("remove", this.onPanelRemoved.bind(this));
            panel.events.on("nodeClicked", (type: PagePanelNodeType, index: number) => {
                if (type === "input") this.connectInputNode(panel, index);
                else this.connectOutputNode(panel, index);
            });
        }

        connectInputNode(panel: PagePanel, nodeIndex: number) {
            if (this.currentConnection) {
                if (this.currentConnection.sourcePanel === panel || this.currentConnection.targetPanel != null) {
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
                this.currentConnection = new PagePanelConnection();
                this.currentConnection.setTarget(panel, nodeIndex);
            }
        }

        connectOutputNode(panel: PagePanel, nodeIndex: number) {
            if (this.currentConnection) {
                if (this.currentConnection.targetPanel === panel || this.currentConnection.sourcePanel != null) {
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
                this.currentConnection = new PagePanelConnection();
                this.currentConnection.setSource(panel, nodeIndex);
            }
        }

        removeConnection(connection: PagePanelConnection) {
            this.connections = this.connections.filter((c) => c !== connection);
        }

        onPanelRemoved(panel: PagePanel) {
            this.panels = this.panels.filter((p) => p !== panel);
        }

        onMainMouseDown(e: MouseEvent) {
            e.stopPropagation();
            if (this.currentConnection) {
                this.currentConnection.remove();
                this.currentConnection = null;
            }
        }
    }

    /** Visual and representation of a connection between two panels. */
    export class PagePanelConnection extends PageEntity {
        isConnected: boolean;
        sourcePanel: PagePanel;
        targetPanel: PagePanel;
        sourceNodeIndex: number;
        targetNodeIndex: number;
        sourcePos: { x: number; y: number };
        targetPos: { x: number; y: number };
        mouseMoveListener: (e: MouseEvent) => void;
        sourceMoveListener: () => void;
        targetMoveListener: () => void;
        sourceOutputUpdateListener: (index: number) => void;
        removeListener: () => void;

        constructor() {
            super(`<div class="panel-connection"></div>`);

            this.mouseMoveListener = this.onMouseMoved.bind(this);
            this.removeListener = this.remove.bind(this);
            document.addEventListener("mousemove", this.mouseMoveListener);

            this.isConnected = false;
        }

        setSource(panel: PagePanel, nodeIndex: number) {
            Util.assert(!this.isConnected, "Connection is already connected");

            this.sourcePanel = panel;
            this.sourceNodeIndex = nodeIndex;
            this.sourceMoveListener = () => {
                this.recalculateSourceNodePos();
                this.updateElement();
            };
            this.sourcePanel.events.on("move", this.sourceMoveListener);
            this.sourcePanel.events.on("remove", this.removeListener);

            this.recalculateSourceNodePos();
            if (!this.targetPanel) this.targetPos = this.sourcePos;
            this.updateElement();

            if (this.targetPanel) this.establishConnection();
        }

        setTarget(panel: PagePanel, nodeIndex: number) {
            Util.assert(!this.isConnected, "Connection is already connected");

            this.targetPanel = panel;
            this.targetNodeIndex = nodeIndex;
            this.targetMoveListener = () => {
                this.recalculateTargetNodePos();
                this.updateElement();
            };
            this.targetPanel.events.on("move", this.targetMoveListener);
            this.targetPanel.events.on("remove", this.removeListener);

            this.recalculateTargetNodePos();
            if (!this.sourcePanel) this.sourcePos = this.targetPos;
            this.updateElement();

            if (this.sourcePanel) this.establishConnection();
        }

        establishConnection() {
            this.isConnected = true;
            this.sourceOutputUpdateListener = (index: number) => {
                if (index === this.sourceNodeIndex) this.propogate();
            };
            this.sourcePanel.events.on("outputUpdate", this.sourceOutputUpdateListener);
            this.propogate();
        }

        propogate() {
            if (!this.isConnected) return;
            const sourceValue = this.sourcePanel.getOutputNodeValue(this.sourceNodeIndex);
            this.targetPanel.setInputNodeValue(this.targetNodeIndex, sourceValue);
        }

        recalculateSourceNodePos() {
            if (!this.sourcePanel) return;
            const sourcePos = this.sourcePanel.getNodeHTML("output", this.sourceNodeIndex).getBoundingClientRect();
            this.sourcePos = {
                x: sourcePos.left + sourcePos.width / 2,
                y: sourcePos.top + sourcePos.height / 2,
            };
        }

        recalculateTargetNodePos() {
            if (!this.targetPanel) return;
            const targetPos = this.targetPanel.getNodeHTML("input", this.targetNodeIndex).getBoundingClientRect();
            this.targetPos = {
                x: targetPos.left + targetPos.width / 2,
                y: targetPos.top + targetPos.height / 2,
            };
        }

        updateElement() {
            const dx = this.targetPos.x - this.sourcePos.x;
            const dy = this.targetPos.y - this.sourcePos.y;
            const dst = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(this.targetPos.y - this.sourcePos.y, this.targetPos.x - this.sourcePos.x);

            // Make the element a line between the source and target
            this.element.style.left = this.sourcePos.x + "px";
            this.element.style.top = `calc(${this.sourcePos.y}px - 0.1rem)`;
            this.element.style.width = dst + "px";
            this.element.style.transform = `rotate(${angle}rad)`;
        }

        remove() {
            document.removeEventListener("mousemove", this.mouseMoveListener);
            if (this.sourcePanel) {
                this.sourcePanel.events.remove("move", this.sourceMoveListener);
                this.sourcePanel.events.remove("remove", this.removeListener);
            }
            if (this.targetPanel) {
                this.targetPanel.events.remove("move", this.targetMoveListener);
                this.targetPanel.events.remove("remove", this.removeListener);
            }
            if (this.isConnected) this.sourcePanel.events.remove("outputUpdate", this.sourceOutputUpdateListener);
            Globals.pagePanelManager.removeConnection(this);
            this.element.remove();
        }

        onMouseMoved(e: MouseEvent) {
            // Stop caring the mouse position if it's already connected
            if (this.isConnected) document.removeEventListener("mousemove", this.mouseMoveListener);

            const mousePos = { x: e.clientX, y: e.clientY };
            if (!this.sourcePanel) this.sourcePos = mousePos;
            else this.recalculateSourceNodePos();
            if (!this.targetPanel) this.targetPos = mousePos;
            else this.recalculateTargetNodePos();
            this.updateElement();
        }
    }

    /** PagePanel content, displays messages. */
    export class TextEntity extends PageEntity implements IPagePanelContent {
        panel: PagePanel;
        messages: Cipher.Message[];

        constructor(messages: Cipher.Message[]) {
            super(`<div class="text-entity"></div>`);

            this.setMessages(messages);
        }

        setPanel(panel: PagePanel) {
            this.panel = panel;
            this.panel.setNodeCount(0, 1);
        }

        setMessages(messages: Cipher.Message[]) {
            this.messages = messages;
            this.element.innerHTML = "";
            this.messages.forEach((content: Cipher.Message) => {
                this.element.appendChild(Util.createHTMLElement(`<div class="text-content">${content.toHTML()}</div>`));
            });
        }

        setInputNodeValue(_index: number, _value: Cipher.Message[]) {
            Util.assert(false, "TextEntity does not have any inputs");
        }

        getOutputNodeValue(index: number): Cipher.Message[] {
            Util.assert(index == 0, "TextEntity only has one output");
            return this.messages;
        }
    }

    /** PagePanel content, splits messages into lines. */
    export class SplitTextEntity extends PageEntity implements IPagePanelContent {
        panel: PagePanel;
        contentList: Cipher.Message[];

        constructor() {
            super(`<div class="split-text-entity"></div>`);
        }

        setPanel(panel: PagePanel) {
            this.panel = panel;
            this.panel.setNodeCount(1, 0);
        }

        setContentList(contentList: Cipher.Message[]) {
            this.contentList = contentList;
            this.element.innerHTML = "";
            this.contentList.forEach((content: Cipher.Message) => {
                this.element.appendChild(Util.createHTMLElement(`<div class="text-content">${content.toHTML()}</div>`));
            });
        }

        setInputNodeValue(index: number, value: Cipher.Message[]) {
            Util.assert(index == 0, "SplitTextEntity only has one input");
            this.setContentList(value);
            this.panel.setNodeCount(1, this.contentList.length);
            this.events.emit("outputUpdate", 0);
        }

        getOutputNodeValue(index: number): Cipher.Message[] {
            Util.assert(index < this.contentList.length, "Invalid output index");
            return [this.contentList[index]];
        }
    }
}

(function () {
    Globals.main = document.querySelector(".main");
    Globals.logManager = new Entities.LogManager(document.querySelector(".logs"));
    Globals.pagePanelManager = new Entities.PagePanelManager();

    const p1 = new Entities.PagePanel(new Entities.TextEntity([new Cipher.Message("Hello World")]), "Text Panel");

    const p2 = new Entities.PagePanel(
        new Entities.TextEntity([new Cipher.Message("01232324334252323"), new Cipher.Message("45645632234456454"), new Cipher.Message("13231212323232")]),
        "Text Panel 2"
    );

    const p3 = new Entities.PagePanel(new Entities.SplitTextEntity(), "Split Panel");

    p1.setPosition(50, 50);
    p2.setPosition(70, 300);
    p3.setPosition(350, 300);
})();
