
//        TODO

// Add basic background
// Add rename feature
// Save gate state in save (on / off, length)
// Specify connections to delete
// Rotate selections
// Connect multiple gates together at once


//        Inputs

//    Nothing selected
// LMB on gate body     - Select gate
// RMB on gate body     - Delete gate
// LMB on gate node     - Create new connection
// RMB on gate node     - Delete connections
// LMB drag             - Select
// RMB drag             - Move camera

//    Gate(s) selected
// LMB anywhere         - Place gate
// RMB anywhere         - Delete gate
// ctrl + d             - Duplicate current gates
// ctrl + s             - Save blueprint

//    Connection selected
// LMB on gate          - Connect to gate
// LMB on ground        - Delete connection
// RMB anywhere         - Delete connection

//    Anytime
// ctrl + < / >         - Change hovered gates type
// spacebar             - Toggle input gate
// ctrl + o             - Load current blueprint
// up / down arrow      - Change current blueprint


// #region - Setup

import java.io.File;
import java.util.HashMap;
import java.util.Arrays;

enum GateType {

  INPUT, CLOCK, TIMER, AND, NAND, NOT, OR, XOR;
  private static GateType[] vals = values();


  public GateType next() {
    return vals[(this.ordinal() + 1 + vals.length) % vals.length];
  }


  public GateType previous() {
    return vals[(this.ordinal() - 1 + vals.length) % vals.length];
  }
};


// Declare variables
float gridSize;
HashMap<String, Integer> colors;

ArrayList<Notification> notifications;
ArrayList<Gate> gates;
ArrayList<Connection> connections;
ArrayList<String> availableBlueprints;
int selectedBlueprint;
boolean[] inputs;

PVector camCentrePos;
PVector camGotoCentrePos;
float camScale;
float camGotoScale;
boolean showDirection;

Selection currentSelection;
boolean isSelecting;
PVector selectionStart;


void setup() {
  // Main setup
  size(900, 900);
  textAlign(CENTER);
  setupVariables();
}


void setupVariables() {
  // Initialize variables
  gridSize = 35;
  colors = new HashMap<String, Integer>();
  colors.put("error", color(#e339a9));
  colors.put("SelectionBoxStroke", color(#77b4bf));
  colors.put("gateStroke", color(#2a2a2a));

  colors.put("gateHighlightedStroke", color(#c1c1c1));
  colors.put("gateSelectedStroke", color(#f2f2f2));
  colors.put("gateFill", color(#8a8a8a));
  colors.put("gateOff", color(#eb422b));
  colors.put("gateMiddle", color(#b17c35));
  colors.put("gateOn", color(#86d040));

  colors.put("connectionStroke", color(#2a2a2a));
  colors.put("connectionSelectedStroke", color(#f2f2f2));

  notifications = new ArrayList<Notification>();
  gates = new ArrayList<Gate>();
  connections = new ArrayList<Connection>();
  availableBlueprints = new ArrayList<String>();
  selectedBlueprint = 0;
  inputs = new boolean[600];

  camCentrePos = new PVector(width * 0.5, height * 0.5);
  camGotoCentrePos = camCentrePos.copy();
  camScale = 1;
  camGotoScale = 1;
  showDirection = false;

  currentSelection = null;

  // Main setup
  updateAvailableBlueprints();
  gates.add(new Gate(GateType.OR, new PVector(width * 0.5, height * 0.5)));
}

// #endregion


// #region - Main

void draw() {
  background(#bfbfbf);

  // Update camera
  // if (!inputs[17] && inputs[65]) camGotoCentrePos.x -= 5;
  // if (!inputs[17] && inputs[87]) camGotoCentrePos.y -= 5;
  // if (!inputs[17] && inputs[68]) camGotoCentrePos.x += 5;
  // if (!inputs[17] && inputs[83]) camGotoCentrePos.y += 5;
  camCentrePos.add(camGotoCentrePos.copy() .sub(camCentrePos) .mult(0.15));
  camScale = min(max(camScale + (camGotoScale - camScale) * 0.1, 0.1), 5);
  camGotoScale = min(max(camGotoScale, 0.1), 5);

  // Update current selection
  if (currentSelection != null)
    currentSelection.update();

  // Update gates and connections
  for (Connection connection : connections)
    connection.propogateOutput();
  for (Gate gate : gates)
    gate.calculateOutput();


  // Show notifications
  noStroke();
  textSize(30);
  for (int i = notifications.size() - 1; i>= 0; i--) {
    Notification nt = notifications.get(i);
    float tProg = (float)nt.time / nt.maxTime;
    fill(0, tProg * 255);
    text(nt.message, width * 0.5, height + (i - notifications.size()) * 30);
    nt.time--;
    if (nt.time < 0)
      notifications.remove(nt);
  }

  // Show available blueprints
  noStroke();
  fill(0);
  textSize(20);
  textAlign(LEFT);
  for (int i = 0; i < availableBlueprints.size(); i++) {
    text(availableBlueprints.get(i), 20, (i + 2) * 20);
    if (selectedBlueprint == i)
      rect(5, (i + 2) * 20 - 10, 10, 10);
  }
  textAlign(CENTER);

  // Translate with camera
  translate(width * 0.5, height * 0.5);
  scale(camScale);
  translate(-camCentrePos.x, -camCentrePos.y);

  // Show selection box
  if (isSelecting) {
    PVector mousePos = convertToWorld(getMousePos());
    stroke(colors.get("SelectionBoxStroke"));
    noFill();
    rect(selectionStart.x, selectionStart.y,
      mousePos.x - selectionStart.x, mousePos.y - selectionStart.y);
  }

  // Update / Show gates and connections
  for (Gate gate : gates)
    gate.update();
  for (Connection connection : connections)
    connection.update();
}


PVector getMousePos() {
  // Returns a mouse pos on screen
  return new PVector(mouseX, mouseY);
}


boolean onScreen(float px, float py) {
  // Returns whether a position is on the screen
  return (px > camCentrePos.x - width * 0.5 / camScale
    && px < camCentrePos.x + width * 0.5 / camScale
    && py > camCentrePos.y - height * 0.5 / camScale
    && py < camCentrePos.y + height * 0.5 / camScale
  );
}


PVector convertToWorld(PVector vec) {
  // Convert screen vector to world
  return new PVector(
    (vec.x - width * 0.5) / camScale + camCentrePos.x,
    (vec.y - height * 0.5) / camScale + camCentrePos.y
  );
}


PVector roundToWorld(PVector vec) {
  // Returns a vector aligned to a grid
  return new PVector(
    round(vec.x / gridSize) * gridSize,
    round(vec.y / gridSize) * gridSize
  );
}


boolean boxOverlap(PVector start0, PVector end0, PVector start1, PVector end1) {
  // 0r right of 1l and 0l left of 1l
  return (end0.x >= start1.x && end1.x >= start0.x
  && end0.y >= start1.y && end1.y >= start0.y);
}


void updateAvailableBlueprints() {
  // Clear current blueprints
  availableBlueprints.clear();

  // Retrieve all files
  File blueprintsFolder = new File(dataPath(""));
  if (!blueprintsFolder.exists()) println("Could not find blueprints folder");
  File[] files = blueprintsFolder.listFiles();

  // For each JSON file in blueprint folder
  for (int i = 0; i < files.length; i++) {
    String filePath = files[i].getName();
    if (files[i].isFile() && filePath.toLowerCase().endsWith((".json"))){

      // Check if has "isBlueprint" set to true
      JSONObject fileJSON = loadJSONObject(filePath);
      if (!fileJSON.isNull("isBlueprint") && fileJSON.getBoolean("isBlueprint"))
        availableBlueprints.add(filePath);
    }
  }

  // Update selected blueprint
  selectedBlueprint = (selectedBlueprint + availableBlueprints.size()) % availableBlueprints.size();
}

String getNextBlueprintURL() {
  // Returns the next available blueprint URL
  int count = -1;
  while (true) {
    count++;
    String url = "blueprint" + count + ".json";
    File blueprint = new File(dataPath(url));
    if (!blueprint.exists())
      return url;
  }
}


void addNotification(String message, int time) {
  // Add a notification with given message and time
  notifications.add(new Notification(message, time));
}

// #endregion


// #region - Gates and connections

void deselect() {
  // Deselect current selection
  if (currentSelection != null)
    currentSelection.deselect();
}


void selectGates(ArrayList<Gate> gates) {
  // Select the specified gates
  currentSelection = new Selection(gates);
}


void selectConnection(Connection connection) {
  // Select the specified connection
  currentSelection = new Selection(connection);
}


void deleteGate(Gate gate) {
  // Delete the specificed gate
  for (int i = connections.size() - 1; i >= 0; i--) {
    if (connections.get(i).in == gate
    || connections.get(i).out == gate)
      connections.remove(connections.get(i));
  } gates.remove(gate);
}


void deleteConnection(Connection connection) {
  // Delete the specified connection
  if (connection.in != null)
    connection.in.outputConnections.remove(this);
  connections.remove(connection);
}


Gate createGate(GateType type, PVector pos) {
  // Create a gate with type and pos
  Gate newGate = new Gate(type, pos);
  gates.add(newGate);
  return newGate;
}


Connection createConnection(Gate gate) {
  // Create a connection from a gate
  Connection newConnection = new Connection(gate);
  gate.outputConnections.add(newConnection);
  connections.add(newConnection);
  return newConnection;
}

// #endregion


// #region - Input

void mouseReleased() {
  // Mouse finished dragging
  if (isSelecting) {
    ArrayList<Gate> overlapped = new ArrayList<Gate>();
    PVector start = selectionStart;
    PVector end = convertToWorld(getMousePos());
    for (Gate gate : gates) {
      if (boxOverlap(new PVector(
        min(start.x, end.x),
        min(start.y, end.y)
      ), new PVector(
        max(start.x, end.x),
        max(start.y, end.y)
      ), new PVector(
        gate.pos.x - gridSize * 0.5,
        gate.pos.y - gridSize * 0.5
      ), new PVector(
        gate.pos.x + gridSize * 0.5,
        gate.pos.y + gridSize * 0.5
      ))) overlapped.add(gate);
    }
    if (overlapped.size() > 0)
      currentSelection = new Selection(overlapped);
    isSelecting = false;
    selectionStart = null;
  }
}


void mouseDragged() {
  // Drag camera
  if (mouseButton == RIGHT) {
    camGotoCentrePos.add(new PVector(
      pmouseX - mouseX,
      pmouseY - mouseY
    ));
  }

  // Update dragging
  if (!isSelecting && mouseButton == LEFT && currentSelection == null) {
    isSelecting = true;
    selectionStart = convertToWorld(getMousePos());
  }
}


void mouseClicked() {
  // Nothing selected
  if (currentSelection == null) {

    // Find what gate clicked
    boolean found = false;
    for (int i = gates.size() - 1; i >= 0; i--) {
      Gate gate = gates.get(i);
      int ontopType =
        gate.ontopBody(convertToWorld(getMousePos())) ? 1 :
        gate.ontopNode(convertToWorld(getMousePos())) ? 2 : 0;
      if (ontopType > 0) found = true;
      else continue;

      // Ontop gate body
      if (ontopType == 1) {

        // LMB - Select gate
        if (mouseButton == LEFT)
          selectGates(new ArrayList<Gate>(Arrays.asList(gate)));

        // RMB - Delete gate
        else if (mouseButton == RIGHT)
          deleteGate(gate);

      // Ontop gate node
      } else if (ontopType == 2) {

        // LMB - Create new connection and select
        if (mouseButton == LEFT)
          selectConnection(createConnection(gate));

        // RMB - Delete output connections
        else if (mouseButton == RIGHT) {
          for (Connection connection : gate.outputConnections)
            deleteConnection(connection);
          gate.outputConnections.clear();
        }
      }
    }

    // Clicked on ground
    if (!found && mouseButton == LEFT)
      selectGates(new ArrayList<Gate>(Arrays.asList(createGate(GateType.OR, convertToWorld(getMousePos())))));


  // Gates selected
  } else if (currentSelection.type == "Gates") {

    // LMB - Place gate and deselect
    if (mouseButton == LEFT) {
      deselect();

    // RMB - Delete gates and deselect
    } else if (mouseButton == RIGHT) {
      for (Gate gate : currentSelection.selectedGates)
        deleteGate(gate);
      deselect();
    }


  // Conection selected
  } else if (currentSelection.type == "Connection") {

    // LMB
    if (mouseButton == LEFT) {

      // Check if clicked on any gate
      Gate clickedGate = null;
      PVector mousePos = convertToWorld(getMousePos());
      for (Gate gate : gates)  {
        if (gate.ontop(mousePos)) {
          clickedGate = gate;
          break;
        }
      }

      // CLicked gate, check connection already if exists
      if (clickedGate != null && currentSelection.selectedConnection.in != clickedGate) {
        boolean found = false;
        for (Connection connection : connections) {
          if ((connection.in == currentSelection.selectedConnection.in && connection.out == clickedGate))
            found = true;
        }

        // Only connect if doesn't already exist
        if (found) {
          if (currentSelection.selectedConnection.out == null)
            deleteConnection(currentSelection.selectedConnection);
        } else currentSelection.selectedConnection.out = clickedGate;

      // Didn't successfully connect
      } else if (currentSelection.selectedConnection.out == null)
        deleteConnection(currentSelection.selectedConnection);
      deselect();

    // RMB - Delete Connection
    } else if (mouseButton == RIGHT) {
      deleteConnection(currentSelection.selectedConnection);
      deselect();
    }
  }
}


void mouseWheel(MouseEvent e) {
  // Zoom based on mouse wheel
  camGotoScale += -e.getCount() * 0.1;
}


void keyPressed() {
  // Update inputs
  inputs[keyCode] = true;

  // Ctrl + <, > - Change type of gate
  if (inputs[17] && (inputs[37] || inputs[39])) {
    Gate gateToChange = null;

    // Change currently hovered
    PVector mousePos = convertToWorld(getMousePos());
    for (Gate gate : gates) {
      if (gate.ontop(mousePos)) {
          gateToChange = gate;
          break;
      }
    }

    // If there is a gate to change find what direction
    if (gateToChange != null) {
      int typesLength = GateType.values().length;
      if (keyCode == 37) gateToChange.type = gateToChange.type.previous();
      else if (keyCode == 39) gateToChange.type = gateToChange.type.next();
    }

  // q - Toggle show direction
  } else if (keyCode == 81) {
    showDirection = !showDirection;

  // ctrl + d - duplicate selection
  } else if (inputs[17] && inputs[68]) {
    if (currentSelection != null)
      currentSelection.duplicate();

  // spacebar - toggle input gate
  } else if (inputs[32]) {
    for (Gate gate : gates) {
      if (gate.ontop(convertToWorld(getMousePos()))) {
        if (gate.type == GateType.INPUT) {
          gate.inputToggled = !gate.inputToggled;
        } else if (gate.type == GateType.CLOCK) {
          gate.clockToggled = !gate.clockToggled;
        }
      }
    }

  // ctrl + up / down - change timer length
  } else if (inputs[17] && (inputs[38] || inputs[40])) {
    int change = inputs[38] ? 4 : -4;
    for (Gate gate : gates) {
      if (gate.ontop(convertToWorld(getMousePos()))) {
        if (gate.type == GateType.TIMER) {
          gate.timerLength = max(gate.timerLength + change, 0);
          addNotification("Changed gate to length " + gate.timerLength, 120);
        }
      }
    }

  // ctrl + s - Save
  } else if (inputs[17] && inputs[83] && currentSelection != null) {
    currentSelection.saveBlueprint();

  // ctrl + o - Load
  } else if (inputs[17] && inputs[79] && availableBlueprints.size() > 0) {
    currentSelection = new Selection(availableBlueprints.get(selectedBlueprint));

  // Up arrow - change selectedBlueprint
  } else if (inputs[38] && availableBlueprints.size() > 0) {
    selectedBlueprint = ((selectedBlueprint - 1 + availableBlueprints.size()) % availableBlueprints.size());

  // Down arrow - change selectedBlueprint
  } else if (inputs[40] && availableBlueprints.size() > 0) {
    selectedBlueprint = ((selectedBlueprint + 1 + availableBlueprints.size()) % availableBlueprints.size());
  }
}


void keyReleased() {
  // Update inputs
  inputs[keyCode] = false;
}

// #endregion


// #region - Classes

class Gate {

  // #region - Setup

  // Declare variables
  GateType type;
  PVector gotoPos;
  PVector pos;

  ArrayList<Boolean> inputs;
  Boolean output;
  ArrayList<Connection> outputConnections;

  boolean inputToggled;
  boolean clockToggled;
  float clockOnTime;
  float clockTotalTime;
  float clockCurrentTime;
  ArrayList<int[]> timerInputs;
  int timerLength;


  Gate(GateType type_, PVector pos_) {
    // Initialize variables
    type = type_;
    gotoPos = pos_;
    pos = pos_;

    inputs = new ArrayList<Boolean>();
    output = false;
    outputConnections = new ArrayList<Connection>();

    inputToggled = false;
    clockToggled = false;
    clockOnTime = 64;
    clockTotalTime = 128;
    clockCurrentTime = 0;
    timerInputs = new ArrayList<int[]>();
    timerLength = 32;
  }

  // #endregion


  // #region - Calculation

  void addInput(Boolean input) {
    // Receive an input
    inputs.add(input);
  }


  // calculate the output
  void calculateOutput() {
    output = false;

    if (type == GateType.INPUT) {
      // On based on user input
      output = inputToggled;

    } else if (type == GateType.CLOCK) {
      // On based on constant ticking
      if (clockToggled) {
        clockCurrentTime = (clockCurrentTime + 1) % clockTotalTime;
        if (clockCurrentTime < clockOnTime) output = true;
      } else clockCurrentTime = 0;

    } else if (type == GateType.TIMER) {
      // Update previous inputs
      for (int i = 0; i < timerInputs.size(); i++)
        timerInputs.get(i)[0]++;
      if (timerInputs.size() > 0
      && (timerInputs.get(0)[0] - timerInputs.get(0)[1]) >= timerLength)
        timerInputs.remove(0);

      // Check whether has input
      boolean hasInput = false;
      for (Boolean input : inputs)
        if (input) hasInput = true;

      // HasInput
      if (hasInput) {

        // HasInput and recent input is off - new input
        if (timerInputs.size() == 0 || timerInputs.size() > 0
        && timerInputs.get(timerInputs.size() - 1)[2] == 1) {
          timerInputs.add(new int[] {0, 0, 0});

        // HasInput and recent input is on - increase input
        } else timerInputs.get(timerInputs.size() - 1)[1]++;

      // No input and recent input is on - end input
      } else if (timerInputs.size() > 0
      && timerInputs.get(timerInputs.size() - 1)[2] == 0)
        timerInputs.get(timerInputs.size() - 1)[2] = 1;

      // Update output
      if (timerInputs.size() > 0
      && timerInputs.get(0)[0] >= timerLength)
        output = true;

    } else if (type == GateType.AND) {
      // On if all inputs are on
      output = inputs.size() > 0 ? true : false;
      for (Boolean input : inputs)
        if (!input) output = false;

    } else if (type == GateType.NAND) {
      // On if all inputs are on
      output = inputs.size() > 0 ? true : false;
      for (Boolean input : inputs)
        if (!input) output = false;
      output = !output;

    } else if (type == GateType.NOT) {
      // On if all inputs are off
      output = true;
      for (Boolean input : inputs)
        if (input) output = false;

    } else if (type == GateType.OR) {
      // On if any inputs ore on
      output = false;
      for (Boolean input : inputs)
        if (input) output = true;

    } else if (type == GateType.XOR) {
      // On if odd inputs ore on
      output = false;
      for (Boolean input : inputs)
        if (input) output = !output;
    }

    // Clear inputs for next frame
    inputs.clear();
  }

  // #endregion


  // #region - Main

  void update() {
    // Show the gate
    movement();
    show();
  }


  void movement() {
    // Move towards gotoPos
    pos.add(gotoPos.copy().sub(pos).mult(0.4));
  }


  void show() {
    // On the screen
    if (onScreen(
      this.pos.x - gridSize * 0.5,
      this.pos.y - gridSize * 0.5)
    || onScreen(
      this.pos.x + gridSize * 0.5,
      this.pos.y + gridSize * 0.5)) {


      // Currently selected
      if (currentSelection != null && currentSelection.selectedGates.contains(this))
        stroke(colors.get("gateSelectedStroke"));

      // Not selected and hovered
      else if (ontopBody(convertToWorld(getMousePos())))
        stroke(colors.get("gateHighlightedStroke"));

      // Not selected and not hovered
      else stroke(colors.get("gateStroke"));

      // Draw main body
      fill(colors.get("gateFill"));
      rect(pos.x - gridSize * 0.5,
        pos.y - gridSize * 0.5,
        gridSize, gridSize);

      // Show gate type specific body
      if (type == GateType.INPUT) {
        beginShape();
        vertex(pos.x - gridSize * 0.3, pos.y - gridSize * 0.3);
        vertex(pos.x + gridSize * 0.3, pos.y - gridSize * 0.3);
        vertex(pos.x + gridSize * 0.3, pos.y + gridSize * 0.3);
        vertex(pos.x - gridSize * 0.3, pos.y + gridSize * 0.3);
        endShape(CLOSE);

      } else if (type == GateType.CLOCK) {
        beginShape();
        vertex(pos.x, pos.y - gridSize * 0.4);
        vertex(pos.x + gridSize * 0.4, pos.y);
        vertex(pos.x, pos.y + gridSize * 0.4);
        vertex(pos.x - gridSize * 0.4, pos.y);
        endShape(CLOSE);

      } else if (type == GateType.TIMER) {
        fill(colors.get("gateOff"));
        beginShape();
        vertex(pos.x - gridSize * 0.3, pos.y - gridSize * 0.4);
        vertex(pos.x + gridSize * 0.3, pos.y - gridSize * 0.4);
        vertex(pos.x + gridSize * 0.3, pos.y + gridSize * 0.4);
        vertex(pos.x - gridSize * 0.3, pos.y + gridSize * 0.4);
        endShape(CLOSE);

        fill(colors.get("gateOn"));
        for (int[] input : timerInputs) {
          float py0 = pos.y + gridSize * map(
            min(input[0], timerLength),
            0, timerLength, 0.4, -0.4);
          float py1 = pos.y + gridSize * map(
            min(input[0] - input[1], timerLength),
            0, timerLength, 0.4, -0.4);
          rect(pos.x - gridSize * 0.3, py0,
            gridSize * 0.6, py1 - py0);
        }

      } else if (type == GateType.AND) {
        beginShape();
        vertex(pos.x - gridSize * 0.5, pos.y);
        vertex(pos.x - gridSize * 0.45, pos.y - gridSize * 0.3);
        vertex(pos.x - gridSize * 0.3, pos.y - gridSize * 0.45);
        vertex(pos.x, pos.y - gridSize * 0.5);
        vertex(pos.x + gridSize * 0.3, pos.y - gridSize * 0.45);
        vertex(pos.x + gridSize * 0.45, pos.y - gridSize * 0.3);
        vertex(pos.x + gridSize * 0.5, pos.y);
        vertex(pos.x + gridSize * 0.5, pos.y + gridSize * 0.5);
        vertex(pos.x - gridSize * 0.5, pos.y + gridSize * 0.5);
        endShape();

      } else if (type == GateType.NAND) {
        beginShape();
        vertex(pos.x - gridSize * 0.5, pos.y);
        vertex(pos.x - gridSize * 0.45, pos.y - gridSize * 0.3);
        vertex(pos.x - gridSize * 0.3, pos.y - gridSize * 0.45);
        vertex(pos.x, pos.y - gridSize * 0.5);
        vertex(pos.x + gridSize * 0.3, pos.y - gridSize * 0.45);
        vertex(pos.x + gridSize * 0.45, pos.y - gridSize * 0.3);
        vertex(pos.x + gridSize * 0.5, pos.y);
        vertex(pos.x + gridSize * 0.5, pos.y + gridSize * 0.5);
        vertex(pos.x - gridSize * 0.5, pos.y + gridSize * 0.5);
        endShape();
        ellipse(pos.x, pos.y - gridSize * 0.4, gridSize * 0.2, gridSize * 0.2);

      } else if (type == GateType.NOT) {
        beginShape();
        vertex(pos.x - gridSize * 0.5, pos.y + gridSize * 0.5);
        vertex(pos.x, pos.y - gridSize * 0.5);
        vertex(pos.x + gridSize * 0.5, pos.y + gridSize * 0.5);
        endShape();

      } else if (type == GateType.OR) {
        beginShape();
        vertex(pos.x - gridSize * 0.5, pos.y);
        vertex(pos.x - gridSize * 0.45, pos.y - gridSize * 0.3);
        vertex(pos.x, pos.y - gridSize * 0.5);
        vertex(pos.x + gridSize * 0.45, pos.y - gridSize * 0.3);
        vertex(pos.x + gridSize * 0.5, pos.y);
        vertex(pos.x + gridSize * 0.5, pos.y + gridSize * 0.5);
        vertex(pos.x - gridSize * 0.5, pos.y + gridSize * 0.5);
        endShape();

      } else if (type == GateType.XOR) {
        beginShape();
        vertex(pos.x - gridSize * 0.5, pos.y);
        vertex(pos.x - gridSize * 0.45, pos.y - gridSize * 0.3);
        vertex(pos.x, pos.y - gridSize * 0.5);
        vertex(pos.x + gridSize * 0.45, pos.y - gridSize * 0.3);
        vertex(pos.x + gridSize * 0.5, pos.y);
        vertex(pos.x + gridSize * 0.5, pos.y + gridSize * 0.4);
        vertex(pos.x - gridSize * 0.5, pos.y + gridSize * 0.4);
        endShape();
        line(pos.x - gridSize * 0.5,
          pos.y + gridSize * 0.45,
          pos.x + gridSize * 0.5,
          pos.y + gridSize * 0.45);
      }

      // Currently selected
      if (currentSelection != null) {

        // Directly selected
        // OR Output connection selected
        if ((currentSelection.type == "Gates"
        && currentSelection.selectedGates.contains(this))
        || (currentSelection.type == "Connection"
        && currentSelection.selectedConnection.in == this))
          stroke(colors.get("gateSelectedStroke"));
      }

      // Not selected and hovered
      else if (ontopNode(convertToWorld(getMousePos())))
        stroke(colors.get("gateHighlightedStroke"));

      // Not selected and not hovered
      else stroke(colors.get("gateStroke"));

      // Show the output
      fill(getOutputColor());
      rect(pos.x - gridSize * 0.15,
        pos.y - gridSize * 0.15,
        gridSize * 0.3, gridSize * 0.3);
    }
  }


  color getOutputColor() {
    color col = output
      ? colors.get("gateOn")
      : colors.get("gateOff");
    if (type == GateType.CLOCK && !output && clockToggled)
      col = colors.get("gateMiddle");
    return col;
  }


  boolean ontop(PVector oPos) {
    // Return whether a position in anywhere ontop of the gate
    return (
      oPos.x > pos.x - gridSize * 0.5 &&
      oPos.x < pos.x + gridSize * 0.5 &&
      oPos.y > pos.y - gridSize * 0.5 &&
      oPos.y < pos.y + gridSize * 0.5
    );
  }


  boolean ontopBody(PVector oPos) {
    // Return whether a position is ontop of the gates body
    return ontop(oPos) && !ontopNode(oPos);
  }


  boolean ontopNode(PVector oPos) {
    // Return whether a position is ontop of the gates node
    return (
      oPos.x > pos.x - gridSize * 0.15 &&
      oPos.x < pos.x + gridSize * 0.15 &&
      oPos.y > pos.y - gridSize * 0.15 &&
      oPos.y < pos.y + gridSize * 0.15
    );
  }

  // #endregion
}


class Connection {

  // #region - Setup

  // Declare variables
  Gate in;
  Gate out;
  Gate hoveredGate;


  // Blank constructor
  Connection(Gate in_) {
    in = in_;
    hoveredGate = null;
  }

  // #endregion


  // #region - Main

  void propogateOutput() {
    // Propogate the output in in to out
    if (in != null && out != null)
      out.addInput(in.output);
  }


  void connect(Gate gate) {
    // Connect to a specific gate
    out = gate;
  }


  void update() {
    // Show the connection
    show();
  }


  void show() {
    // Connection is valid
    if (in != null) {
      PVector endPos = new PVector(0, 0);

      // Selected by mouse
      if (currentSelection != null && currentSelection.selectedConnection == this) {
        endPos = convertToWorld(getMousePos());
        if (hoveredGate != null) endPos = hoveredGate.pos;
        stroke(colors.get("connectionSelectedStroke"));

      // Not selected and connected
      } else if (out != null) {
        endPos = out.pos;
        hoveredGate = null;

        // Gate in is hovered
        if (in.ontopNode(convertToWorld(getMousePos())))
          stroke(colors.get("connectionSelectedStroke"));

        // Not selected, not connected and not hovered
        else stroke(colors.get("connectionStroke"));

      // Not selected and not connected
      } else {
        stroke(colors.get("error"));
      }

      // Draw connection
      if (onScreen(in.pos.x, in.pos.y) || onScreen(endPos.x, endPos.y)) {
        line(
          in.pos.x, in.pos.y,
          endPos.x, endPos.y);
          if (showDirection) {
            fill(in.getOutputColor());
            ellipse(
              in.pos.x + (endPos.x - in.pos.x) * ((frameCount / 60.0) % 1.0),
              in.pos.y + (endPos.y - in.pos.y) * ((frameCount / 60.0) % 1.0),
              5, 5
            );
          }
      }
    }
  }

  // #endregion
}


class Selection {

  // #region - Setup

  // Declare variables
  String type;
  ArrayList<Gate> selectedGates;
  ArrayList<PVector> selectedGateOffsets;
  Connection selectedConnection;


  Selection(ArrayList<Gate> gates_) {
    // Initialize variables
    selectedGates = new ArrayList<Gate>();
    selectedGateOffsets = new ArrayList<PVector>();

    // Select a group of selectedGates
    type = "Gates";
    PVector mousePos = convertToWorld(getMousePos());
    for (Gate gate : gates_) {
      selectedGates.add(gate);
      selectedGateOffsets.add(gate.pos.copy().sub(mousePos));
    }
  }


  Selection(Connection connection_) {
    // Initialize variables
    selectedGates = new ArrayList<Gate>();
    selectedGateOffsets = new ArrayList<PVector>();

    // Select a specific connection
    type = "Connection";
    selectedConnection = connection_;
  }


  Selection(String blueprintName) {
    // Initialize variables
    selectedGates = new ArrayList<Gate>();
    selectedGateOffsets = new ArrayList<PVector>();

    // Try load blueprint
    if (loadBlueprint(blueprintName))
      type = "Gates";
    else deselect();
  }

  // #endregion


  // #region - Main

  void update() {
    // Place selectedGates relative to mouse
    PVector mousePos = convertToWorld(getMousePos());
    if (type == "Gates") {
      for (int i = 0; i < selectedGates.size(); i++)
        selectedGates.get(i).gotoPos = roundToWorld(mousePos.copy().add(selectedGateOffsets.get(i)));

    // Update connections hoveredGate
    } else if (type == "Connection") {
      this.selectedConnection.hoveredGate = null;
      for (Gate gate : gates) {
        if (gate.ontop(mousePos))
          this.selectedConnection.hoveredGate = gate;
      }
    }
  }


  void deselect() {
    // Clear all selection variables
    type = "None";
    selectedGates.clear();
    selectedGateOffsets.clear();
    selectedConnection = null;
    currentSelection = null;
  }


  void duplicate() {
    if (type == "Gates") {
      // Setup new selectedGates
      ArrayList<Gate> newGates = new ArrayList<Gate>();
      for (Gate gate : selectedGates)
        newGates.add(createGate(gate.type, gate.pos.copy()));

      // Setup new selectedConnections
      for (int i = connections.size() - 1; i >= 0; i--) {
        Connection connection = connections.get(i);
        if (selectedGates.contains(connection.in)
        && selectedGates.contains(connection.out))
          createConnection(newGates.get(selectedGates.indexOf(connection.in)))
          .connect(newGates.get(selectedGates.indexOf(connection.out)));
      }

      // Deselect current gates
      deselect();
      currentSelection = new Selection(newGates);
    }
  }


  void saveBlueprint() {
    if (type == "Gates") {
      // Load, update and save meta.json
      String currentURL = getNextBlueprintURL();

      // Save gates as new JSON Array
      int index = 0;
      JSONArray gateJSONArray = new JSONArray();
      for (index = 0; index < selectedGates.size(); index++) {
        JSONObject gateData = new JSONObject();
        gateData.setString("type", selectedGates.get(index).type.name());
        gateData.setFloat("offx", selectedGateOffsets.get(index).x);
        gateData.setFloat("offy", selectedGateOffsets.get(index).y);
        gateJSONArray.setJSONObject(index, gateData);
      }

      // Save connections as new JSON Array
      index = 0;
      JSONArray connectionJSONArray = new JSONArray();
      for (Connection connection : connections) {
        if (selectedGates.contains(connection.in)
        && selectedGates.contains(connection.out)) {
          JSONObject connectionData = new JSONObject();
          connectionData.setInt("gateIn", selectedGates.indexOf(connection.in));
          connectionData.setInt("gateOut", selectedGates.indexOf(connection.out));
          connectionJSONArray.setJSONObject(index, connectionData);
          index++;
        }
      }

      // Save JSON Arrays together as a blueprint
      JSONObject blueprintJSON = new JSONObject();
      blueprintJSON.setBoolean("isBlueprint", true);
      blueprintJSON.setJSONArray("gates", gateJSONArray);
      blueprintJSON.setJSONArray("connections", connectionJSONArray);
      saveJSONObject(blueprintJSON, dataPath(currentURL));
      addNotification("Blueprint '" + currentURL + "' created", 120);
      updateAvailableBlueprints();
    }
  }


  boolean loadBlueprint(String blueprintName) {
    // Load a blueprint as a selection
    String filePath = dataPath(blueprintName);
    if (new File(filePath).exists()) {
      type = "Gates";
      selectedGates.clear();
      JSONObject blueprint = loadJSONObject(filePath);

      // Update gates
      JSONArray gateJSONArray = blueprint.getJSONArray("gates");
      for (int i = 0; i < gateJSONArray.size(); i++) {
        JSONObject gateJSON = gateJSONArray.getJSONObject(i);
        PVector pos = convertToWorld(getMousePos());
        PVector offset = new PVector(
          gateJSON.getFloat("offx"),
          gateJSON.getFloat("offy")
        );
        GateType type = GateType.valueOf(gateJSON.getString("type"));
        selectedGates.add(createGate(type, pos));
        selectedGateOffsets.add(offset);
      }

      // Average gateOffsets
      PVector average = new PVector(0, 0);
      for (PVector offset : selectedGateOffsets)
        average.add(offset);
      average.div(selectedGateOffsets.size());
      for (PVector offset : selectedGateOffsets)
        offset.sub(average);

      // Update connections
      JSONArray connectionJSONArray = blueprint.getJSONArray("connections");
      for (int i = 0; i < connectionJSONArray.size(); i++) {
        JSONObject connectionJSON = connectionJSONArray.getJSONObject(i);
        int gateInIndex = connectionJSON.getInt("gateIn");
        int gateOutIndex = connectionJSON.getInt("gateOut");
        createConnection(selectedGates.get(gateInIndex)).connect(selectedGates.get(gateOutIndex));
      }

      // URL exists and loaded
      addNotification("Loaded blueprint '" + blueprintName + "'", 120);
      updateAvailableBlueprints();
      return true;

    // URL doesnt exist
    } else {
      addNotification("Blueprint doesn't exist '" + blueprintName + "'", 120);
      updateAvailableBlueprints();
      return false;
    }
  }

  // #endregion
}


class Notification {

  // #region - Setup

  String message;
  int time;
  int maxTime;


  Notification(String message_, int time_) {
    message = message_;
    time = time_;
    maxTime = time_;
  }

  // #endregion
}

// #endregion
