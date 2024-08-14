var Globals;
(function (Globals) {
})(Globals || (Globals = {}));
var Easing;
(function (Easing) {
    function easeOutQuad(t) {
        return 1 - (1 - t) * (1 - t);
    }
    Easing.easeOutQuad = easeOutQuad;
})(Easing || (Easing = {}));
var Util;
(function (Util) {
    /** Create an HTML element from a string using innerHTML of a div.*/
    function createHTMLElement(elementString) {
        const div = document.createElement("div");
        div.innerHTML = elementString;
        return div.firstElementChild;
    }
    Util.createHTMLElement = createHTMLElement;
    /** Assert a condition is true, otherwise throw an error with the given message. */
    function assert(condition, message) {
        if (!condition)
            throw new Error(message);
    }
    Util.assert = assert;
    /** A simple event bus for passing events between to listeners. */
    class EventBus {
        events;
        constructor() {
            this.events = {};
        }
        on(event, callback) {
            if (!this.events[event])
                this.events[event] = [];
            this.events[event].push(callback);
        }
        remove(event, callback) {
            if (!this.events[event])
                return;
            this.events[event] = this.events[event].filter((cb) => cb !== callback);
        }
        emit(event, ...args) {
            if (!this.events[event])
                return;
            this.events[event].forEach((callback) => callback(...args));
        }
    }
    Util.EventBus = EventBus;
})(Util || (Util = {}));
var Cipher;
(function (Cipher) {
    /** Generic message class used by cryptography. */
    class Message {
        letters;
        constructor(letters) {
            this.letters = letters;
        }
        static parseFromString(text, delimeter = "") {
            return new Message(text.split(delimeter));
        }
    }
    Cipher.Message = Message;
})(Cipher || (Cipher = {}));
var Entities;
(function (Entities) {
    /** References a global log element and provides a way to log messages to it. */
    class LogManager {
        logs;
        logParent;
        logContainer;
        constructor(logParent) {
            this.logs = [];
            this.logParent = logParent;
            this.logContainer = logParent.querySelector(".logs-list");
        }
        log(message) {
            const timestamp = new Date().toLocaleTimeString();
            this.logs.push({ timestamp, message });
            this.logContainer.innerHTML += `<div class="log">${timestamp}: ${message}</div>`;
        }
    }
    Entities.LogManager = LogManager;
    /** A proxy to a HTML element which can be moved around and removed. */
    class BaseEntity {
        element;
        events;
        position;
        constructor(elementString) {
            this.element = Util.createHTMLElement(elementString);
            this.events = new Util.EventBus();
            this.position = { x: 0, y: 0 };
            this.setParent(Globals.mainContainer);
        }
        remove() {
            this.events.emit("remove");
            this.element.remove();
        }
        getPosition() {
            return this.position;
        }
        setPosition(x, y) {
            this.element.style.left = x + "px";
            this.element.style.top = y + "px";
            this.position = { x, y };
            this.events.emit("move", this.position);
        }
        setParent(parent) {
            parent.appendChild(this.element);
        }
        getHTMLElement() {
            return this.element;
        }
    }
    Entities.BaseEntity = BaseEntity;
    /** Panel which can contain content and have input / output nodes. */
    class PanelEntity extends BaseEntity {
        elementBar;
        elementBarTitle;
        elementBarClose;
        elementContent;
        elementNodesInput;
        elementNodesOutput;
        content;
        nodeCounts = { input: 0, output: 0 };
        nodeLabels = { input: [], output: [] };
        isDragging;
        initialMouseX;
        initialMouseY;
        initialOffsetX;
        initialOffsetY;
        constructor(content, title) {
            super(`
                <div class="panel-entity">
                    <div class="panel-entity-bar">
                        <div class="panel-entity-bar-title">${title}</div>
                        <img class="panel-entity-bar-close"></img>
                    </div>
                    <div class="panel-entity-body">
                        <div class="panel-entity-nodes input"></div>
                        <div class="panel-entity-content"></div>
                        <div class="panel-entity-nodes output"></div>
                    </div>
                </div>`);
            this.elementBar = this.element.querySelector(".panel-entity-bar");
            this.elementBarTitle = this.element.querySelector(".panel-entity-bar-title");
            this.elementBarClose = this.element.querySelector(".panel-entity-bar-close");
            this.elementContent = this.element.querySelector(".panel-entity-content");
            this.elementNodesInput = this.element.querySelector(".panel-entity-nodes.input");
            this.elementNodesOutput = this.element.querySelector(".panel-entity-nodes.output");
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
            this.content.events.on("outputUpdate", (index) => this.events.emit("outputUpdate", index));
            Globals.PanelEntityManager.registerPanel(this);
        }
        setNodeCount(inputCount, outputCount) {
            if (inputCount != this.nodeCounts.input) {
                this.elementNodesInput.innerHTML = "";
                for (let i = 0; i < inputCount; i++) {
                    const el = Util.createHTMLElement(`<div class="panel-entity-node"></div>`);
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
                    const el = Util.createHTMLElement(`<div class="panel-entity-node"></div>`);
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
        setNodeLabels(inputLabels, outputLabels) {
            this.nodeLabels.input = inputLabels;
            this.nodeLabels.output = outputLabels;
            Util.assert(inputLabels == null || inputLabels.length == this.nodeCounts.input, "inputLabels wrong length.");
            Util.assert(outputLabels == null || outputLabels.length == this.nodeCounts.output, "outputLabels wrong length.");
            for (let i = 0; i < this.nodeCounts.input; i++) {
                if (inputLabels == null)
                    this.getNodeHTML("input", i).innerHTML = "";
                else
                    this.getNodeHTML("input", i).innerHTML = `<span>${inputLabels[i]}</span>`;
            }
            for (let i = 0; i < this.nodeCounts.output; i++) {
                if (outputLabels == null)
                    this.getNodeHTML("output", i).innerHTML = "";
                else
                    this.getNodeHTML("output", i).innerHTML = `<span>${outputLabels[i]}</span>`;
            }
        }
        getNodeHTML(type, index) {
            if (type === "input") {
                return this.elementNodesInput.querySelectorAll(".panel-entity-node")[index];
            }
            else {
                return this.elementNodesOutput.querySelectorAll(".panel-entity-node")[index];
            }
        }
        setInputNodeValue(index, value) {
            Util.assert(this.content !== null, "Panel does not have any content");
            this.content.setInputNodeValue(index, value);
        }
        getOutputNodeValue(index) {
            Util.assert(this.content !== null, "Panel does not have any content");
            return this.content.getOutputNodeValue(index);
        }
        onCloseMouseDown(e) {
            this.remove();
        }
        onBarMouseDown(e) {
            this.isDragging = true;
            this.initialMouseX = e.clientX;
            this.initialMouseY = e.clientY;
            this.initialOffsetX = this.element.offsetLeft;
            this.initialOffsetY = this.element.offsetTop;
        }
        onMouseMove(e) {
            if (!this.isDragging)
                return;
            const deltaX = e.clientX - this.initialMouseX;
            const deltaY = e.clientY - this.initialMouseY;
            this.setPosition(this.initialOffsetX + deltaX, this.initialOffsetY + deltaY);
        }
        onMouseUp(e) {
            this.isDragging = false;
        }
    }
    Entities.PanelEntity = PanelEntity;
    /** Global manager referenced by PanelEntitys to manage connections between them. */
    class PanelEntityManager {
        panels;
        connections;
        currentConnection;
        constructor() {
            this.panels = [];
            this.connections = [];
            this.currentConnection = null;
            Globals.mainContainer.addEventListener("mousedown", (e) => this.onMainMouseDown(e));
        }
        registerPanel(panel) {
            panel.events.on("remove", this.onPanelRemoved.bind(this));
            panel.events.on("nodeClicked", (type, index) => {
                if (type === "input")
                    this.connectInputNode(panel, index);
                else
                    this.connectOutputNode(panel, index);
            });
        }
        connectInputNode(panel, nodeIndex) {
            if (this.currentConnection) {
                // Holding connection, remove if the connecting to self
                if (this.currentConnection.sourcePanel === panel || this.currentConnection.targetPanel != null) {
                    this.currentConnection.remove();
                    this.currentConnection = null;
                    return;
                }
                // Overwrite any existing connections
                const existingConnection = this.connections.find((c) => c.targetPanel === panel && c.targetNodeIndex === nodeIndex);
                if (existingConnection)
                    existingConnection.remove();
                // Connect the target node and finish if needed
                this.currentConnection.setTarget(panel, nodeIndex);
                if (this.currentConnection.isConnected) {
                    this.connections.push(this.currentConnection);
                    this.currentConnection = null;
                }
            }
            else {
                // Check if the node is already connected, and if so grab
                const existingConnection = this.connections.find((c) => c.targetPanel === panel && c.targetNodeIndex === nodeIndex);
                if (existingConnection) {
                    this.currentConnection = existingConnection;
                    this.currentConnection.unsetTarget();
                    return;
                }
                // Otherwise start a new connection if not holding one
                this.currentConnection = new PanelEntityConnection();
                this.currentConnection.setTarget(panel, nodeIndex);
            }
        }
        connectOutputNode(panel, nodeIndex) {
            if (this.currentConnection) {
                // Holding connection, remove if the connecting to self
                if (this.currentConnection.targetPanel === panel || this.currentConnection.sourcePanel != null) {
                    this.currentConnection.remove();
                    this.currentConnection = null;
                    return;
                }
                // Overwrite any existing connections
                const existingConnection = this.connections.find((c) => c.sourcePanel === panel && c.sourceNodeIndex === nodeIndex);
                if (existingConnection)
                    existingConnection.remove();
                // Connect the source node and finish if needed
                this.currentConnection.setSource(panel, nodeIndex);
                if (this.currentConnection.isConnected) {
                    this.connections.push(this.currentConnection);
                    this.currentConnection = null;
                }
            }
            else {
                // Check if the node is already connected, and if so grab
                const existingConnection = this.connections.find((c) => c.sourcePanel === panel && c.sourceNodeIndex === nodeIndex);
                if (existingConnection) {
                    this.currentConnection = existingConnection;
                    this.currentConnection.unsetSource();
                    return;
                }
                // Otherwise start a new connection if not holding one
                this.currentConnection = new PanelEntityConnection();
                this.currentConnection.setSource(panel, nodeIndex);
            }
        }
        removeConnection(connection) {
            this.connections = this.connections.filter((c) => c !== connection);
        }
        onPanelRemoved(panel) {
            this.panels = this.panels.filter((p) => p !== panel);
        }
        onMainMouseDown(e) {
            e.stopPropagation();
            if (this.currentConnection) {
                this.currentConnection.remove();
                this.currentConnection = null;
            }
        }
    }
    Entities.PanelEntityManager = PanelEntityManager;
    /** Visual and representation of a connection between two panels. */
    class PanelEntityConnection {
        element;
        isConnected;
        sourcePanel;
        targetPanel;
        sourceNodeIndex;
        targetNodeIndex;
        sourcePos;
        targetPos;
        mouseMoveListener;
        sourceMoveListener;
        targetMoveListener;
        sourceOutputUpdateListener;
        removeListener;
        constructor() {
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "path");
            Globals.svgContainer.appendChild(this.element);
            this.mouseMoveListener = this.onMouseMoved.bind(this);
            this.removeListener = this.remove.bind(this);
            document.addEventListener("mousemove", this.mouseMoveListener);
            this.isConnected = false;
        }
        setSource(panel, nodeIndex) {
            Util.assert(!this.isConnected, "Connection is already connected");
            this.sourcePanel = panel;
            this.sourceNodeIndex = nodeIndex;
            this.sourceMoveListener = () => {
                this.recalculateSourceNodePos();
                this.updateElement();
            };
            this.sourcePanel.events.on("move", this.sourceMoveListener);
            this.sourcePanel.events.on("remove", this.removeListener);
            if (this.targetPanel)
                this.establishConnection();
            this.recalculateSourceNodePos();
            if (!this.targetPanel)
                this.targetPos = this.sourcePos;
            this.updateElement();
        }
        setTarget(panel, nodeIndex) {
            Util.assert(!this.isConnected, "Connection is already connected");
            this.targetPanel = panel;
            this.targetNodeIndex = nodeIndex;
            this.targetMoveListener = () => {
                this.recalculateTargetNodePos();
                this.updateElement();
            };
            this.targetPanel.events.on("move", this.targetMoveListener);
            this.targetPanel.events.on("remove", this.removeListener);
            if (this.sourcePanel)
                this.establishConnection();
            this.recalculateTargetNodePos();
            if (!this.sourcePanel)
                this.sourcePos = this.targetPos;
            this.recalculateTargetNodePos();
            this.updateElement();
        }
        unsetSource() {
            Util.assert(this.isConnected, "Connection is not connected");
            this.isConnected = false;
            document.addEventListener("mousemove", this.mouseMoveListener);
            this.sourcePanel.events.remove("move", this.sourceMoveListener);
            this.sourcePanel.events.remove("remove", this.removeListener);
            this.sourcePanel.events.remove("outputUpdate", this.sourceOutputUpdateListener);
            this.sourcePanel = null;
            this.sourceNodeIndex = -1;
            this.updateElement();
        }
        unsetTarget() {
            Util.assert(this.isConnected, "Connection is not connected");
            this.isConnected = false;
            document.addEventListener("mousemove", this.mouseMoveListener);
            this.targetPanel.events.remove("move", this.targetMoveListener);
            this.targetPanel.events.remove("remove", this.removeListener);
            this.targetPanel = null;
            this.targetNodeIndex = -1;
            this.updateElement();
        }
        establishConnection() {
            this.isConnected = true;
            this.sourceOutputUpdateListener = (index) => {
                if (index === this.sourceNodeIndex)
                    this.propogate();
            };
            this.sourcePanel.events.on("outputUpdate", this.sourceOutputUpdateListener);
            this.propogate();
        }
        propogate() {
            if (!this.isConnected)
                return;
            const sourceValue = this.sourcePanel.getOutputNodeValue(this.sourceNodeIndex);
            this.targetPanel.setInputNodeValue(this.targetNodeIndex, sourceValue);
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
            if (this.isConnected)
                this.sourcePanel.events.remove("outputUpdate", this.sourceOutputUpdateListener);
            Globals.PanelEntityManager.removeConnection(this);
            this.element.remove();
        }
        recalculateSourceNodePos() {
            if (!this.sourcePanel)
                return;
            const sourcePos = this.sourcePanel.getNodeHTML("output", this.sourceNodeIndex).getBoundingClientRect();
            this.sourcePos = {
                x: sourcePos.left + sourcePos.width / 2,
                y: sourcePos.top + sourcePos.height / 2,
            };
        }
        recalculateTargetNodePos() {
            if (!this.targetPanel)
                return;
            const targetPos = this.targetPanel.getNodeHTML("input", this.targetNodeIndex).getBoundingClientRect();
            this.targetPos = {
                x: targetPos.left + targetPos.width / 2,
                y: targetPos.top + targetPos.height / 2,
            };
        }
        updateElement() {
            const dx = this.targetPos.x - this.sourcePos.x;
            const dy = this.targetPos.y - this.sourcePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Interpolate from 0 -> 60 with distance 40 -> 100
            const controlOffsetT = Math.min(1, Math.max(0, (dist - 30) / (120 - 30)));
            const controlOffset = Easing.easeOutQuad(controlOffsetT) * 60;
            const c1X = this.sourcePos.x + controlOffset;
            const c1Y = this.sourcePos.y;
            const c2X = this.targetPos.x - controlOffset;
            const c2Y = this.targetPos.y;
            const d = `M ${this.sourcePos.x} ${this.sourcePos.y} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${this.targetPos.x} ${this.targetPos.y}`;
            this.element.setAttribute("d", d);
            this.element.setAttribute("stroke", "#d7d7d7");
            this.element.setAttribute("stroke-width", "3");
            this.element.setAttribute("fill", "none");
        }
        onMouseMoved(e) {
            // Stop caring the mouse position if it's already connected
            if (this.isConnected)
                document.removeEventListener("mousemove", this.mouseMoveListener);
            const mousePos = { x: e.clientX, y: e.clientY };
            if (!this.sourcePanel)
                this.sourcePos = mousePos;
            else
                this.recalculateSourceNodePos();
            if (!this.targetPanel)
                this.targetPos = mousePos;
            else
                this.recalculateTargetNodePos();
            this.updateElement();
        }
    }
    Entities.PanelEntityConnection = PanelEntityConnection;
    /** Convert a message into a consistent visual element. */
    function createMessageElement(message) {
        const parent = Util.createHTMLElement(`<div class="message"></div>`);
        for (const letter of message.letters) {
            const el = Util.createHTMLElement(`<span>${letter}</span>`);
            parent.appendChild(el);
        }
        return parent;
    }
    Entities.createMessageElement = createMessageElement;
    /** PanelEntity content, displays messages. */
    class HardcodedEntity extends BaseEntity {
        panel;
        messages;
        constructor(messages) {
            super(`<div class="hardcoded-entity"></div>`);
            this.setMessages(messages);
        }
        setPanel(panel) {
            this.panel = panel;
            this.panel.setNodeCount(0, 1);
            this.panel.setNodeLabels(null, ["Messages"]);
        }
        setMessages(messages) {
            this.messages = messages;
            this.element.innerHTML = "";
            this.messages.forEach((message) => {
                this.element.appendChild(createMessageElement(message));
            });
        }
        setInputNodeValue(_index, _value) {
            Util.assert(false, "TextEntity does not have any inputs");
        }
        getOutputNodeValue(index) {
            Util.assert(index == 0, "TextEntity only has one output");
            return this.messages;
        }
    }
    Entities.HardcodedEntity = HardcodedEntity;
    /** PanelEntity content, previews messages. */
    class PreviewMessagesEntity extends BaseEntity {
        panel;
        messages;
        constructor() {
            super(`<div class="preview-messages-entity empty"></div>`);
        }
        setPanel(panel) {
            this.panel = panel;
            this.panel.setNodeCount(1, 1);
            this.panel.setNodeLabels(["Messages"], ["Passthrough"]);
        }
        setMessages(messages) {
            this.messages = messages;
            this.element.innerHTML = "";
            this.messages.forEach((message) => {
                this.element.appendChild(createMessageElement(message));
            });
            if (this.messages.length === 0)
                this.element.classList.add("empty");
            else
                this.element.classList.remove("empty");
        }
        setInputNodeValue(index, value) {
            Util.assert(index == 0, "TextEntity only has one input");
            this.setMessages(value);
            this.events.emit("outputUpdate", 0);
        }
        getOutputNodeValue(index) {
            Util.assert(index == 0, "TextEntity only has one output");
            return this.messages;
        }
    }
    Entities.PreviewMessagesEntity = PreviewMessagesEntity;
    /** PanelEntity content, splits messages into lines. */
    class SplitMessagesEntity extends BaseEntity {
        elementCount;
        panel;
        messages;
        constructor() {
            super(`<div class="split-messages-entity"><p>0</p></div>`);
            this.elementCount = this.element.querySelector("p");
        }
        setPanel(panel) {
            this.panel = panel;
            this.panel.setNodeCount(1, 0);
            this.panel.setNodeLabels(["Messages"], null);
        }
        setInputNodeValue(index, value) {
            Util.assert(index == 0, "SplitTextEntity only has one input");
            this.messages = value;
            this.panel.setNodeCount(1, this.messages.length);
            this.panel.setNodeLabels(["Messages"], this.messages.map((_, i) => `Message ${i}`));
            this.elementCount.innerText = this.messages.length.toString();
            for (let i = 0; i < this.messages.length; i++)
                this.events.emit("outputUpdate", i);
        }
        getOutputNodeValue(index) {
            Util.assert(index < this.messages.length, "Invalid output index");
            return [this.messages[index]];
        }
    }
    Entities.SplitMessagesEntity = SplitMessagesEntity;
})(Entities || (Entities = {}));
(function () {
    Globals.mainContainer = document.querySelector(".main-container");
    Globals.svgContainer = document.querySelector(".svg-container");
    Globals.logManager = new Entities.LogManager(document.querySelector(".logs-container"));
    Globals.PanelEntityManager = new Entities.PanelEntityManager();
    const p1 = new Entities.PanelEntity(new Entities.HardcodedEntity([Cipher.Message.parseFromString("Hello World")]), "Text");
    const p2 = new Entities.PanelEntity(new Entities.HardcodedEntity([
        Cipher.Message.parseFromString("0123232433422323"),
        Cipher.Message.parseFromString("45645632234456454"),
        Cipher.Message.parseFromString("13231212323232"),
    ]), "Text");
    const p3 = new Entities.PanelEntity(new Entities.PreviewMessagesEntity(), "Preview");
    const p4 = new Entities.PanelEntity(new Entities.SplitMessagesEntity(), "Split");
    const p5 = new Entities.PanelEntity(new Entities.HardcodedEntity([new Cipher.Message(["1", "23", "54", "4"])]), "Text");
    p1.setPosition(70, 50);
    p2.setPosition(40, 300);
    p5.setPosition(40, 550);
    p3.setPosition(550, 100);
    p4.setPosition(550, 300);
})();
