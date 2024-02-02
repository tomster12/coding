
// #region - Main

ArrayList<Gate> gates;
ArrayList<Connection> connections;
Object selected;
PVector offset = new PVector(0, 0);
PVector gotoOffset = new PVector(0, 0);
float nMouseX = 0, nMouseY = 0;

float IOSize = 10;
float gateSize = 50;
int gateTypeLimit = 4;

String[] gateTypeText = new String[] {
  "OR",
  "NOR",
  "XOR",
  "AND"
};

color[] colours = new color[] {
  // 0 - Background
  color(146, 168, 158),

  // 1 - IO On
  color(78, 147, 88),

  // 2 - IO Off
  color(241, 80, 37),

  // 3 - gate fill
  color(212, 242, 219),

  // 4 - Gate outline stroke
  color(60, 71, 75),

  // 5 - Gate IO stroke
  color(60, 71, 75),

  // 6 - Connection outline stroke
  color(60, 71, 75),

  // 7 - Connection IO stroke
  color(60, 71, 75),

  // 8 - tooltip text stroke
  color(255, 255, 255),

  // 9 - Gate type text stroke
  color(0, 0, 0)
};

int[] strokeWeights = new int[] {
  2, // Gate outline
  2, // Gate IO
  2, // Connection line
  2, // Connection IO
  3, // Manual In
};
String[][][] tooltips = new String[][][] {
  { // Not selected and not hover
    {}
  },

  { // Not selected and hover
    {"X - Delete connection", "LMB - Pickup connection"},
    {"X - Delete gate", "LMB - Pickup gate", "Space - Grab output", "Shift - Manual input", "W - Type up", "S - Type down"}
  },

  { // Selected and not hover
    {"X - Delete connection", "LMB - Drop connection"},
    {"X - Delete gate", "LMB - Place gate"},
  },

  { // Selected and hover
    {"LMB - Connect to gate"}
  }
};


void setup() {
  size(600, 600);
  setupGates();
  setupStart();
}


void setupGates() {
  gates = new ArrayList<Gate>();
  connections = new ArrayList<Connection>();
}


void setupStart() {
  gates.add(new Gate(new PVector(200, 300), 0));
  gates.add(new Gate(new PVector(400, 300), 0));
  gates.add(new Gate(new PVector(300, 200), 0));
}

// #endregion


// #region - Main

void draw() {
  background(colours[0]);
  translate(offset.x, offset.y);

  updateGates();
  updateConnections();
  updateTooltip();
  updateMovement();
}


void updateGates() {
  for (Gate gate : gates)
    gate.calculateOutput();
  for (Gate gate : gates)
    gate.sendOutput();
  for (Gate gate : gates)
    gate.update();
}


void updateConnections() {
  for (int i = 0; i < connections.size(); i++)
    connections.get(i).update();
}


void updateTooltip() {
  ArrayList<Object> hovered = getHovered();
  int hoverType = getHoverType();

  // Not selected and not hover
  if (hoverType == -1) {

  // Not selected and hover
  } else if (hoverType == 0)
    tooltip(1, hovered.get(0).type);

  // Selected and no hover OR gate
  else if (hoverType == 1 || selected.type == 1)
    tooltip(2, selected.type);

  // Selected and hover
  else if (hoverType == 2)
    tooltip(3, 0);
}


void updateMovement() {
  if (keyPressed) {
    if (keyCode == 37) gotoOffset.x += 3;
    if (keyCode == 38) gotoOffset.y += 3;
    if (keyCode == 39) gotoOffset.x -= 3;
    if (keyCode == 40) gotoOffset.y -= 3;
  }
  PVector dir = gotoOffset.copy().sub(offset).mult(0.05);
  offset.add(dir);
  nMouseX = mouseX - offset.x;
  nMouseY = mouseY - offset.y;
}

// #endregion


// #region - Connections

Connection createConnection(Gate g) {
  // Create connection from gate, add to gates and connections
  Connection cn = new Connection(g);
  g.connections.add(cn);
  connections.add(cn);
  return cn;
}
Connection createConnection(Gate ig, Gate og) {
  // Create connection from gate to gate, add to gates and connections
  Connection cn = new Connection(ig, og);
  connections.add(cn);
  ig.connections.add(cn);
  return cn;
}


void removeConnection(Connection cn) {
  // Remove connection from connections and from gates
  cn.in.connections.remove(cn);
  if (cn.out != null)
    cn.out.connections.remove(cn);
  connections.remove(cn);
}


void connectConnection(Object cnObj, Object gObj) {
  // Connect a connection to a gate
  Connection cn = cnObj.connection;
  Gate ig = cn.in;
  Gate oog = cn.out;
  Gate nog = gObj.gate;

  // Cannot connect to self
  if (ig == nog) {
    error("Cannot connect gate to self");
    return;
  }

  // Cannot connect if already exists
  for (int i = 0; i < nog.connections.size(); i++) {
    Connection ocn = nog.connections.get(i);
    if (ocn.in == ig || ocn.out == ig) {
      error("Connection already exists");
      return;
    }
  }

  // Remove old gate
  if (oog != null)
    oog.connections.remove(cn);

  // Add to new gate
  nog.connections.add(cn);
  cn.out = nog;
}

// #endregion


// #region - Input

void mousePressed() {
  // Select / Deselect / Connect
  ArrayList<Object> hovered = getHovered();
  int hoverType = getHoverType();

  // Not select and not hover
  if (hoverType == -1) {
    gates.add(new Gate(new PVector(nMouseX, nMouseY), 0));

  // Not selected and hover
  } else if (hoverType == 0) {
    hovered.get(0).select();

  // Selected and no hover
  } else if (hoverType == 1) {
    selected.deselect();

  // Selected and hover
  } else if (hoverType == 2) {

    // If holding a connection and over a gate connect
    if (selected.type == 0 && hovered.get(0).type == 1) {
      connectConnection(selected, hovered.get(0));
    }
    selected.deselect();
  }
}


void keyPressed() {
  ArrayList<Object> hovered = getHovered();
  int hoverType = getHoverType();
  Object cHover;

  if (hoverType != -1) {
    switch (keyCode) {

    // Tab (Debug)
    case 9:
      cHover = hovered.get(0);
      if (hoverType == 0 || hoverType == 2) {
        if (cHover.type == 1) {
          print("\nHovered input size: " + cHover.gate.in.size());
        }
      }
      break;


    // x
    case 88:
      // Delete currently hovered
      if (hoverType == 0) {
        cHover = hovered.get(0);
        cHover.delete();

      // Delete currently selected
      } else {
        selected.delete();
        selected.deselect();
      }
      break;

    // Space
    case 32:
      if (hoverType == 0) {
        cHover = hovered.get(0);

        // Create connection from gate and select it
        if (cHover.type == 1) {
          Connection cn = createConnection(cHover.gate);
          new Object(cn).select();
        }
      }
      break;

    // Shift
    case 16:
      if (hoverType == 0 || (hoverType == 2 && selected.type == 0))
        cHover = hovered.get(0);
      else cHover = selected;

      if (cHover.type == 1)
        cHover.gate.manualIn = !cHover.gate.manualIn;
      break;

    // w
    case 87:
      if (hoverType == 0 || (hoverType == 2 && selected.type == 0))
        cHover = hovered.get(0);
      else cHover = selected;

      if (cHover.type == 1)
        cHover.gate.type = (cHover.gate.type + 1) % gateTypeLimit;
      break;

    // s
    case 83:
      if (hoverType == 0 || (hoverType == 2 && selected.type == 0))
        cHover = hovered.get(0);
      else cHover = selected;

      if (cHover.type == 1)
        cHover.gate.type = cHover.gate.type - 1 < 0 ? gateTypeLimit - 1 : cHover.gate.type - 1;
      break;
    }
  }
}

// #endregion


// #region - Other

void error(String str) {
  print("\n" + str);
}


void tooltip(int type, int ind) {
  int ml = 0;
  String[] currentTips = tooltips[type][ind];
  for (int i = 0; i < currentTips.length; i++) {
    if (currentTips[i].length() >= ml) {
      ml = currentTips[i].length() + 1;
    }
  }

  // Calculate size of box based on text
  int tSize = 14;
  int bSize = 10;
  float sX = bSize*2 + ml*tSize/2;
  float sY = bSize*2 + currentTips.length*tSize;

  // Draw tooltip and text
  noStroke();
  fill(0, 150);
  rect(nMouseX, nMouseY, sX, sY);

  fill(colours[8]);
  textSize(tSize);
  textAlign(LEFT);
  for (int i = 0; i < currentTips.length; i++) {
    text(currentTips[i], nMouseX + bSize, nMouseY + bSize + (i+1)*tSize);
  }
}


int getHoverType() {
  ArrayList<Object> hovered = getHovered();
  Boolean hovering = hovered.size() > 0;

  // Not selected and no hover  - 00
  if (selected == null) {
    if (!hovering) {
      return -1;

    // Not selected and hover   - 01
    } else {
      return 0;
    }
  } else {

    // Selected and no hover    - 10
    if (!hovering) {
      return 1;

    // Selected and hover       - 11
    } else {
      return 2;
    }
  }
}


ArrayList<Object> getHovered() {
  // List of hovered objects, connections first
  ArrayList<Object> hovered = new ArrayList<Object>();

  // For each connection
  for (int i = 0; i < connections.size(); i++) {
    Connection cc = connections.get(i);

    // If hovering and not selected
    if (!(selected != null && selected.connection == cc) && cc.isHovered()) {
      hovered.add(new Object(cc));
    }
  }

  // For each gate
  for (int i = 0; i < gates.size(); i++) {
    Gate cg = gates.get(i);

    // If hovering and not selected
    if (!(selected != null && selected.gate == cg) && cg.isHovered()) {
      hovered.add(new Object(cg));
    }
  }
  return hovered;
}


// #endregion
