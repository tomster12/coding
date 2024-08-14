var Globals;
(function (Globals) {
})(Globals || (Globals = {}));
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
            this.logContainer = logParent.querySelector(".logs-container");
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
            this.setParent(Globals.main);
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
        getNodeHTML(type, index) {
            if (type === "input") {
                return this.elementNodesInput.querySelectorAll(".panel-node")[index];
            }
            else {
                return this.elementNodesOutput.querySelectorAll(".panel-node")[index];
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
            Globals.main.addEventListener("mousedown", (e) => this.onMainMouseDown(e));
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
    class PanelEntityConnection extends BaseEntity {
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
            super(`<div class="panel-entity-connection"></div>`);
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
            this.recalculateSourceNodePos();
            if (!this.targetPanel)
                this.targetPos = this.sourcePos;
            this.updateElement();
            if (this.targetPanel)
                this.establishConnection();
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
            this.recalculateTargetNodePos();
            if (!this.sourcePanel)
                this.sourcePos = this.targetPos;
            this.updateElement();
            if (this.sourcePanel)
                this.establishConnection();
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
            const dst = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(this.targetPos.y - this.sourcePos.y, this.targetPos.x - this.sourcePos.x);
            // Make the element a line between the source and target
            this.element.style.left = this.sourcePos.x + "px";
            this.element.style.top = `calc(${this.sourcePos.y}px - 0.1rem)`;
            this.element.style.width = dst + "px";
            this.element.style.transform = `rotate(${angle}rad)`;
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
        panel;
        messages;
        constructor() {
            super(`<div class="split-messages-entity"></div>`);
        }
        setPanel(panel) {
            this.panel = panel;
            this.panel.setNodeCount(1, 0);
        }
        setInputNodeValue(index, value) {
            Util.assert(index == 0, "SplitTextEntity only has one input");
            this.messages = value;
            this.panel.setNodeCount(1, this.messages.length);
            this.element.appendChild(Util.createHTMLElement(`<p>${this.messages.length}</p>`));
            for (let i = 0; i < this.messages.length; i++) {
                this.events.emit("outputUpdate", i);
            }
        }
        getOutputNodeValue(index) {
            Util.assert(index < this.messages.length, "Invalid output index");
            return [this.messages[index]];
        }
    }
    Entities.SplitMessagesEntity = SplitMessagesEntity;
})(Entities || (Entities = {}));
(function () {
    Globals.main = document.querySelector(".main");
    Globals.logManager = new Entities.LogManager(document.querySelector(".logs"));
    Globals.PanelEntityManager = new Entities.PanelEntityManager();
    const p1 = new Entities.PanelEntity(new Entities.HardcodedEntity([Cipher.Message.parseFromString("Hello World")]), "Text");
    const p2 = new Entities.PanelEntity(new Entities.HardcodedEntity([
        Cipher.Message.parseFromString("0123232433422323"),
        Cipher.Message.parseFromString("45645632234456454"),
        Cipher.Message.parseFromString("13231212323232"),
    ]), "Text");
    const p3 = new Entities.PanelEntity(new Entities.PreviewMessagesEntity(), "Preview");
    const p4 = new Entities.PanelEntity(new Entities.SplitMessagesEntity(), "Split");
    p1.setPosition(70, 50);
    p2.setPosition(40, 300);
    p3.setPosition(550, 100);
    p4.setPosition(550, 300);
})();
