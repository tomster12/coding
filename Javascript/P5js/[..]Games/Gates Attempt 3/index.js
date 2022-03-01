
// - Maybe change gates and connections to use ID's

// - Update input / output nodes to be changeable in size
//   and add some sort of gate / system to compile connected
//   inputs / outputs

// - Add renamable io on hover and also change hover labels
//   to be seperate so you can turn them all on


// #region - Global

// #region - Setup

// Declare variables
let CFG;
let gatePresets;
let output;
let input;
let mainSim;
let focusedSim;
let uiCanvas;


function setup() {
  // P5 setup
  createCanvas(1000, 720);
  textAlign(CENTER);

  // Other setup
  document.oncontextmenu = (e) => false;
  initVariables();
}


function initVariables() {
  // Initialize variables
  CFG = {
    COL_BACKGROUND: "#242636",
    COL_BUTTON: "#ffffff",
    COL_BUTTON_HOVERED: "#d5d5d5",
    COL_TEXT: "#000000",
    COL_NODE_OFF: "#de3737",
    COL_NODE_ON: "#3bdb5e",

    TXT_SZ_GATESELECT: 0.5,
    TXT_SZ_GATE: 0.2,
    TXT_SZ: 0.2,

    STRK_WGT_GATE_BODY: 0.095,
    STRK_WGT_GATE_BODY_HOVERED: 0.12,
    STRK_WGT_GATE_SELECTION: 0.04,
    STRK_WGT_GATE_LOCK: 0.04,
    STRK_WGT_CONNECTION: 0.1,

    STRK_WGT_NODE_HOVER: 0.095,
    STRK_WGT_NODE: 0.075,

    GATE_BDR_SELECT: 0.12,
    GATE_BDR_BODY: 0.45,
    GATE_BDR_LOCKED: 0.22,

    GATE_CFG_BTN_SIZE: 0.15,

    NODE_SIZE: 0.2,
    NODE_SIZE_HOVER: 0.23,
  };
  gatePresets = {
    "IN": {
      "name": "IN",
      "inputs": [],
      "outputs": ["input"],
      calc: null },
    "OUT": {
      "name": "OUT",
      "inputs": ["output"],
      "outputs": [],
      calc: null },
    "AND": {
      "name": "AND",
      "inputs": ["in 1", "in 2"],
      "outputs": ["out 1"],
      calc: (inputs) => [inputs[0] & inputs[1]] },
    "OR": {
      "name": "OR",
      "inputs": ["in 1", "in 2"],
      "outputs": ["out 1"],
      calc: (inputs) => [inputs[0] | inputs[1]] },
    "NOT": {
      "name": "NOT",
      "inputs": ["in 1"],
      "outputs": ["out 1"],
      calc: (inputs) => [!inputs[0]] },
    "NAND": {
      "name": "NAND",
      "inputs": ["in 1", "in 2"],
      "outputs": ["out 1"],
      calc: (inputs) => [!(inputs[0] & inputs[1])] },
    "NOR": {
      "name": "NOR",
      "inputs": ["in 1", "in 2"],
      "outputs": ["out 1"],
      calc: (inputs) => [!(inputs[0] | inputs[1])] },
    "XOR": {
      "name": "XOR",
      "inputs": ["in 1", "in 2"],
      "outputs": ["out 1"],
      calc: (inputs) => [inputs[0] ^ inputs[1]]
    }};
  output = createGraphics(width, height);
  input = new Input();
  mainSim = new Simulation({ x: 0, y: 0 }, { x: width, y: height });
  focusedSim = mainSim;
  uiCanvas = new UICanvas();

  // Populate objects
  uiCanvas.objects.push(new UIGateSelect(uiCanvas,
    { x: width * 0.5, y: height - (40 + 5) }, { x: width - 10, y: 80 }));
  uiCanvas.objects.push(new UIPanel(uiCanvas,
    { x: width - (70 + 15), y: (25 + 15) }, { x: (140 + 20), y: (50 + 20) }, "", 0.5,
    CFG.COL_BACKGROUND, CFG.COL_TEXT ));
  uiCanvas.objects.push(new UIButton(uiCanvas,
    () => { mainSim.compileGates(); },
    { x: width - (70 + 15), y: (25 + 15) }, { x: (140), y: (50) }, "Compile", 0.5,
    CFG.COL_BUTTON, CFG.COL_BUTTON_HOVERED, CFG.COL_TEXT ));

  // Populate main sim gates and connections
  mainSim.addGate(gatePresets["IN"], { x: 0, y: 0 });
  mainSim.addGate(gatePresets["IN"], { x: 0, y: 2 });
  mainSim.addGate(gatePresets["OUT"], { x: 2, y: 0 });
  mainSim.addGate(gatePresets["OUT"], { x: 2, y: 2 });
  mainSim.addConnection(
    mainSim.gates[0].getIONode(1, 0),
    mainSim.gates[2].getIONode(0, 0));
  mainSim.cam.pos = { x: width * 0.35, y: height * 0.35 };
  mainSim.cam.scale = 1.2;
}

// #endregion


// #region - Main

function draw() {
  background(0);

  // Update
  uiCanvas.earlyUpdate();
  mainSim.earlyUpdate();
  mainSim.update();
  uiCanvas.update();

  // Render
  output.clear();
  mainSim.render(output);
  uiCanvas.render(output);
  image(output, 0, 0);

  // Input late update
  input.draw();
}


function incName(name="") {
  // Get number from end
  let num = "";
  let i = name.length - 1;
  while (i >= 0 && !isNaN(name[i]) && name[i] != " ") {
    num = name[i] + num;
    i -= 1;
  }

  // Create new name with number incremented
  if (num == "") return name + " 1";
  else {
    let newName = name.slice(0, i + 1);
    let newNum = parseInt(num) + 1;
    return newName + newNum;
  }
}

// #endregion

// #endregion


// #region - UI

class UICanvas {

  // #region - Main

  constructor() {
    // Initialize variables
    this.hovered = false;
    this.objects = [];
  }


  earlyUpdate() {
    // Reset UI Hovered
    this.hovered = false;

    // Early update objects
    for (let obj of this.objects) obj.earlyUpdate();
  }


  update() {
    // Update objects
    for (let obj of this.objects) obj.update();
  }


  render(output) {
    // Render objects to output and then draw
    for (let obj of this.objects) obj.render(output);
  }


  getMouseX() {
    // Returns the mouse X position on the canvas
    return mouseX;
  }


  getMouseY() {
    // Returns the mouse Y position on the canvas
    return mouseY;
  }

  // #endregion
}


class UIPanel {

  // #region - Main

  constructor(uiCanvas_,
    pos_, size_, text_, textSize_,
    backgroundColour_, textColour_) {

    // Initialize variables
    this.uiCanvas = uiCanvas_;
    this.pos = pos_;
    this.size = size_;
    this.text = text_;
    this.textSize = textSize_;
    this.backgroundColour = backgroundColour_;
    this.textColour = textColour_;
    this.hovered = false;
  }


  setText(text_, shrinkToText=false) {
    // Set text and shrink
    this.text = text_;
    if (shrinkToText) this.size.x = this.size.y * this.textSize * this.text.length;
  }


  earlyUpdate() {
    // Update hovered
    this.hovered = this.getHovered();
    this.uiCanvas.hovered |= this.hovered;
  }


  update() {}


  render(output) {
    // render body and text
    this.renderBody(output);
    this.renderText(output);
  }


  renderBody(output) {
    // render body
    output.noStroke();
    output.fill(this.backgroundColour);
    output.rectMode(CENTER);
    output.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
  }


  renderText(output) {
    // render text
    output.fill(this.textColour);
    output.textAlign(CENTER);
    output.textSize(this.size.y * this.textSize);
    output.text(this.text, this.pos.x, this.pos.y + this.size.y * this.textSize * 0.4);
  }


  getHovered() {
    // Returns whether hovered
    return (this.uiCanvas.getMouseX() > (this.pos.x - this.size.x * 0.5)
      && this.uiCanvas.getMouseY() > (this.pos.y - this.size.y * 0.5)
      && this.uiCanvas.getMouseX() < (this.pos.x + this.size.x * 0.5)
      && this.uiCanvas.getMouseY() < (this.pos.y + this.size.y * 0.5)
    );
  }

  // #endregion
}


class UIGateSelect extends UIPanel {

  // #region - Setup

  constructor(uiCanvas_,
    pos_, size_) {
    super(uiCanvas_,
      pos_, size_, "", 0,
      CFG.COL_BACKGROUND, "#000000");

    // Initialize variables
    this.scrollAmount = 0;
    this.output = createGraphics(width, height);
    this.buttonHeight = (this.size.y * (1 - 2 * CFG.GATE_BDR_SELECT));
    this.buttons = [];
  }


  setupButtons() {
    // Setup buttons for gate presets
    this.buttons = [];
    for (let preset in gatePresets) {
      let newButton = new UIButton(this.uiCanvas,
        () => { this.clickPreset(gatePresets[preset]); },
        { x: 0, y: 0 }, { x: 0, y: this.buttonHeight }, "", CFG.TXT_SZ_GATESELECT,
        CFG.COL_BUTTON, CFG.COL_BUTTON_HOVERED, CFG.COL_TEXT);
      newButton.setText(gatePresets[preset].name, true);
      this.buttons.push(newButton);
    }
  }

  // #endregion


  // #region - Main

  earlyUpdate() {
    super.earlyUpdate();

    // Early update buttons
    for (let button of this.buttons) button.earlyUpdate();
  }


  update() {
    super.update();

    // Setup buttons
    if (Object.keys(gatePresets).length != this.buttons.length) this.setupButtons();

    // Set button positions
    let offset = this.size.y * CFG.GATE_BDR_SELECT;
    for (let button of this.buttons) {
      button.pos.x = this.pos.x - this.size.x * 0.5 + offset - this.scrollAmount + button.size.x * 0.5;
      button.pos.y = this.pos.y + this.size.y * (-0.5 + CFG.GATE_BDR_SELECT) + button.size.y * 0.5;
      offset += this.size.y * CFG.GATE_BDR_SELECT + button.size.x;

      // Update buttons
      button.update();
    }

    // Handle scrolling
    if (this.hovered) {
      let scrollMax = max(0, offset - this.size.x);
      if ((mouseX < this.pos.x - this.size.x * 0.42)
      || (mouseX > this.pos.x + this.size.x * 0.42)) {
        this.scrollAmount += 10 * (mouseX - this.pos.x) / this.size.x;
        this.scrollAmount = max(min(this.scrollAmount, scrollMax), 0);
      }
    }
  }


  render(output) {
    super.render(output);

    // render buttons
    for (let button of this.buttons) button.render(this.output);

    // render local output onto given output
    output.image(this.output.get(
        this.pos.x - this.size.x * 0.5,
        this.pos.y - this.size.y * 0.5,
        this.size.x, this.size.y),
      this.pos.x - this.size.x * 0.5,
      this.pos.y - this.size.y * 0.5
    );
  }


  clickPreset(preset) {
    // Clicked on given preset
    let gridPos = mainSim.grid.getGridPos(mainSim.getMouseX(), mainSim.getMouseY());
    let newGate = mainSim.addGate(preset, { x: floor(gridPos.x), y: floor(gridPos.y) });
    if (mainSim.selector.selectionType == "None") mainSim.selector.selectGates([newGate]);
  }

  // #endregion
}


class UIButton extends UIPanel {

  // #region - Main

  constructor(uiCanvas_,
    func_,
    pos_, size_, text_, textSize_,
    backgroundColour_, hoveredBackgroundColour, textColour_) {
    super(uiCanvas_,
      pos_, size_, text_, textSize_,
      backgroundColour_, textColour_);

    // Initialize additional variables
    this.func = func_;
    this.hoveredBackgroundColour = hoveredBackgroundColour;
  }


  update() {
    super.update();

    // Call function if clicked
    if (this.hovered && input.mouse.clicked.left) this.func();
  }


  render(output) {
    // Override render body
    output.noStroke();
    output.fill(this.hovered ? this.hoveredBackgroundColour : this.backgroundColour);
    output.rectMode(CENTER);
    output.rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

    // render text
    super.renderText(output);
  }

  // #endregion
}


class UILabel extends UIPanel {

  // #region - Main

  constructor(uiCanvas_,
    followOffset_, followPos,
    pos_, size_, text_, textSize_,
    backgroundColour_, textColour_) {
    super(uiCanvas_,
      pos_, size_, text_, textSize_,
      backgroundColour_, textColour_);

    // Initialize addition variables
    this.followOffset = followOffset_;
    this.followPos = followPos;
    this.enabled = false;
  }


  update() {
    super.update();

    // Update position based on follow pos
    this.pos.x = this.followPos.x - this.size.x * this.followOffset.x;
    this.pos.y = this.followPos.y - this.size.y * this.followOffset.y;
  }


  render(output) {
    // Call super render only if enabled
    if (this.enabled) super.render(output);
  }


  setLabel(text_, enabled_) {
    // Enable and render set text
    if (enabled_ != null) this.enabled = enabled_;
    if (text_ != null) this.setText(text_, true);
  }

  // #endregion
}

// #endregion


// #region - Simulation

class Simulation {

  // #region - Main

  constructor(pos_, size_) {
    // Setup variables
    this.output = createGraphics(size_.x, size_.y);
    this.uiCanvas = new UICanvas();
    this.uiCanvas.getMouseX = () => this.getMouseX();
    this.uiCanvas.getMouseY = () => this.getMouseY();
    this.pos = pos_;
    this.size = size_;

    this.grid = new Grid({ x: 0, y: 0 }, 80);
    this.selector = new Selector(this);
    this.gates = [];
    this.connections = [];
    this.cam = { pos: { x: 0, y: 0 }, scale: 1 };
  }


  saveToString(gates, connections) {
    // Collate gates
    let gateInfos = [];
    for (let g of this.gates) {
      let gateConfigCopy = {
        "name": g.gateConfig.name,
        "inputs": g.gateConfig.inputs,
        "outputs": g.gateConfig.outputs,
        "calc": g.gateConfig.calc + "",
        "toConfig": g.toConfig,
        "IOSize": [g.IONames[0].length, g.IONames[1].length] };
      g.gridPos.x = floor(g.gridPos.x);
      g.gridPos.y = floor(g.gridPos.y);
      let gateInfo = {
        gateConfig: gateConfigCopy,
        gridPos: g.gridPos };
      gateInfos.push(JSON.stringify(gateInfo));
    }

    // Collate connections
    let connectionInfos = [];
    for (let i = 0; i < this.connections.length; i++) {
      let fromGateIndex = gates.indexOf(this.connections[i].fromNode.gate);
      let toGateIndex = gates.indexOf(this.connections[i].toNode.gate);
      let connectionInfo = {
        fromGateIndex: fromGateIndex,
        fromIndex: this.connections[i].fromNode.IOInd,
        toGateIndex: toGateIndex,
        toIndex: this.connections[i].toNode.IOInd };
      connectionInfos.push(JSON.stringify(connectionInfo));
    }

    // Return data
    let outInfo = { gateInfos, connectionInfos };
    return JSON.stringify(outInfo);
  }


  loadFromString(inInfo) {
    // Parse info
    let offset = this.gates.length;
    let parsedInfo = JSON.parse(inInfo);

    // Add gates
    for (let gateInfo of parsedInfo.gateInfos) {
      gateInfo = JSON.parse(gateInfo);
      gateInfo.gateConfig.calc = eval(gateInfo.gateConfig.calc);
      if (gateInfo.gateConfig.toConfig != null) {
        let cGate = new ConfigGate(this, gateInfo.gateConfig, gateInfo.gridPos, gateInfo.gateConfig.toConfig);
        cGate.resizeIOSize(gateInfo.gateConfig.IOSize[0], gateInfo.gateConfig.IOSize[1]);
        this.gates.push(cGate);
      } else this.gates.push(new Gate(this, gateInfo.gateConfig, gateInfo.gridPos));
    }

    // Add connections
    for (let connectionInfo of parsedInfo.connectionInfos) {
      connectionInfo = JSON.parse(connectionInfo);
      let fromGate = this.gates[offset + connectionInfo.fromGateIndex];
      let toGate = this.gates[offset + connectionInfo.toGateIndex];
      this.connections.push(new Connection(this,
        fromGate.getIONode(connectionInfo.fromIndex),
        toGate.getIONode(connectionInfo.toIndex)
      ));
    }
  }

  // #endregion


  // #region - Main

  earlyUpdate() {
    // Early update
    this.uiCanvas.earlyUpdate();
    for (let gate of this.gates) gate.earlyUpdate();
  }


  update() {
    // Main update
    this.updateCam();
    this.uiCanvas.update();
    this.selector.update();
    for (let conn of this.connections) conn.propogate();
    for (let gate of this.gates) gate.update();
  }


  render(output) {
    // Main render
    this.output.push();
    this.output.background("#4c584e");
    this.translateCam();
    for (let conn of this.connections) conn.render(this.output);
    for (let gate of this.gates) gate.render(this.output);
    this.selector.render(this.output);
    this.uiCanvas.render(this.output);
    this.output.pop();

    // Draw to output
    output.image(this.output, this.pos.x, this.pos.y, this.size.x, this.size.y);
  }


  updateCam() {
    // Update camera with inputs
    this.cam.pos.x += (input.keys.held[65] ? 1 : 0 + input.keys.held[68] ? -1 : 0) * 3 / this.cam.scale;
    this.cam.pos.y += (input.keys.held[87] ? 1 : 0 + input.keys.held[83] ? -1 : 0) * 3 / this.cam.scale;
    this.cam.scale *= 1 - (input.mouseWheel > 0 ? 1 : input.mouseWheel == 0 ? 0 : -1) * 0.02;
  }


  translateCam() {
    // Translates based on camera
    this.output.translate(
      this.size.x * 0.5,
      this.size.y * 0.5);
    this.output.scale(this.cam.scale);
    this.output.translate(
      this.cam.pos.x - this.size.x * 0.5,
      this.cam.pos.y - this.size.y * 0.5);
  }


  addGate(gatePreset, gridPos) {
    // Add a gate
    let gate;
    if (gatePreset.name == "IN" || gatePreset.name == "OUT")
      gate = new ConfigGate(this, gatePreset, gridPos, gatePreset.name == "IN" ? 1 : 0);
    else gate = new Gate(this, gatePreset, gridPos);
    this.gates.push(gate);
    return gate;
  }


  addConnection(fromGate, fromIndex, toGate, toIndex) {
    // Add a connection
    let conn = new Connection(this, fromGate, fromIndex, toGate, toIndex);
    this.connections.push(conn);
    return conn;
  }


  deleteGates(toDelete) {
    // Loop over each gate
    for (let gate of toDelete) {

      // Delete connections to and from gate
      for (let i = 0; i < gate.IONodes.length; i++) {
        for (let o = 0; o < gate.IONodes[i].length; o++) {
          this.deleteConnectionsWithNode(gate.IONodes[i][o]);
        }
      }

      // Delete the specified gate
      if (gate.remove != null) gate.remove();
      this.gates.splice(this.gates.indexOf(gate), 1);
    }
  }


  deleteConnectionsWithNode(node) {
    // Delete all connections to or from a node
    let i = 0;
    while (i < this.connections.length) {
      if (this.connections[i].fromNode == node || this.connections[i].toNode == node)
        this.deleteConnection(this.connections[i]);
      else i++;
    }
  }


  deleteConnection(conn) {
    // Delete the specified connection
    this.connections.splice(this.connections.indexOf(conn), 1);
  }


  getMouseX() {
    // Returns world mouseX
    return (width * 0.5 + (mouseX - width * 0.5) / this.cam.scale) - this.cam.pos.x;
  }


  getMouseY() {
    // Returns world mouseY
    return (height * 0.5 + (mouseY - height * 0.5) / this.cam.scale) - this.cam.pos.y;
  }


  getMousePos() {
    // Returns world mouse pos
    return {
      x: this.getMouseX(),
      y: this.getMouseY()
    };
  }


  compileGates() {
    // Get input and output gates
    let inputGates = this.gates.filter(g => g.name == "IN");
    let outputGates = this.gates.filter(g => g.name == "OUT");

    // // Returns sub compiled calculations
    // let getSubCalc = (g) => {
    //   if (g.tmpSubCompCalc != undefined)
    //     return g.tmpSubCompCalc;
    //
    //   // Get input sub calculations
    //   let inputCalcs;
    //   if (g.name == "IN") {
    //     let inputIndex = inputGates.indexOf(g);
    //     inputCalcs = [[inputs => inputs, inputIndex]];
    //   } else {
    //     inputCalcs = g.inputs.map((_, i) => {
    //       let conn = this.connections.find(conn => (conn.toGate == g && conn.toIndex == i));
    //       return [getSubCalc(conn.fromGate), conn.fromIndex];
    //     });
    //   }
    //
    //   // Return compiled sub calcs
    //   g.tmpSubCompCalc = (inputs) => {
    //     let gateInputs = inputCalcs.map(c => c[0](inputs)[c[1]]);
    //     if (g.name == "OUT" || g.name == "IN") return gateInputs;
    //     else return g.calc(gateInputs);
    //   }; return g.tmpSubCompCalc;
    // };
    //
    // // Compile all sub calculations
    // let subCompCalcs = outputGates.map(g => getSubCalc(g));
    // let compCalc = (inputs) => {
    //   return subCompCalcs.map(c => c(inputs)[0]);
    // };
    //
    // // Create new preset
    // let gateName = "TEST";
    // let inputNames = inputGates.map((v, i) => ("in " + (i + 1)));
    // let outputNames = outputGates.map((v, i) => ("out " + (i + 1)));
    // gatePresets[gateName] = {
    //   "name": gateName,
    //   "inputs": inputNames,
    //   "outputs": outputNames,
    //   "calc": compCalc };
    //
    // // Reset tmpSubCompCalcs
    // for (let gate of this.gates) gate.tmpSubCompCalc = null;
  }

  // #endregion
}


class Grid {

  // #region - Setup

  constructor(startPos_, size_) {
    // Declare and initialize variables
    this.startPos = startPos_;
    this.size = size_;
  }

  // #endregion


  // #region - Main

  render(output, amount) {
    // Visualize a grid of size amount
    output.strokeWeight(1);
    output.stroke("#232824");
    output.noFill();
    output.rectMode(CORNER);
    for (let x = 0; x < amount; x++) {
      for (let y = 0; y < amount; y++) {
        let pos = this.getWorldPos(x, y);
        output.rect(pos.x, pos.y, this.size, this.size);
      }
    }
  }


  getWorldPos(gridX, gridY) {
    // Returns the world pos given a grid pos
    return {
      x: gridX != undefined ? (this.startPos.x + gridX * this.size) : undefined,
      y: gridY != undefined ? (this.startPos.y + gridY * this.size) : undefined
    };
  }


  getGridPos(worldX, worldY) {
    // Returns the grid pos given a world pos
    return {
      x: (worldX - this.startPos.x) / this.size,
      y: (worldY - this.startPos.y) / this.size
    };
  }

  // #endregion
}


class Gate {

  // #region - Setup

  constructor(sim_, gateConfig_, gridPos_) {
    // Initialize variables
    this.sim = sim_;
    this.gateConfig = gateConfig_;
    this.calc = gateConfig_.calc;
    this.name = gateConfig_.name;

    this.gridPos = gridPos_;
    this.gotoGridPos = {
      x: floor(gridPos_.x),
      y: floor(gridPos_.y) };
    this.lockedOn = false;

    // Initialize IO
    this.initIO(gateConfig_.inputs, gateConfig_.outputs);
  }


  initIO(inputs, outputs) {
    // Set the input and output of this gate
    this.IONames = [inputs, outputs];
    this.IONodes = [[], []];
    this.IO = [[], []];
    for (let _ in inputs) this.IO[0].push(false);
    for (let _ in outputs) this.IO[1].push(false);

    // Populate IO
    for (let i = 0; i < this.IO.length; i++) {
      for (let o = 0; o < this.IO[i].length; o++) {
        this.addIO(i, o, this.IONames[i][o]);
      }
    }

    // Update sizes
    this.gridSize = this.getGridSize();
    this.bodySize = this.getBodySize();
    this.lockedSize = this.getLockedSize();
  }


  addIO(i, o, name) {
    // Add an IO nodes
    this.IONodes[i].push(new Node(this, [i, o], name, () => {
      let centre = this.getCentre();
      let dy = this.bodySize.y / this.gridSize.y;
      let y = dy * (o - (this.getIO(i).length - 1) * 0.5);
      return { x: centre.x + this.bodySize.x * (i - 0.5), y: centre.y + y };
    }));
  }


  resizeIOSize(inputSize, outputSize) {
    // Auto generate names
    let newIO = [[...this.IONames[0]], [...this.IONames[1]]];
    if (inputSize < this.IONames[0].length) newIO[0].splice(newIO[0].length - 1, 1);
    else if (outputSize < this.IONames[1].length) newIO[1].splice(newIO[1].length - 1, 1);
    else if (inputSize > this.IONames[0].length) newIO[0].push(incName(newIO[0][newIO[0].length - 1]));
    else if (outputSize > this.IONames[1].length) newIO[1].push(incName(newIO[1][newIO[1].length - 1]));
    this.resizeIONames(newIO[0], newIO[1]);
  }


  resizeIONames(inputs, outputs) {
    let newIO = [inputs, outputs];
    let toKeep = [];

    // Go over current nodes
    for (let i = 0; i < this.IONames.length; i++) {
      for (let o = 0; o < this.IONames[i].length; o++) {

        // not kept so delete
        let newIOIndex = newIO[i].indexOf(this.IONames[i][o]);
        if (newIOIndex == -1) {
          this.sim.deleteConnectionsWithNode(this.IONodes[i][o]);

        // Kept so track connections
        } else {
          for (let conn of this.sim.connections) {
            if (conn.fromNode == this.IONodes[i][o]) {
              conn.fromNode = null;
              toKeep.push([[i, newIOIndex], conn]);
            }
          }
        }
      }
    }

    // Initialize IO
    this.initIO(inputs, outputs);

    // Reconnect lost connections
    for (let cInfo of toKeep) {
      cInfo[1].fromNode = this.IONodes[cInfo[0][0]][cInfo[0][1]];
    }
  }

  // #endregion


  // #region - Main

  earlyUpdate() {
    // Reset inputs to false
    this.IO[0] = new Array(this.IONames[0].length).fill(false);

    // Early update IO Nodes
    for (let side of this.IONodes) {
      for (let node of side) node.earlyUpdate();
    }
  }


  update() {
    // Reset and then recalculate outputs
    this.IO[1] = new Array(this.IONames[1].length).fill(this.lockedOn);
    if (!this.lockedOn && this.calc != null) this.IO[1] = this.calc(this.IO[0]);

    // Toggle lockedOn when hovered and on shift
    if (this.sim.selector.checkHoveredBody(this) && input.keys.clicked[32])
      this.lockedOn = !this.lockedOn;

    // Interpolate towards target gridPos
    this.gridPos.x += (this.gotoGridPos.x - this.gridPos.x) * 0.25;
    this.gridPos.y += (this.gotoGridPos.y - this.gridPos.y) * 0.25;


    // Update IO Nodes
    for (let side of this.IONodes) {
      for (let node of side) node.update();
    }
  }


  render(output) {
    // Calculate variables
    let centre = this.getCentre();
    let bodyStroke = (this.sim.selector.checkHoveredBody(this)
      || this.sim.selector.checkSelectedBody(this))
      ? (CFG.STRK_WGT_GATE_BODY_HOVERED * this.sim.grid.size)
      : (CFG.STRK_WGT_GATE_BODY * this.sim.grid.size);

    // Render body
    output.strokeWeight(bodyStroke);
    output.stroke("#2e2e2e");
    output.fill("#464646");
    output.rectMode(CENTER);
    output.rect(centre.x, centre.y, this.bodySize.x, this.bodySize.y);

    // render outline if selected
    if (this.sim.selector.checkSelectedBody(this)) {
      output.strokeWeight(this.sim.grid.size * CFG.STRK_WGT_GATE_SELECTION);
      output.stroke(Selector.BOX_COLOUR);
      output.noFill();
      output.rectMode(CENTER);
      output.rect(centre.x, centre.y, this.bodySize.x + bodyStroke, this.bodySize.y + bodyStroke);
    }

    // render outline if locked
    if (this.lockedOn) {
      output.strokeWeight(this.sim.grid.size * CFG.STRK_WGT_GATE_LOCK);
      output.stroke(CFG.COL_NODE_ON);
      output.noFill();
      output.rectMode(CENTER);
      output.rect(centre.x, centre.y, this.lockedSize.x, this.lockedSize.y);
    }

    // Render IO Nodes
    for (let side of this.IONodes) {
      for (let node of side) node.render(output);
    }

    // render name text
    output.push();
    output.translate(centre.x, centre.y);
    output.rotate(PI / 2);
    output.noStroke();
    output.fill("#d7d7d7");
    output.textSize(this.sim.grid.size * CFG.TXT_SZ_GATE);
    output.textAlign(CENTER);
    output.text(this.name, 0, this.sim.grid.size * CFG.TXT_SZ_GATE * 0.3);
    output.pop();
  }

  // #endregion


  // #region - Accessors

  getGridSize() {
    // Returns the gridSize based on inputs / outputs
    return { x: 1, y: max(1, max(this.IONames[0].length, this.IONames[1].length) - 1) };
  }


  getBodySize() {
    // Returns the size based on inputs / outputs
    return {
      x: this.sim.grid.size * (this.gridSize.x - CFG.GATE_BDR_BODY),
      y: this.sim.grid.size * (this.gridSize.y - CFG.GATE_BDR_BODY)
    };
  }


  getLockedSize() {
    // Returns the size of the lockedOn square based on inputs / outputs
    return {
      x: this.sim.grid.size * (this.gridSize.x - CFG.GATE_BDR_LOCKED),
      y: this.sim.grid.size * (this.gridSize.y - CFG.GATE_BDR_LOCKED)
    };
  }


  getCentre() {
    // Returns the centre based on inputs / outputs
    return this.sim.grid.getWorldPos(
      this.gridPos.x + this.gridSize.x * 0.5,
      this.gridPos.y + this.gridSize.y * 0.5
    );
  }


  setIO(i, o, value) {
    if (value === undefined) return this.setIO(i[0], i[1], o);

    // Sets the given IO
    this.IO[i][o] = value;
  }


  getIO(i, o) {
    // Return desired IO
    if (i == undefined) return this.IO;
    if (o == undefined) return this.IO[i];
    return this.IO[i][o];
  }


  getIONames(i, o) {
    if (o == undefined) return this.getIONames(i[0], i[1]);

    // Return desired side
    if (i != undefined) {
      if (o != undefined)
        return sides[i][o];
      return sides[i];
    } return sides;
  }


  getIONode(i, o) {
    if (o == undefined) return this.getIONode(i[0], i[1]);

    // Return desired IO node
    return this.IONodes[i][o];
  }


  getBodyHovered() {
    // Returns whether mouse is overtop
    let centre = this.getCentre();
    return this.sim.getMouseX() > (centre.x - this.bodySize.x * 0.5)
      && this.sim.getMouseX() < (centre.x + this.bodySize.x * 0.5)
      && this.sim.getMouseY() > (centre.y - this.bodySize.y * 0.5)
      && this.sim.getMouseY() < (centre.y + this.bodySize.y * 0.5);
  }

  // #endregion
}


class ConfigGate extends Gate {

  // #region - Main

  constructor(sim_, gateConfig_, gridPos_, toConfig_) {
    super(sim_, gateConfig_, gridPos_);

    // Initialize variables
    this.toConfig = toConfig_;
    let s = this.sim.grid.size * CFG.GATE_CFG_BTN_SIZE;
    this.subButton = new UIButton(this.sim.uiCanvas,
      () => {
        this.resizeIOSize(
          this.IONames[0].length - (1 - this.toConfig),
          this.IONames[1].length - (this.toConfig)
        );
      },
      { x: 0, y: 0 }, { x: s, y: s }, "-", 0.65,
      CFG.COL_BUTTON, CFG.COL_BUTTON_HOVERED, CFG.COL_TEXT );
    this.addButton = new UIButton(this.sim.uiCanvas,
      () => {
        this.resizeIOSize(
          this.IONames[0].length + (1 - this.toConfig),
          this.IONames[1].length + (this.toConfig)
        );
      },
      { x: 0, y: 0 }, { x: s, y: s }, "+", 0.65,
      CFG.COL_BUTTON, CFG.COL_BUTTON_HOVERED, CFG.COL_TEXT );
    this.sim.uiCanvas.objects.push(this.subButton);
    this.sim.uiCanvas.objects.push(this.addButton);
  }


  remove() {
    // Remove UI buttons
    this.sim.uiCanvas.objects.splice(this.sim.uiCanvas.objects.indexOf(this.subButton), 1);
    this.sim.uiCanvas.objects.splice(this.sim.uiCanvas.objects.indexOf(this.addButton), 1);
  }


  update() {
    // Super update
    super.update();

    // Update buttons
    let centre = this.getCentre();
    let strkOffset = this.sim.grid.size * CFG.STRK_WGT_GATE_BODY * 0.5;
    this.subButton.pos = {
      x: centre.x - this.addButton.size.x * 0.5 - 3,
      y: centre.y - this.subButton.size.y * 0.5 - this.bodySize.y * 0.5 + strkOffset
    };
    this.addButton.pos = {
      x: centre.x + this.addButton.size.x * 0.5 + 3,
      y: centre.y - this.addButton.size.y * 0.5 - this.bodySize.y * 0.5 + strkOffset
    };
  }

  // #endregion
}


class Node {

  // #region - Main

  // new UILabel(this,
  //   { x: 0, y: 1.5 }, () => ({ x: mouseX, y: mouseY }),
  //   { x: 100, y: 100 }, { x: 0, y: 25 }, "NA", 0.5,
  //   "#00000080", "#ffffff"
  // );


  constructor(gate_, IOInd_, name_, getPos_) {
    this.gate = gate_;
    this.IOInd = IOInd_;
    this.name = name_;
    this.getPos = getPos_;
  }


  earlyUpdate() {
    // Update hovered
    this.hovered = this.getHovered();
  }


  update() {}


  render(output) {
    // Draw at pos as ellipse
    let pos = this.getPos();
    let size = this.gate.sim.grid.size * (this.hovered ? CFG.NODE_SIZE_HOVER : CFG.NODE_SIZE);
    output.strokeWeight(this.gate.sim.grid.size * (this.hovered ? CFG.STRK_WGT_NODE_HOVER : CFG.STRK_WGT_NODE));
    output.stroke("#2e2e2e");
    output.fill(this.getValue() ? CFG.COL_NODE_ON : CFG.COL_NODE_OFF);
    output.ellipse(pos.x, pos.y, size, size);
  }


  setValue(value) {
    // Set the io to value
    this.gate.setIO(this.IOInd, value);
  }


  getValue() {
    // Get the value of the io
    return this.gate.getIO(this.IOInd[0], this.IOInd[1]);
  }


  getHovered() {
    // Returns whether is currently hovered
    let mousePos = this.gate.sim.getMousePos();
    let pos = this.getPos();
    return dist(mousePos.x, mousePos.y, pos.x, pos.y) < (this.gate.sim.grid.size * CFG.NODE_SIZE_HOVER);
  }

  // #endregion
}


class Connection {

  // #region - Main

  constructor(sim_, fromNode_, toNode_) {
    // Initialize variables
    this.sim = sim_;
    this.setFromNode(fromNode_);
    if (toNode_ != null) this.setToNode(toNode_);
  }


  setFromNode(fromNode_) {
    // Set the node this is coming from
    this.fromNode = fromNode_;
  }


  setToNode(toNode_) {
    // Set the node this is going to
    this.toNode = toNode_;
  }


  propogate() {
    // Update toGates inputs
    let value = this.fromNode.getValue();
    if (this.sim.selector.checkSelectedConnection(this)) value = 0;
    if (this.toNode != null) this.toNode.setValue(value);
  }


  render(output) {
    // render connection
    let startPos = this.fromNode.getPos();
    let endPos = this.sim.selector.checkSelectedConnection(this)
      ? this.sim.getMousePos() : this.toNode.getPos();
    output.strokeWeight(this.sim.grid.size * CFG.STRK_WGT_CONNECTION);
    output.stroke(this.fromNode.getValue() ? CFG.COL_NODE_ON : CFG.COL_NODE_OFF);
    output.line(startPos.x, startPos.y, endPos.x, endPos.y);
  }

  // #endregion
}


class Selector {

  // #region - Main

  // Initialize static variables
  static BOX_COLOUR = "#ececec";


  constructor(sim_) {
    // Initialize variables
    this.sim = sim_;
    this.selectionType = "None";
    this.hoveredType = "None";
    this.currentSelection = null;
    this.currentHover = null;
  }


  update() {
    // Run updates
    this.updateHovered();
    this.updateSelected();
  }


  render(output) {
    // Run renders
    this.renderSelected(output);
  }

  // #endregion


  // #region - Hovers

  updateHovered() {
    // Reset current hovered
    this.hoveredType = "None";
    this.currentHover = null;

    // If not hovering UI
    if (!uiCanvas.hovered) {

      // Check each gates nodes
      for (let gate of this.sim.gates) {
        let bodyHovered = gate.getBodyHovered();
        let nodeHovered = null;
        for (let i = 0; i < gate.IONodes.length; i++) {
          for (let o = 0; o < gate.IONodes[i].length; o++) {
            if (gate.IONodes[i][o].getHovered()) nodeHovered = gate.IONodes[i][o];
          }
        }

        // Check whether hovering node and in correct modes
        if (nodeHovered != null
        && (this.selectionType == "None"
        || (this.selectionType == "Conn"
          && nodeHovered.IOInd[0] == 0
          && gate != this.currentSelection.fromNode.gate))) {

          this.hoveredType = "Node";
          this.currentHover = nodeHovered;

        // Check whether hovering body and in correct modes
        } else if (bodyHovered
        && this.selectionType == "None") {

          this.hoveredType = "Gate";
          this.currentHover = gate;
          break;
        }
      }
    }
  }


  checkHoveredBody(gate) {
    // Checks whether body is currently hovered
    return this.hoveredType == "Gate" && this.currentHover == gate;
  }


  checkHoveredNode(node) {
    // Checks whether node is currently hovered
    return this.hoveredType == "Node" && this.currentHover == node;
  }

  // #endregion


  // #region - Selections

  updateSelected() {
    // If not hovering UI
    if (!(uiCanvas.hovered || this.sim.uiCanvas.hovered)) {

      // Nothing selected
      if (this.selectionType == "None") {

        // - Select
        if (input.mouse.clicked.left) {
          if (this.hoveredType == "Gate") this.selectGates([this.currentHover]);
          else if (this.hoveredType == "Node") this.selectConnection(this.currentHover);

          // - Start box
          else if (this.hoveredType == "None") this.selectionStart = this.sim.getMousePos();

        // - Delete
        } else if (input.mouse.clicked.right) {
          if (this.hoveredType == "Gate") this.sim.deleteGates([this.currentHover]);
          if (this.hoveredType == "Node") this.sim.deleteConnectionsWithNode(this.currentHover);
        }

        // - Stop box
        if (!input.mouse.held.left && this.selectionStart != null) {
          this.selectGates(this.getGatesInBox());
          this.selectionStart = null;
        }


      // Has gates selected
      } else if (this.selectionType == "Gate") {

        // - Follow mouse
        for (let gate of this.currentSelection) {
          let mouseGridPos = this.sim.grid.getGridPos(this.sim.getMouseX(), this.sim.getMouseY());
          let gotoGridPos = {
            x: floor(mouseGridPos.x) + gate[1].x,
            y: floor(mouseGridPos.y) + gate[1].y };
          gate[0].gotoGridPos = gotoGridPos;
        }

        // - Place
        if (input.mouse.clicked.left) {
          this.deselect();

        // - Delete
        } else if (input.mouse.clicked.right) {
          this.sim.deleteGates(this.currentSelection.map(v => v[0]));
          this.deselect();
        }


      // Has connection selected
      } else if (this.selectionType == "Conn") {

        // - Attach
        if (input.mouse.clicked.left) {
          if (this.hoveredType == "Node") {
            let taken = this.sim.connections.reduce((acc, c) => acc |= (c != this.currentSelection && c.toNode == this.currentHover), false);
            if (!taken) {
              this.currentSelection.setToNode(this.currentHover);
              this.deselect();
            }

          // - Release
          } else {
              if (this.currentSelection.toNode == null)
              this.sim.deleteConnection(this.currentSelection);
            this.deselect();
          }

        // - Delete
        } else if (input.mouse.clicked.right) {
          this.sim.deleteConnection(this.currentSelection);
          this.deselect();
        }
      }
    }
  }


  renderSelected(output) {
    // render selection box
    if (this.selectionStart != null) {
      output.strokeWeight(2);
      output.stroke(Selector.BOX_COLOUR);
      output.noFill();
      output.rectMode(CORNERS);
      output.rect(this.selectionStart.x, this.selectionStart.y, this.sim.getMouseX(), this.sim.getMouseY());
    }
  }


  selectGates(gates) {
    // Select specified gates
    if (gates.length != 0) {
      let selectedGates = [];
      let mouseGridPos = this.sim.grid.getGridPos(this.sim.getMouseX(), this.sim.getMouseY());
      for (let gate of gates) {
        selectedGates.push([gate, {
          x: floor(gate.gridPos.x) - floor(mouseGridPos.x) + 0.01,
          y: floor(gate.gridPos.y) - floor(mouseGridPos.y) + 0.01
        }]);
      }
      this.selectionType = "Gate";
      this.currentSelection = selectedGates;
    }
  }


  selectConnection(node) {
    // Select current connection if exists
    if (node.IOInd[0] == 0) {
      for (let conn of this.sim.connections) {
        if (conn.toNode == node) {
          this.selectionType = "Conn";
          this.currentSelection = conn;
          break;
        }
      }

    // Create a new connection from node
  } else if (node.IOInd[0] == 1) {
      let newConn = this.sim.addConnection(node);
      this.selectionType = "Conn";
      this.currentSelection = newConn;
    }
  }


  deselect() {
    // Deselect current selection
    this.selectionType = "None";
    this.currentSelection = null;
  }


  checkSelectedBody(gate) {
    // Checks whether body is currently selected
    if (this.selectionType == "Gate") {
      if (this.currentSelection == null) return false;
      for (let checkGate of this.currentSelection) {
        if (checkGate[0] == gate) return true;
      } return false;
    } else return false;
  }


  checkSelectedConnection(conn) {
    // Checks whether body is currently selected
    return this.selectionType == "Conn" && this.currentSelection == conn;
  }


  getGatesInBox() {
    // No current box
    if (this.selectionStart == null) return [];

    // Find bounds
    let left = this.sim.getMouseX() < this.selectionStart.x ? this.sim.getMouseX() : this.selectionStart.x;
    let top = this.sim.getMouseY() < this.selectionStart.y ? this.sim.getMouseY() : this.selectionStart.y;
    let right = this.sim.getMouseX() > this.selectionStart.x ? this.sim.getMouseX() : this.selectionStart.x;
    let bottom = this.sim.getMouseY() > this.selectionStart.y ? this.sim.getMouseY() : this.selectionStart.y;

    // Find all gates in box
    let gatesInside = [];
    for (let gate of this.sim.gates) {
      let centre = gate.getCentre();
      if ((centre.x + gate.bodySize.x * 0.5) > left
      && (centre.y + gate.bodySize.y * 0.5) > top
      && (centre.x - gate.bodySize.x * 0.5) < right
      && (centre.y - gate.bodySize.y * 0.5) < bottom)
        gatesInside.push(gate);
    } return gatesInside;
  }

  // #endregion
}

// #endregion
