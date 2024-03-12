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
var main = document.querySelector(".main");
function createHTMLElement(elementString) {
    var div = document.createElement("div");
    div.innerHTML = elementString;
    return div.firstElementChild;
}
function assert(condition, message) {
    if (!condition)
        throw new Error(message);
}
var TextContent = /** @class */ (function () {
    function TextContent(text) {
        if (Array.isArray(text))
            this.text = text;
        else
            this.text = text.split("");
    }
    TextContent.prototype.toHTML = function () {
        return this.text.map(function (t) { return "<span>".concat(t, "</span>"); }).join("");
    };
    return TextContent;
}());
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
var LogManager = /** @class */ (function () {
    function LogManager() {
        LogManager.instance = this;
        this.element = main.querySelector(".log");
    }
    LogManager.prototype.log = function (message) {
        this.element.innerHTML += "<div class=\"log\">".concat(message, "</div>");
    };
    return LogManager;
}());
// ----------------------------------------------
var Entity = /** @class */ (function () {
    function Entity(elementString) {
        this.element = createHTMLElement(elementString);
        main.appendChild(this.element);
        this.events = new EventBus();
    }
    Entity.prototype.remove = function () {
        this.events.emit("remove");
        this.element.remove();
    };
    Entity.prototype.getPosition = function () {
        return this.position;
    };
    Entity.prototype.setPosition = function (x, y) {
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
        this.position = { x: x, y: y };
        this.events.emit("move", this.position);
    };
    Entity.prototype.getHTMLElement = function () {
        return this.element;
    };
    return Entity;
}());
var PanelEntity = /** @class */ (function (_super) {
    __extends(PanelEntity, _super);
    function PanelEntity(content, title) {
        if (title === void 0) { title = ""; }
        var _this = 
        // Setup HTML elements
        _super.call(this, "\n            <div class=\"panel-entity\">\n                <div class=\"panel-bar\">\n                    <div class=\"panel-bar-title\">Panel</div>\n                    <div class=\"panel-bar-close\">X</div>\n                </div>\n                <div class=\"panel-body\">\n                    <div class=\"panel-nodes input\"></div>\n                    <div class=\"panel-content\"></div>\n                    <div class=\"panel-nodes output\"></div>\n                </div>\n            </div>") || this;
        _this.nodeCounts = { input: 0, output: 0 };
        _this.elementBar = _this.element.querySelector(".panel-bar");
        _this.elementBarTitle = _this.element.querySelector(".panel-bar-title");
        _this.elementBarClose = _this.element.querySelector(".panel-bar-close");
        _this.elementContent = _this.element.querySelector(".panel-content");
        _this.elementNodesInput = _this.element.querySelector(".panel-nodes.input");
        _this.elementNodesOutput = _this.element.querySelector(".panel-nodes.output");
        // Update content
        _this.content = content;
        if (_this.content) {
            _this.elementContent.appendChild(_this.content.getHTMLElement());
            _this.content.setPanel(_this);
        }
        // Setup event listeners
        _this.elementBarClose.addEventListener("mousedown", function (e) {
            return _this.onCloseMouseDown(e);
        });
        _this.elementBar.addEventListener("mousedown", function (e) {
            return _this.onMouseDown(e);
        });
        document.addEventListener("mousemove", function (e) { return _this.onMouseMove(e); });
        document.addEventListener("mouseup", function (e) { return _this.onMouseUp(e); });
        // Setup state
        _this.isDragging = false;
        _this.initialMouseX = 0;
        _this.initialMouseY = 0;
        _this.initialOffsetX = 0;
        _this.initialOffsetY = 0;
        return _this;
    }
    PanelEntity.prototype.setTitle = function (title) {
        this.elementBarTitle.innerHTML = title;
    };
    PanelEntity.prototype.setNodeCount = function (type, count) {
        var _this = this;
        if (type === "input") {
            this.nodeCounts.input = count;
            this.elementNodesInput.innerHTML = "";
            var _loop_1 = function (i) {
                var el = createHTMLElement("<div class=\"panel-node\"></div>");
                el.addEventListener("mousedown", function (e) {
                    PanelConnectionManager.instance.onInputNodeMouseDown(e, _this, i);
                });
                this_1.elementNodesInput.appendChild(el);
            };
            var this_1 = this;
            for (var i = 0; i < count; i++) {
                _loop_1(i);
            }
        }
        else {
            this.nodeCounts.output = count;
            this.elementNodesOutput.innerHTML = "";
            var _loop_2 = function (i) {
                var el = createHTMLElement("<div class=\"panel-node\"></div>");
                el.addEventListener("mousedown", function (e) {
                    PanelConnectionManager.instance.onOutputNodeMouseDown(e, _this, i);
                });
                this_2.elementNodesOutput.appendChild(el);
            };
            var this_2 = this;
            for (var i = 0; i < count; i++) {
                _loop_2(i);
            }
        }
        this.events.emit("move", this.position);
    };
    PanelEntity.prototype.getNodeHTML = function (type, index) {
        if (type === "input") {
            return this.elementNodesInput.querySelectorAll(".panel-node")[index];
        }
        else {
            return this.elementNodesOutput.querySelectorAll(".panel-node")[index];
        }
    };
    PanelEntity.prototype.setInputNodeValue = function (index, value) {
        assert(this.content !== null, "Panel does not have any content");
        this.content.setInputNodeValue(index, value);
    };
    PanelEntity.prototype.getOutputNodeValue = function (index) {
        assert(this.content !== null, "Panel does not have any content");
        return this.content.getOutputNodeValue(index);
    };
    PanelEntity.prototype.getContent = function () {
        return this.content;
    };
    PanelEntity.prototype.onCloseMouseDown = function (e) {
        this.remove();
    };
    PanelEntity.prototype.onMouseDown = function (e) {
        this.isDragging = true;
        this.initialMouseX = e.clientX;
        this.initialMouseY = e.clientY;
        this.initialOffsetX = this.element.offsetLeft;
        this.initialOffsetY = this.element.offsetTop;
    };
    PanelEntity.prototype.onMouseMove = function (e) {
        if (!this.isDragging)
            return;
        var deltaX = e.clientX - this.initialMouseX;
        var deltaY = e.clientY - this.initialMouseY;
        this.setPosition(this.initialOffsetX + deltaX, this.initialOffsetY + deltaY);
    };
    PanelEntity.prototype.onMouseUp = function (e) {
        this.isDragging = false;
    };
    return PanelEntity;
}(Entity));
var PanelConnection = /** @class */ (function (_super) {
    __extends(PanelConnection, _super);
    function PanelConnection() {
        var _this = 
        // Setup HTML elements
        _super.call(this, "<div class=\"panel-connection\"></div>") || this;
        // Setup state
        _this.isConnected = false;
        // Setup event listeners
        _this.mouseMoveListener = function (e) { return _this.onMouseMoved(e); };
        document.addEventListener("mousemove", _this.mouseMoveListener);
        _this.removeListener = function () { return _this.remove(); };
        return _this;
    }
    PanelConnection.prototype.remove = function () {
        if (this.sourcePanel) {
            this.sourcePanel.events.remove("move", this.sourceMoveListener);
        }
        if (this.targetPanel) {
            this.targetPanel.events.remove("move", this.targetMoveListener);
        }
        document.removeEventListener("mousemove", this.mouseMoveListener);
        if (this.isConnected) {
            this.sourcePanel.events.remove("outputUpdate", this.sourceOutputUpdateListener);
        }
        PanelConnectionManager.instance.removeConnection(this);
        this.element.remove();
    };
    PanelConnection.prototype.onMouseMoved = function (e) {
        if (!this.isConnected) {
            // Update the source / target position if not connected
            var mousePos = { x: e.clientX, y: e.clientY };
            if (!this.sourcePanel)
                this.sourcePos = mousePos;
            else
                this.calculateSourcePos();
            if (!this.targetPanel)
                this.targetPos = mousePos;
            else
                this.calculateTargetPos();
            this.updateElement();
        }
        else {
            // Dont care about the mouse position if it's already connected
            document.removeEventListener("mousemove", this.mouseMoveListener);
        }
    };
    PanelConnection.prototype.setSource = function (panel, nodeIndex) {
        var _this = this;
        assert(!this.isConnected, "Connection is already connected");
        // Setup source panel and node
        this.sourcePanel = panel;
        this.sourceNodeIndex = nodeIndex;
        this.sourceHTML = this.sourcePanel.getNodeHTML("output", nodeIndex);
        // Setup event listeners
        this.sourceMoveListener = function () {
            _this.calculateSourcePos();
            _this.updateElement();
        };
        this.sourcePanel.events.on("move", this.sourceMoveListener);
        this.sourcePanel.events.on("remove", this.removeListener);
        // Calculate source position and check connection
        this.calculateSourcePos();
        if (!this.targetPanel)
            this.targetPos = this.sourcePos;
        else
            this.establishConnection();
        // Update element
        this.updateElement();
    };
    PanelConnection.prototype.setTarget = function (panel, nodeIndex) {
        var _this = this;
        assert(!this.isConnected, "Connection is already connected");
        // Setup target panel and node
        this.targetPanel = panel;
        this.targetNodeIndex = nodeIndex;
        this.targetHTML = this.targetPanel.getNodeHTML("input", nodeIndex);
        // Setup event listeners
        this.targetMoveListener = function () {
            _this.calculateTargetPos();
            _this.updateElement();
        };
        this.targetPanel.events.on("move", this.targetMoveListener);
        this.targetPanel.events.on("remove", this.removeListener);
        // Calculate target position and check connection
        this.calculateTargetPos();
        if (!this.sourcePanel)
            this.sourcePos = this.targetPos;
        else
            this.establishConnection();
        // Update element
        this.updateElement();
    };
    PanelConnection.prototype.establishConnection = function () {
        var _this = this;
        this.isConnected = true;
        // Listen on source node changes
        this.sourceOutputUpdateListener = function (index) {
            if (index === _this.sourceNodeIndex)
                _this.propogate();
        };
        this.sourcePanel.events.on("outputUpdate", this.sourceOutputUpdateListener);
        // Propogate the source value to the target
        this.propogate();
    };
    PanelConnection.prototype.propogate = function () {
        if (!this.isConnected)
            return;
        // Propogate the source value to the target
        var sourceValue = this.sourcePanel.getOutputNodeValue(this.sourceNodeIndex);
        this.targetPanel.setInputNodeValue(this.targetNodeIndex, sourceValue);
    };
    PanelConnection.prototype.calculateSourcePos = function () {
        if (!this.sourcePanel)
            return;
        // Get the center of the source node
        var sourcePos = this.sourceHTML.getBoundingClientRect();
        this.sourcePos = {
            x: sourcePos.left + sourcePos.width / 2,
            y: sourcePos.top + sourcePos.height / 2,
        };
    };
    PanelConnection.prototype.calculateTargetPos = function () {
        if (!this.targetPanel)
            return;
        // Get the center of the target node
        var targetPos = this.targetHTML.getBoundingClientRect();
        this.targetPos = {
            x: targetPos.left + targetPos.width / 2,
            y: targetPos.top + targetPos.height / 2,
        };
    };
    PanelConnection.prototype.updateElement = function () {
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
    return PanelConnection;
}(Entity));
var PanelConnectionManager = /** @class */ (function () {
    function PanelConnectionManager() {
        var _this = this;
        PanelConnectionManager.instance = this;
        this.currentConnection = null;
        this.connections = [];
        main.addEventListener("mousedown", function (e) { return _this.onMainMouseDown(e); });
    }
    PanelConnectionManager.prototype.removeConnection = function (connection) {
        this.connections = this.connections.filter(function (c) { return c !== connection; });
    };
    PanelConnectionManager.prototype.onInputNodeMouseDown = function (e, panel, nodeIndex) {
        e.stopPropagation();
        if (this.currentConnection) {
            if (this.currentConnection.sourcePanel === panel ||
                this.currentConnection.targetPanel != null) {
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
            this.currentConnection = new PanelConnection();
            this.currentConnection.setTarget(panel, nodeIndex);
        }
    };
    PanelConnectionManager.prototype.onOutputNodeMouseDown = function (e, panel, nodeIndex) {
        e.stopPropagation();
        if (this.currentConnection) {
            if (this.currentConnection.targetPanel === panel ||
                this.currentConnection.sourcePanel != null) {
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
            this.currentConnection = new PanelConnection();
            this.currentConnection.setSource(panel, nodeIndex);
        }
    };
    PanelConnectionManager.prototype.onMainMouseDown = function (e) {
        if (this.currentConnection) {
            this.currentConnection.remove();
            this.currentConnection = null;
        }
    };
    return PanelConnectionManager;
}());
var TextEntity = /** @class */ (function (_super) {
    __extends(TextEntity, _super);
    function TextEntity(contentList) {
        var _this = 
        // Setup HTML elements
        _super.call(this, "<div class=\"text-entity\"></div>") || this;
        // Update content with passed content
        _this.setContentList(contentList);
        return _this;
    }
    TextEntity.prototype.setPanel = function (panel) {
        this.panel = panel;
        this.panel.setTitle("Text");
        this.panel.setNodeCount("input", 0);
        this.panel.setNodeCount("output", 1);
    };
    TextEntity.prototype.setContentList = function (contentList) {
        var _this = this;
        // Update content
        this.contentList = contentList;
        // Add each line to the element
        this.element.innerHTML = "";
        this.contentList.forEach(function (content) {
            _this.element.appendChild(createHTMLElement("<div class=\"text-content\">".concat(content.toHTML(), "</div>")));
        });
    };
    TextEntity.prototype.setInputNodeValue = function (index, value) {
        assert(false, "TextEntity does not have any inputs");
    };
    TextEntity.prototype.getOutputNodeValue = function (index) {
        assert(index == 0, "TextEntity only has one output");
        return this.contentList;
    };
    return TextEntity;
}(Entity));
var SplitTextEntity = /** @class */ (function (_super) {
    __extends(SplitTextEntity, _super);
    function SplitTextEntity() {
        // Setup HTML elements
        return _super.call(this, "<div class=\"split-text-entity\"></div>") || this;
    }
    SplitTextEntity.prototype.setPanel = function (panel) {
        this.panel = panel;
        this.panel.setTitle("Split");
        this.panel.setNodeCount("input", 1);
        this.panel.setNodeCount("output", 0);
    };
    SplitTextEntity.prototype.setContentList = function (contentList) {
        var _this = this;
        // Update content
        this.contentList = contentList;
        // Add each line to the element
        this.element.innerHTML = "";
        this.contentList.forEach(function (content) {
            _this.element.appendChild(createHTMLElement("<div class=\"text-content\">".concat(content.toHTML(), "</div>")));
        });
    };
    SplitTextEntity.prototype.setInputNodeValue = function (index, value) {
        assert(index == 0, "SplitTextEntity only has one input");
        this.setContentList(value);
        this.panel.setNodeCount("output", this.contentList.length);
        this.events.emit("outputUpdate", 0);
    };
    SplitTextEntity.prototype.getOutputNodeValue = function (index) {
        assert(index < this.contentList.length, "Invalid output index");
        return [this.contentList[index]];
    };
    return SplitTextEntity;
}(Entity));
// ----------------------------------------------
new PanelConnectionManager();
new LogManager();
var p1 = new PanelEntity(new TextEntity([new TextContent("Hello World")]));
var p2 = new PanelEntity(new TextEntity([
    new TextContent("01232324334252323"),
    new TextContent("45645632234456454"),
    new TextContent("13231212323232"),
]));
var p3 = new PanelEntity(new SplitTextEntity());
p1.setPosition(50, 50);
p2.setPosition(70, 300);
p3.setPosition(350, 300);
