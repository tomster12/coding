
// TODO
// Visualize pathfinding use colour parameter for path
// Draw blocked nodes on drag
// Sort out weird neighbour / resizing issues


// #region - Setup

// Declare variables
let input;
let vis;


function setup() {
  // Main setup
  let canv = createCanvas(windowWidth, windowHeight);
  document.oncontextmenu = () => false;
  setupVariables();
}


function setupVariables() {
  // Intialize variables
  input = new Input();
  vis = new Visualization();
}


function windowResized() {
  // Resize canvas to match window
  resizeCanvas(windowWidth, windowHeight);
  vis.resize({ x: width, y: height });
}

// #endregion


// #region - Main

function draw() {
  // Draw visualizer
  vis.draw();

  // Input late update
  input.draw();
}


function interpColor(a, b, amount) {
  // Interpolates between colors a and b by amount
  let ah = +a.replace("#", "0x");
  let bh = +b.replace("#", "0x");

  let ar = (ah >> 24) & 0xff;
  let ag = (ah >> 16) & 0xff;
  let ab = (ah >> 8) & 0xff;
  let aa = (ah) & 0xff;

  let br = (bh >> 24) & 0xff;
  let bg = (bh >> 16) & 0xff;
  let bb = (bh >> 8) & 0xff;
  let ba = (bh) & 0xff;

  let rr = round(ar + amount * (br - ar));
  let rg = round(ag + amount * (bg - ag));
  let rb = round(ab + amount * (bb - ab));
  let ra = round(aa + amount * (ba - aa));

  return "#" + rr.toString(16) + rg.toString(16) + rb.toString(16) + ra.toString(16);
}

// #endregion


class Visualization {

  // #region - Setup

  constructor() {
    // Initialize and declare variables
    this.pos = { x: 0, y: 0 };
    this.size = { x: width, y: height };

    this.nodes = [];
    this.nodeSize = 30;
    this.nodeGridSize = {
      x: floor(this.size.x / this.nodeSize),
      y: floor(this.size.y / this.nodeSize) };

    this.startNode = null;
    this.endNode = null;

    // Initialize nodes
    this.initNodes();
  }


  resize(size_) {
    // Resize visualization
    let oldSize = this.size;
    let oldNodeGridSize = this.nodeGridSize;
    this.size = size_;
    this.nodeGridSize = {
      x: floor(this.size.x / this.nodeSize),
      y: floor(this.size.y / this.nodeSize) };

    // Reinitialize nodes
    if (this.nodeGridSize.x != oldNodeGridSize.x
    || this.nodeGridSize.y != oldNodeGridSize.y) {

      // Check if any nodes cut off
      if (this.size.x < oldSize.x || this.size.y < oldSize.y) {
        for (let x = 0, found = true; x < oldNodeGridSize.x; x++ && !found) {
          for (let y = 0; y < oldNodeGridSize.y; y++ && !found) {
            if (x >= this.nodeGridSize.x || y >= this.nodeGridSize.y) {
              if (this.nodes[x][y].state == Node.STATE.UNVISITED) continue;
              else if (this.nodes[x][y].state == Node.STATE.START) this.clearPath(false, false);
              else this.clearPath(true, false);
            }
          }
        }
      }

      // Initialize new nodes
      this.initNodes();
    }
  }


  initNodes() {
    // Add missing nodes
    for (let x = 0; x < this.nodeGridSize.x; x++) {
      if (this.nodes[x] == null) this.nodes[x] = [];
      for (let y = 0; y < this.nodeGridSize.y; y++) {
        if (this.nodes[x][y] == null) {
          this.nodes[x][y] = new Node(this,
            { x: this.pos.x + (x + 0.5) * this.nodeSize,
              y: this.pos.y + (y + 0.5) * this.nodeSize },
            { x, y },
            this.nodeSize);
        }
      }

      // Delete extra in each row
      while (this.nodes[x].length > this.nodeGridSize.y) this.nodes[x].splice(this.nodeGridSize.y, 1);
    }

    // Delete extra columns
    while (this.nodes.length > this.nodeGridSize.x) this.nodes.splice(this.nodeGridSize.x, 1);

    // Setup neighbours
    let directions = [ [-1, 0], [0, -1], [1, 0], [0, 1] ];
    for (let x = 0; x < this.nodeGridSize.x; x++) {
      for (let y = 0; y < this.nodeGridSize.y; y++) {
        this.nodes[x][y].initNeighbours(this.nodes, directions);
      }
    }
  }


  clearPath(keepStart, keepEnd) {
    // Remove start and end
    if (!keepStart && this.startNode != null) this.startNode.setState(Node.STATE.UNVISITED);
    if (!keepEnd && this.endNode != null) this.endNode.setState(Node.STATE.UNVISITED);

    // Remove current path
    if (this.path != null) {
      for (let i = 1; i < this.path.length - 1; i++)
        this.path[i].state = Node.STATE.UNVISITED;
      this.path = null;
    }
  }

  // #endregion


  // #region - Draw

  draw() {
    background("#ffffff");

    // Draw main path
    if (this.path != null) this.drawPath(this.path);

    // Draw nodes
    for (let x = 0; x < this.nodeGridSize.x; x++) {
      for (let y = 0; y < this.nodeGridSize.y; y++) {
        this.nodes[x][y].draw();
      }
    }
  }


  drawPath(path) {
    // Draw a given path with last nodes colour
    let col = Node.CFG[path[path.length - 1].state].colour;
    let sz = this.nodeSize * Node.CFG[path[path.length - 1].state].pathScale;
    for (let i = 0; i < path.length - 1; i++) {
      this.path[i].drawPathTo(this.path[i + 1], sz, col);
    }
  }


  nodeClicked(node) {
    // Unset start node
    if (node == this.startNode) {
      this.clearPath(false, true);

    // Unset end node
    } else if (node == this.endNode) {
      this.clearPath(true, false);

    } else {
      // Set any to blocked
      if (input.mouse.clicked.center) {
        this.clearPath(true, true);
        if (node.state != Node.STATE.BLOCKED)
          node.setState(Node.STATE.BLOCKED);
        else node.setState(Node.STATE.UNVISITED);
        this.pathfindStartEnd();

      } else {
        // Set any to start
        if (this.startNode == null) {
          node.setState(Node.STATE.START);
          if (this.endNode != null)
            this.pathfindStartEnd();

        // Set any to end
        } else {
          this.clearPath(true, false);
          node.setState(Node.STATE.END);
          this.pathfindStartEnd();
        }
      }
    }
  }


  getHoverColor(node) {
    // Toggle start / end to unvisited
    if (node == this.startNode || node == this.endNode) {
      return Node.CFG[node.state].colour;

    // Hovering potential start
    } else if (this.startNode == null) {
      return Node.CFG[Node.STATE.START].colour;

    // Hovering blocked
    } else if (node.state == Node.STATE.BLOCKED) {
      return Node.CFG[Node.STATE.BLOCKED].colour;

    // Hovering potential end
    } else {
      return Node.CFG[Node.STATE.END].colour;
    }
  }

  // #endregion


  // #region - Pathfinding

  pathfindStartEnd() {
    // Pathfind between start and end node and save
    if (this.startNode != null && this.endNode != null) {
      this.path = this.pathfind(this.startNode, this.endNode);
      if (this.path != null) {
        for (let i = 1; i < this.path.length - 1; i++) {
          this.path[i].state = Node.STATE.PATH;
        }
      }
    }
  }


  pathfind(startNode, endNode) {
    // Heuristic function
    let h = (g1, g2) => {
      let dx = (g2.x - g1.x);
      let dy = (g2.y - g1.y);
      return dx * dx + dy * dy;
    };

    // Reset node values
    for (let x = 0; x < this.nodeGridSize.x; x++) {
      for (let y = 0; y < this.nodeGridSize.y; y++) {
        this.nodes[x][y].pfParent = null;
        this.nodes[x][y].pfGScore = Infinity;
        this.nodes[x][y].pfFScore = Infinity;
      }
    }

    // Initialize startNode and the open set
    startNode.pfParent = null;
    startNode.pfGScore = 0;
    startNode.pfFScore = h(startNode.gridPos, endNode.gridPos);
    let open = [ startNode ];

    // Get lowest f score open node
    while (open.length != 0) {
      let current = open.reduce((p, n) => (n.pfFScore < p ? n : p));

      // Found end so construct path
      if (current == endNode) {
        let path = [];
        while (current != null) {
          path.unshift(current);
          current = current.pfParent;
        } return path;
      }

      // Check each neighbour
      open.splice(open.indexOf(current), 1);
      for (let nb of current.neighbours) {
        if (nb.state != Node.STATE.BLOCKED) {
          let pfPGScore = current.pfGScore + h(current.gridPos, nb.gridPos);

          // Add to open if new closest
          if (pfPGScore < nb.pfGScore) {
            nb.pfParent = current;
            nb.pfGScore = pfPGScore;
            nb.pfFScore = pfPGScore + h(nb.gridPos, endNode.gridPos);
            if (open.indexOf(nb) == -1) open.push(nb);
          }
        }
      }
    }

    // Could not find path
    console.log("No path found");
    return null;
  }

  // #endregion
}


class Node {

  // #region - Setup

  // Static variables
  static STATE = { UNVISITED: 0, START: 1, END: 2, PATH: 3, BLOCKED: 4 };
  static CFG = {
    hoverScale: 0.65,
    sizeInterp: 0.3,
    colourInterp: 0.3,
    0: { colour: "#e9e9e9ff", scale: 0.2 },
    1: { colour: "#2ad6b8ff", scale: 0.5 },
    2: { colour: "#70d963ff", scale: 0.5, pathScale: 0.2 },
    3: { colour: null, scale: 0 },
    4: { colour: "#1c1c20ff", scale: 0.5, pathScale: 0.25 } };


  constructor(vis_, pos_, gridPos_, nodeSize_) {
    // Declare and initialize variables
    this.vis = vis_;
    this.pos = pos_;
    this.gridPos = gridPos_;
    this.nodeSize = nodeSize_;

    this.size = null;
    this.gotoSize = null;
    this.colour = null;
    this.gotoColor = null;

    this.hovered = false;
    this.state = Node.STATE.UNVISITED;
    this.neighbours = [];
  }


  reset() {
    // Reset variables
    this.hovered = false;
    this.state = Node.STATE.UNVISITED;
    this.neighbours = [];
  }


  initNeighbours(nodes, directions) {
    // Check each direction
    for (let dir of directions) {
      let nx = this.gridPos.x + dir[0];
      let ny = this.gridPos.y + dir[1];
      if (nx >= 0 && nx < nodes.length
      && ny >= 0 && ny < nodes[nx].length) {

        // Add neighbour if needed
        this.neighbours.push(nodes[nx][ny]);
      }
    }
  }

  // #endregion


  // #region - Main

  draw() {
    // Update hovered and clicked
    this.hovered = dist(mouseX, mouseY, this.pos.x, this.pos.y) < this.nodeSize * 0.5;
    if (this.hovered && Object.keys(input.mouse.clicked).length != 0) this.click();

    // Interpolate size
    this.gotoSize = this.nodeSize * (this.hovered ? Node.CFG.hoverScale : Node.CFG[this.state].scale);
    if (this.size == null || this.gotoSize == null) this.size = this.gotoSize;
    if (this.size != this.gotoSize) this.size += (this.gotoSize - this.size) * Node.CFG.sizeInterp;

    // Interpolate colour
    this.gotoColor = (this.hovered ? this.vis.getHoverColor(this) : Node.CFG[this.state].colour);
    if (this.colour == null || this.gotoColor == null) this.colour = this.gotoColor;
    if (this.colour != this.gotoColor) this.colour = interpColor(this.colour, this.gotoColor, Node.CFG.colourInterp);

    // Draw as ellipse
    if (this.colour != null) {
      fill(color(this.colour));
      noStroke();
      ellipse(this.pos.x, this.pos.y, this.size, this.size);
    }

    // Blocked so draw path to nearby blocked
    if (this.state == Node.STATE.BLOCKED) {
      for (let n of this.neighbours) {
        if (n.state == Node.STATE.BLOCKED
        && (n.gridPos.x > this.gridPos.x
        || n.gridPos.y > this.gridPos.y)) {
          this.drawPathTo(n,
            this.nodeSize * Node.CFG[Node.STATE.BLOCKED].pathScale,
            Node.CFG[Node.STATE.BLOCKED].colour
          );
        }
      }
    }
  }


  drawPathTo(node, sz, col) {
    // Draws a path to a given node
    strokeWeight(sz);
    stroke(color(col));
    line(
      this.pos.x, this.pos.y,
      node.pos.x, node.pos.y
    );
  }



  click() {
    // Pass clicked through to visualizer
    this.vis.nodeClicked(this);
  }


  setState(state) {
    // Unset vis current start / end state
    if (this.state == Node.STATE.START) this.vis.startNode = null;
    if (this.state == Node.STATE.END) this.vis.endNode = null;

    // Set state
    this.state = state;

    // Set vis current start / end state
    if (state == Node.STATE.START) this.vis.startNode = this;
    if (state == Node.STATE.END) this.vis.endNode = this;
  }

  // #endregion
}