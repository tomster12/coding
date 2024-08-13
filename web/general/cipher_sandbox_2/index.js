var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Globals;
(function (Globals) {
})(Globals || (Globals = {}));
var Util;
(function (Util) {
    /** Create an HTML element from a string using innerHTML of a div.*/
    function createHTMLElement(elementString) {
        var div = document.createElement("div");
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
    var EventBus = /** @class */ (function () {
        function EventBus() {
            this.events = {};
        }
        EventBus.prototype.on = function (event, callback) {
            if (!this.events[event])
                this.events[event] = [];
            this.events[event].push(callback);
        };
        EventBus.prototype.remove = function (event, callback) {
            if (!this.events[event])
                return;
            this.events[event] = this.events[event].filter(function (cb) { return cb !== callback; });
        };
        EventBus.prototype.emit = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (!this.events[event])
                return;
            this.events[event].forEach(function (callback) { return callback.apply(void 0, args); });
        };
        return EventBus;
    }());
    Util.EventBus = EventBus;
})(Util || (Util = {}));
var Cipher;
(function (Cipher) {
    /** Generic message class used by cryptography. */
    var Message = /** @class */ (function () {
        function Message(text) {
            this.text = text;
        }
        Message.prototype.toHTML = function () {
            return "<span>".concat(this.text, "</span>");
        };
        return Message;
    }());
    Cipher.Message = Message;
})(Cipher || (Cipher = {}));
var Entities;
(function (Entities) {
    /** References a global log element and provides a way to log messages to it. */
    var LogManager = /** @class */ (function () {
        function LogManager(logParent) {
            this.logs = [];
            this.logParent = logParent;
            this.logContainer = logParent.querySelector(".logs-container");
        }
        LogManager.prototype.log = function (message) {
            var timestamp = new Date().toLocaleTimeString();
            this.logs.push({ timestamp: timestamp, message: message });
            this.logContainer.innerHTML += "<div class=\"log\">".concat(timestamp, ": ").concat(message, "</div>");
        };
        return LogManager;
    }());
    Entities.LogManager = LogManager;
    /** A proxy to a HTML element which can be moved around and removed. */
    var PageEntity = /** @class */ (function () {
        function PageEntity(elementString) {
            this.element = Util.createHTMLElement(elementString);
            this.events = new Util.EventBus();
            this.position = { x: 0, y: 0 };
            this.setParent(Globals.main);
        }
        PageEntity.prototype.remove = function () {
            this.events.emit("remove");
            this.element.remove();
        };
        PageEntity.prototype.getPosition = function () {
            return this.position;
        };
        PageEntity.prototype.setPosition = function (x, y) {
            this.element.style.left = x + "px";
            this.element.style.top = y + "px";
            this.position = { x: x, y: y };
            this.events.emit("move", this.position);
        };
        PageEntity.prototype.setParent = function (parent) {
            parent.appendChild(this.element);
        };
        PageEntity.prototype.getHTMLElement = function () {
            return this.element;
        };
        return PageEntity;
    }());
    Entities.PageEntity = PageEntity;
    /** Panel which can contain content and have input / output nodes. */
    var PagePanel = /** @class */ (function (_super) {
        __extends(PagePanel, _super);
        function PagePanel(content, title) {
            if (title === void 0) { title = ""; }
            var _this = _super.call(this, "\n                <div class=\"panel-entity\">\n                    <div class=\"panel-bar\">\n                        <div class=\"panel-bar-title\">Panel</div>\n                        <div class=\"panel-bar-close\">X</div>\n                    </div>\n                    <div class=\"panel-body\">\n                        <div class=\"panel-nodes input\"></div>\n                        <div class=\"panel-content\"></div>\n                        <div class=\"panel-nodes output\"></div>\n                    </div>\n                </div>") || this;
            _this.nodeCounts = { input: 0, output: 0 };
            _this.elementBar = _this.element.querySelector(".panel-bar");
            _this.elementBarTitle = _this.element.querySelector(".panel-bar-title");
            _this.elementBarClose = _this.element.querySelector(".panel-bar-close");
            _this.elementContent = _this.element.querySelector(".panel-content");
            _this.elementNodesInput = _this.element.querySelector(".panel-nodes.input");
            _this.elementNodesOutput = _this.element.querySelector(".panel-nodes.output");
            _this.elementBarClose.addEventListener("mousedown", function (e) { return _this.onCloseMouseDown(e); });
            _this.elementBar.addEventListener("mousedown", function (e) { return _this.onBarMouseDown(e); });
            document.addEventListener("mousemove", function (e) { return _this.onMouseMove(e); });
            document.addEventListener("mouseup", function (e) { return _this.onMouseUp(e); });
            _this.isDragging = false;
            _this.initialMouseX = 0;
            _this.initialMouseY = 0;
            _this.initialOffsetX = 0;
            _this.initialOffsetY = 0;
            _this.content = content;
            _this.elementContent.appendChild(_this.content.getHTMLElement());
            _this.content.setPanel(_this);
            _this.content.events.on("outputUpdate", function (index) { return _this.events.emit("outputUpdate", index); });
            Globals.pagePanelManager.registerPanel(_this);
            return _this;
        }
        PagePanel.prototype.setNodeCount = function (inputCount, outputCount) {
            var _this = this;
            if (inputCount != this.nodeCounts.input) {
                this.elementNodesInput.innerHTML = "";
                var _loop_1 = function (i) {
                    var el = Util.createHTMLElement("<div class=\"panel-node\"></div>");
                    el.addEventListener("mousedown", function (e) {
                        e.stopPropagation();
                        _this.events.emit("nodeClicked", "input", i);
                    });
                    this_1.elementNodesInput.appendChild(el);
                };
                var this_1 = this;
                for (var i = 0; i < inputCount; i++) {
                    _loop_1(i);
                }
            }
            if (outputCount != this.nodeCounts.output) {
                this.elementNodesOutput.innerHTML = "";
                var _loop_2 = function (i) {
                    var el = Util.createHTMLElement("<div class=\"panel-node\"></div>");
                    el.addEventListener("mousedown", function (e) {
                        e.stopPropagation();
                        _this.events.emit("nodeClicked", "output", i);
                    });
                    this_2.elementNodesOutput.appendChild(el);
                };
                var this_2 = this;
                for (var i = 0; i < outputCount; i++) {
                    _loop_2(i);
                }
            }
            this.nodeCounts.input = inputCount;
            this.nodeCounts.output = outputCount;
            this.events.emit("move", this.position);
        };
        PagePanel.prototype.getNodeHTML = function (type, index) {
            if (type === "input") {
                return this.elementNodesInput.querySelectorAll(".panel-node")[index];
            }
            else {
                return this.elementNodesOutput.querySelectorAll(".panel-node")[index];
            }
        };
        PagePanel.prototype.setInputNodeValue = function (index, value) {
            Util.assert(this.content !== null, "Panel does not have any content");
            this.content.setInputNodeValue(index, value);
        };
        PagePanel.prototype.getOutputNodeValue = function (index) {
            Util.assert(this.content !== null, "Panel does not have any content");
            return this.content.getOutputNodeValue(index);
        };
        PagePanel.prototype.onCloseMouseDown = function (e) {
            this.remove();
        };
        PagePanel.prototype.onBarMouseDown = function (e) {
            this.isDragging = true;
            this.initialMouseX = e.clientX;
            this.initialMouseY = e.clientY;
            this.initialOffsetX = this.element.offsetLeft;
            this.initialOffsetY = this.element.offsetTop;
        };
        PagePanel.prototype.onMouseMove = function (e) {
            if (!this.isDragging)
                return;
            var deltaX = e.clientX - this.initialMouseX;
            var deltaY = e.clientY - this.initialMouseY;
            this.setPosition(this.initialOffsetX + deltaX, this.initialOffsetY + deltaY);
        };
        PagePanel.prototype.onMouseUp = function (e) {
            this.isDragging = false;
        };
        return PagePanel;
    }(PageEntity));
    Entities.PagePanel = PagePanel;
    /** Global manager referenced by PagePanels to manage connections between them. */
    var PagePanelManager = /** @class */ (function () {
        function PagePanelManager() {
            var _this = this;
            this.panels = [];
            this.connections = [];
            this.currentConnection = null;
            Globals.main.addEventListener("mousedown", function (e) { return _this.onMainMouseDown(e); });
        }
        PagePanelManager.prototype.registerPanel = function (panel) {
            var _this = this;
            panel.events.on("remove", this.onPanelRemoved.bind(this));
            panel.events.on("nodeClicked", function (type, index) {
                if (type === "input")
                    _this.connectInputNode(panel, index);
                else
                    _this.connectOutputNode(panel, index);
            });
        };
        PagePanelManager.prototype.connectInputNode = function (panel, nodeIndex) {
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
            }
            else {
                this.currentConnection = new PagePanelConnection();
                this.currentConnection.setTarget(panel, nodeIndex);
            }
        };
        PagePanelManager.prototype.connectOutputNode = function (panel, nodeIndex) {
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
            }
            else {
                this.currentConnection = new PagePanelConnection();
                this.currentConnection.setSource(panel, nodeIndex);
            }
        };
        PagePanelManager.prototype.removeConnection = function (connection) {
            this.connections = this.connections.filter(function (c) { return c !== connection; });
        };
        PagePanelManager.prototype.onPanelRemoved = function (panel) {
            this.panels = this.panels.filter(function (p) { return p !== panel; });
        };
        PagePanelManager.prototype.onMainMouseDown = function (e) {
            e.stopPropagation();
            if (this.currentConnection) {
                this.currentConnection.remove();
                this.currentConnection = null;
            }
        };
        return PagePanelManager;
    }());
    Entities.PagePanelManager = PagePanelManager;
    /** Visual and representation of a connection between two panels. */
    var PagePanelConnection = /** @class */ (function (_super) {
        __extends(PagePanelConnection, _super);
        function PagePanelConnection() {
            var _this = _super.call(this, "<div class=\"panel-connection\"></div>") || this;
            _this.mouseMoveListener = _this.onMouseMoved.bind(_this);
            _this.removeListener = _this.remove.bind(_this);
            document.addEventListener("mousemove", _this.mouseMoveListener);
            _this.isConnected = false;
            return _this;
        }
        PagePanelConnection.prototype.setSource = function (panel, nodeIndex) {
            var _this = this;
            Util.assert(!this.isConnected, "Connection is already connected");
            this.sourcePanel = panel;
            this.sourceNodeIndex = nodeIndex;
            this.sourceMoveListener = function () {
                _this.recalculateSourceNodePos();
                _this.updateElement();
            };
            this.sourcePanel.events.on("move", this.sourceMoveListener);
            this.sourcePanel.events.on("remove", this.removeListener);
            this.recalculateSourceNodePos();
            if (!this.targetPanel)
                this.targetPos = this.sourcePos;
            this.updateElement();
            if (this.targetPanel)
                this.establishConnection();
        };
        PagePanelConnection.prototype.setTarget = function (panel, nodeIndex) {
            var _this = this;
            Util.assert(!this.isConnected, "Connection is already connected");
            this.targetPanel = panel;
            this.targetNodeIndex = nodeIndex;
            this.targetMoveListener = function () {
                _this.recalculateTargetNodePos();
                _this.updateElement();
            };
            this.targetPanel.events.on("move", this.targetMoveListener);
            this.targetPanel.events.on("remove", this.removeListener);
            this.recalculateTargetNodePos();
            if (!this.sourcePanel)
                this.sourcePos = this.targetPos;
            this.updateElement();
            if (this.sourcePanel)
                this.establishConnection();
        };
        PagePanelConnection.prototype.establishConnection = function () {
            var _this = this;
            this.isConnected = true;
            this.sourceOutputUpdateListener = function (index) {
                if (index === _this.sourceNodeIndex)
                    _this.propogate();
            };
            this.sourcePanel.events.on("outputUpdate", this.sourceOutputUpdateListener);
            this.propogate();
        };
        PagePanelConnection.prototype.propogate = function () {
            if (!this.isConnected)
                return;
            var sourceValue = this.sourcePanel.getOutputNodeValue(this.sourceNodeIndex);
            this.targetPanel.setInputNodeValue(this.targetNodeIndex, sourceValue);
        };
        PagePanelConnection.prototype.recalculateSourceNodePos = function () {
            if (!this.sourcePanel)
                return;
            var sourcePos = this.sourcePanel.getNodeHTML("output", this.sourceNodeIndex).getBoundingClientRect();
            this.sourcePos = {
                x: sourcePos.left + sourcePos.width / 2,
                y: sourcePos.top + sourcePos.height / 2,
            };
        };
        PagePanelConnection.prototype.recalculateTargetNodePos = function () {
            if (!this.targetPanel)
                return;
            var targetPos = this.targetPanel.getNodeHTML("input", this.targetNodeIndex).getBoundingClientRect();
            this.targetPos = {
                x: targetPos.left + targetPos.width / 2,
                y: targetPos.top + targetPos.height / 2,
            };
        };
        PagePanelConnection.prototype.updateElement = function () {
            var dx = this.targetPos.x - this.sourcePos.x;
            var dy = this.targetPos.y - this.sourcePos.y;
            var dst = Math.sqrt(dx * dx + dy * dy);
            var angle = Math.atan2(this.targetPos.y - this.sourcePos.y, this.targetPos.x - this.sourcePos.x);
            // Make the element a line between the source and target
            this.element.style.left = this.sourcePos.x + "px";
            this.element.style.top = "calc(".concat(this.sourcePos.y, "px - 0.1rem)");
            this.element.style.width = dst + "px";
            this.element.style.transform = "rotate(".concat(angle, "rad)");
        };
        PagePanelConnection.prototype.remove = function () {
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
            Globals.pagePanelManager.removeConnection(this);
            this.element.remove();
        };
        PagePanelConnection.prototype.onMouseMoved = function (e) {
            // Stop caring the mouse position if it's already connected
            if (this.isConnected)
                document.removeEventListener("mousemove", this.mouseMoveListener);
            var mousePos = { x: e.clientX, y: e.clientY };
            if (!this.sourcePanel)
                this.sourcePos = mousePos;
            else
                this.recalculateSourceNodePos();
            if (!this.targetPanel)
                this.targetPos = mousePos;
            else
                this.recalculateTargetNodePos();
            this.updateElement();
        };
        return PagePanelConnection;
    }(PageEntity));
    Entities.PagePanelConnection = PagePanelConnection;
    /** PagePanel content, displays messages. */
    var TextEntity = /** @class */ (function (_super) {
        __extends(TextEntity, _super);
        function TextEntity(messages) {
            var _this = _super.call(this, "<div class=\"text-entity\"></div>") || this;
            _this.setMessages(messages);
            return _this;
        }
        TextEntity.prototype.setPanel = function (panel) {
            this.panel = panel;
            this.panel.setNodeCount(0, 1);
        };
        TextEntity.prototype.setMessages = function (messages) {
            var _this = this;
            this.messages = messages;
            this.element.innerHTML = "";
            this.messages.forEach(function (content) {
                _this.element.appendChild(Util.createHTMLElement("<div class=\"text-content\">".concat(content.toHTML(), "</div>")));
            });
        };
        TextEntity.prototype.setInputNodeValue = function (_index, _value) {
            Util.assert(false, "TextEntity does not have any inputs");
        };
        TextEntity.prototype.getOutputNodeValue = function (index) {
            Util.assert(index == 0, "TextEntity only has one output");
            return this.messages;
        };
        return TextEntity;
    }(PageEntity));
    Entities.TextEntity = TextEntity;
    /** PagePanel content, splits messages into lines. */
    var SplitTextEntity = /** @class */ (function (_super) {
        __extends(SplitTextEntity, _super);
        function SplitTextEntity() {
            return _super.call(this, "<div class=\"split-text-entity\"></div>") || this;
        }
        SplitTextEntity.prototype.setPanel = function (panel) {
            this.panel = panel;
            this.panel.setNodeCount(1, 0);
        };
        SplitTextEntity.prototype.setContentList = function (contentList) {
            var _this = this;
            this.contentList = contentList;
            this.element.innerHTML = "";
            this.contentList.forEach(function (content) {
                _this.element.appendChild(Util.createHTMLElement("<div class=\"text-content\">".concat(content.toHTML(), "</div>")));
            });
        };
        SplitTextEntity.prototype.setInputNodeValue = function (index, value) {
            Util.assert(index == 0, "SplitTextEntity only has one input");
            this.setContentList(value);
            this.panel.setNodeCount(1, this.contentList.length);
            this.events.emit("outputUpdate", 0);
        };
        SplitTextEntity.prototype.getOutputNodeValue = function (index) {
            Util.assert(index < this.contentList.length, "Invalid output index");
            return [this.contentList[index]];
        };
        return SplitTextEntity;
    }(PageEntity));
    Entities.SplitTextEntity = SplitTextEntity;
})(Entities || (Entities = {}));
(function () {
    Globals.main = document.querySelector(".main");
    Globals.logManager = new Entities.LogManager(document.querySelector(".logs"));
    Globals.pagePanelManager = new Entities.PagePanelManager();
    var p1 = new Entities.PagePanel(new Entities.TextEntity([new Cipher.Message("Hello World")]), "Text Panel");
    var p2 = new Entities.PagePanel(new Entities.TextEntity([new Cipher.Message("01232324334252323"), new Cipher.Message("45645632234456454"), new Cipher.Message("13231212323232")]), "Text Panel 2");
    var p3 = new Entities.PagePanel(new Entities.SplitTextEntity(), "Split Panel");
    p1.setPosition(50, 50);
    p2.setPosition(70, 300);
    p3.setPosition(350, 300);
})();
