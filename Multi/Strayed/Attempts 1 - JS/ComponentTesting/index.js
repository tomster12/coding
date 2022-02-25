
// #region - Main

// Declare variables
let debug;
let game;


function setup() {
  // Initialize canvas
  createCanvas(800, 800);

  // Initialize game
  debug = false;
  game = new Game();
}


function draw() {
  // Update game
  game.draw();
}


function keyPressed() {
  // Pass through to game
  game.callKeyPressed(keyCode);
}


function keyReleased() {
  // Pass through to game
  game.callKeyReleased(keyCode);
}


function mousePressed() {
  // Pass through to game
  game.callMousePressed(mouseButton);
}


function mouseReleased() {
  // Pass through to game
  game.callMouseReleased(mouseButton);
}

// #endregion


// #region - Other

function sign(num) {
  // Returns the sign of a number
  return num >= 0 ? 1 : -1;
}


function lerpAngle(from, to, weight) {
  // Lerps between 2 angles
  return to;
}

// #endregion


class Game {

  // #region - Setup

  // Static variables
  static CIRCLE = 0;
  static RECT = 1;


  constructor() {
    // Initialize variables
    this.entities = [];
    this.keyPressed = [];
    this.keyDown = [];
    this.mousePressed = [];
    this.mouseDown = [];

    // Populate entities
    this.entities.push(new Wall(this, { x: 240, y: 200 }, Game.CIRCLE, { x: 200, y: 80 }));
    this.entities.push(new Wall(this, { x: 380, y: 200 }, Game.RECT, { x: 350, y: 80 }));
    this.entities.push(new Player(this, { x: 50, y: 50 }));
    this.entities.push(new Zomb(this, { x: 50, y: 120 }));
  }

  // #endregion


  // #region - Main

  draw() {
    // Update then show
    this.update();
    this.render();
  }


  update() {
    // Update all entities
    for (let entity of this.entities) entity.update();

    // Update input
    this.keyPressed = [];
    this.mousePressed = [];
  }


  render() {
    // Show background
    background("#9a968f");

    // Show all entities
    let outputs = this.getComponents("Render");
    outputs.sort((a, b) => (a.zIndex > b.zIndex));
    for (let output of outputs) output.show();
  }


  getEntities(checkName) {
    // Returns all entities of a given type
    return this.entities.filter(ent => ent.name == checkName);
  }


  getComponents(checkTag) {
    // Returns all components of a given type
    let components = [];
    for (let entity of this.entities)
      components.push(...entity.getComponents(checkTag));
    return components;
  }

  // #endregion


  // #region - Input

  callKeyPressed(keyCode_) {
    // Update key array
    this.keyPressed[keyCode_] = true;
    this.keyDown[keyCode_] = true;
  }


  callKeyReleased(keyCode_) {
    // Update key array
    this.keyDown[keyCode_] = false;
  }


  callMousePressed(mouseButton_) {
    // Update mouse array
    this.mousePressed[mouseButton_] = true;
    this.mouseDown[mouseButton_] = true;
  }


  callMouseReleased(mouseButton_) {
    // Update mouse array
    this.mousePressed[mouseButton_] = false;
    this.mouseDown[mouseButton_] = false;
  }

  // #endregion
}


class Entity {

  // #region - Setup

  constructor(game_, name_) {
    // Initalize variables
    this.game = game_;
    this.name = name_;
    this.components = [];
  }


  require(requirements) {
    // Check other components
    // 0 - Requires to not have component
    // 1 - Requires to have component
    let rCmps = [];
    for (let req of requirements) {
      let cmps = this.getComponents(req[1]);
      if (req[0] == 0 && cmps.length == 0) { continue; }
      if (req[0] == 1 && cmps.length > 0) { rCmps.push(cmps[0]); continue; }
      throw "Requirement mismatch: " + req[0] + ", " + req[1];
    } return rCmps;
  }

  // #endregion


  // #region - Main

  update() {
    // Update all components
    for (let component of this.components) component.update();
  }


  getComponents(checkTag) {
    // Returns all components of type
    return this.components.filter(cmp => cmp.tags.indexOf(checkTag) != -1);
  }

  // #endregion
}


class Player extends Entity {

  // #region - Main

  constructor(game_, pos_) {
    // Call super
    super(game_, "Player");

    // Add components
    this.components.push(new TransformComponent(this, pos_, null, null));
    this.components.push(new MovementComponent(this));
    this.components.push(new UserControlComponent(this));
    this.components.push(new AttributeComponent(this));
    this.components.push(new BodyComponent(this, 20, "#9c4a37", 1));
    this.components.push(new CollisionComponent(this, Game.CIRCLE, { x: 20, y: 20 }, false));
  }

  // #endregion
}


class Zomb extends Entity {

  // #region - Main

  constructor(game_, pos_) {
    // Call super
    super(game_, "Zomb");

    // Add components
    this.components.push(new TransformComponent(this, pos_, null, null));
    this.components.push(new MovementComponent(this));
    this.components.push(new ZombControlComponent(this));
    this.components.push(new AttributeComponent(this));
    this.components.push(new BodyComponent(this, 15, "#35543c", 1));
    this.components.push(new CollisionComponent(this, Game.CIRCLE, { x: 15, y: 15 }, false));
  }

  // #endregion
}


class Wall extends Entity {

  // #region - Main

  constructor(game_, pos_, shape_, size_) {
    // Call super
    super(game_, "Wall");

    // Add components
    this.components.push(new TransformComponent(this, pos_, null, null));
    this.components.push(new ShapeComponent(this, shape_, size_, 0));
    this.components.push(new CollisionComponent(this, shape_, size_, true));
  }

  // #endregion
}


class Component {

  // #region - Main

  constructor(entity_, tags_) {
    // Initialize variables
    this.entity = entity_;
    this.enabled = true;
    this.tags = tags_ || [];
  }


  update() {}


  show() {
    // Catch unimplemented show call
    console.log("Show() not implemented in Visual component");
  }

  // #endregion
}


// Tags:          Transform
// Requirements:  0 Transform
class TransformComponent extends Component {

  // #region - Main

  constructor(entity_, pos_, scale_, rotation_) {
    // Call super constructor
    super(entity_, ["Transform"]);

    // Component requirements
    this.entity.require([ [0, "Transform"] ]);

    // Initialize variables
    this.pos = pos_ || { x: 0, y: 0 };;
    this.scale = scale_ || 1;
    this.rotation = rotation_ || 0;
  }


  doTransform() {
    // Transform, Scale and Rotate
    this.doTranslate();
    this.doScale();
    this.doRotate();
  }

  doTranslate() { translate(this.pos.x, this.pos.y); }
  doScale() { scale(this.scale); }
  doRotate() { rotate(this.rotation); }

  // #endregion
}


// Tags:          Render, Collision
// Requirements:  0 Collision, 1 Transform
class CollisionComponent extends Component {

  // #region - Main

  constructor(entity_, type_, size_, isKinematic_) {
    // Call super constructor
    super(entity_, ["Render", "Collision"]);

    // Component requirements
    let requirements = this.entity.require([ [0, "Collision"], [1, "Transform"] ]);
    this.tsCmp = requirements[0];

    // Intialize variables
    this.type = type_;
    this.size = size_;
    this.isKinematic = isKinematic_;
  }


  update() {
    if (this.enabled) {

      // Check collision against all other collision components
      if (!this.isKinematic) {
        let clCmps = this.entity.game.getComponents("Collision");
        for (let otherClCmp of clCmps) {
          if (otherClCmp != this) {
            this.collide(otherClCmp);
          }
        }
      }
    }
  }


  show() {
    if (this.enabled && debug) {

      // Show as circle
      if (this.type == Game.CIRCLE) {
        push();
        this.tsCmp.doTransform();
        strokeWeight(1);
        stroke("#da2d2d");
        noFill();
        ellipse(0, 0, this.size.x, this.size.x);
        pop();

      // Show as square
      } else if (this.type == Game.RECT) {
        push();
        this.tsCmp.doTransform();
        strokeWeight(1);
        stroke("#da2d2d");
        noFill();
        rect(-this.size.x * 0.5, -this.size.y * 0.5, this.size.x, this.size.y);
        pop();
      }
    }
  }


  collide(otherClCmp) {
    // Check correct collision function
    let clInfo = null;
    if (this.type == Game.CIRCLE) {
      if (otherClCmp.type == Game.CIRCLE) clInfo = Collision.circleOverlapCircle(this, otherClCmp);
      else if (otherClCmp.type == Game.RECT) clInfo = Collision.circleOverlapRect(this, otherClCmp);
    } else if (this.type == Game.RECT) {
      if (otherClCmp.type == Game.CIRCLE) clInfo = Collision.circleOverlapRect(otherClCmp, this);
      else if (otherClCmp.type == Game.RECT) clInfo = Collision.rectOverlapRect(this, otherClCmp);
    }

    // Correct position with collision info
    if (clInfo != null && clInfo.collided) {
      this.tsCmp.pos.x += clInfo.correction.x;
      this.tsCmp.pos.y += clInfo.correction.y;
    }
  }

  // #endregion
}


// Tags:          Movement
// Requirements:  1, Transform
class MovementComponent extends Component {

  // #region - Main

  constructor(entity_) {
    // Call super constructor
    super(entity_, ["Movement"]);

    // Component requirements
    let requirements = this.entity.require([ [0, "Control"], [1, "Transform"] ]);
    this.tsCmp = requirements[0];

    // Initialize variables
    this.stats = {
      moveVel: { x: 0, y: 0 },
      moveAcc: 0.4,
      moveFrc: 0.75,
      moveSpeedMax: 2.5
    };
  }


  update() {
    if (this.enabled) {

      // Update transform with velocity
      this.tsCmp.pos.x += this.stats.moveVel.x;
      this.tsCmp.pos.y += this.stats.moveVel.y;
    }
  }


  move(dir) {
    if (this.enabled) {

      // Accelerate / decelerate in direction
      if (dir.x != 0 && this.stats.moveVel.x * sign(dir.x) < this.stats.moveSpeedMax) this.stats.moveVel.x += this.stats.moveAcc * dir.x;
      else this.stats.moveVel.x *= this.stats.moveFrc;
      if (dir.y != 0 && this.stats.moveVel.y * sign(dir.y) < this.stats.moveSpeedMax) this.stats.moveVel.y += this.stats.moveAcc * dir.y;
      else this.stats.moveVel.y *= this.stats.moveFrc;
    }
  }


  aim(pos) {
    if (this.enabled) {

      // Aim at position
      let dx = pos.x - this.tsCmp.pos.x;
      let dy = pos.y - this.tsCmp.pos.y;
      let dir = atan2(dy, dx);
      this.tsCmp.rotation = lerpAngle(this.tsCmp.rotation, dir, 0.1);
    }
  }

  // #endregion
}


// Tags:          Control, User
// Requirements:  0 Control, 1 Movement
class UserControlComponent extends Component {

  // #region - Main

  constructor(entity_) {
    // Call super constructor
    super(entity_, ["Control", "User"]);

    // Component requirements
    let requirements = this.entity.require([ [0, "Control"], [1, "Movement"] ]);
    this.mvCmp = requirements[0];

    // Initialize variables
    this.walkSpeedMax = 2.5;
    this.sprintSpeedMax = 5.0;
  }


  update() {
    if (this.enabled) {

      // Call movement component with user input
      this.mvCmp.stats.moveSpeedMax = this.entity.game.keyDown[16] ? this.sprintSpeedMax : this.walkSpeedMax;
      this.mvCmp.move({
        x: (this.entity.game.keyDown[65] ? -1 : 0) + (this.entity.game.keyDown[68] ? 1 : 0),
        y: (this.entity.game.keyDown[87] ? -1 : 0) + (this.entity.game.keyDown[83] ? 1 : 0)
      });

      // Aim movement component towards mouse
      this.mvCmp.aim({ x: mouseX, y: mouseY });
    }
  }

  // #endregion
}


// Tags:          Control, Enemy
// Requirements:  0 Control, 1 Movement
class ZombControlComponent extends Component {

  // #region - Main

  constructor(entity_) {
    // Call super constructor
    super(entity_, ["Control", "User"]);

    // Component requirements
    let requirements = this.entity.require([ [0, "Control"], [1, "Movement"] ]);
    this.mvCmp = requirements[0];

    // Initialize variables
    this.walkSpeedMax = 2.5;
    this.sprintSpeedMax = 5.0;
  }


  update() {
    if (this.enabled) {

      // Aim movement component towards mouse
      this.mvCmp.aim(this.entity.game.getEntities("Player")[0].getComponents("Transform")[0].pos);
    }
  }
  // #endregion
}


// Tags:          Render, Attribute
// Requirements:  N/A
class AttributeComponent extends Component {

  // #region - Main

  constructor(entity_) {
    // Call super constructor
    super(entity_, ["Render", "Attribute"]);

    // Initialize variables
    this.stats = {
      maxHealth: 100,
      health: 70
    };
  }


  show() {
    if (this.enabled) {

      // Check if has transform
      let tsCmps = this.entity.getComponents("Transform");
      if (tsCmps.length > 0) {

        // Draw health as bar
        push();
        tsCmps[0].doTranslate();
        noStroke();
        fill("#8c2e2e");
        rect(-50, 20, 100, 10);
        fill("#38ad41");
        rect(-50, 20, 100 * this.stats.health / this.stats.maxHealth, 10);
        pop();
      }
    }
  }

  // #endregion
}


// Tags:          Render, Body
// Requirements:  1 Attribute, 1 Transform
class BodyComponent extends Component {

  // #region - Main

  constructor(entity_, size_, col_, zIndex_) {
    // Call super constructor
    super(entity_, ["Render", "Body"]);

    // Component requirements
    let requirements = this.entity.require([ [1, "Transform"], [1, "Attribute"] ]);
    this.tsCmp = requirements[0];
    this.attrCmp = requirements[1];

    // Initialize variables
    this.size = size_;
    this.col = col_;
    this.zIndex = zIndex_;
  }


  show() {
    if (this.enabled) {

      // Check if has transform
      let tsCmps = this.entity.getComponents("Transform");
      if (tsCmps.length > 0) {

        // Draw body as ellipse
        push();
        this.tsCmp.doTransform();
        strokeWeight(2);
        stroke(0);
        fill(this.col);
        ellipse(0, -this.size * 0.45, this.size * 0.5, this.size * 0.5);
        ellipse(0, this.size * 0.45, this.size * 0.5, this.size * 0.5);
        ellipse(0, 0, this.size, this.size);
        pop();
      }
    }
  }

  // #endregion
}


// Tags:          Render, Shape
// Requirements:  1, Transform
class ShapeComponent extends Component {

  // #region - Main

  constructor(entity_, type_, size_, zIndex_) {
    // Call super constructor
    super(entity_, ["Render", "Shape"]);

    // Component requirements
    let requirements = this.entity.require([ [1, "Transform"] ]);
    this.tsCmp = requirements[0];

    // Intialize variables
    this.type = type_;
    this.size = size_;
    this.zIndex = zIndex_;
  }


  show() {
    if (this.enabled) {

      // Show as circle
      if (this.type == Game.CIRCLE) {
        push();
        this.tsCmp.doTransform();
        strokeWeight(2);
        stroke(0);
        fill(255);
        ellipse(0, 0, this.size.x, this.size.x);
        pop();

      // Show as square
      } else if (this.type == Game.RECT) {
        push();
        this.tsCmp.doTransform();
        strokeWeight(2);
        stroke(0);
        fill(255);
        rect(-this.size.x * 0.5, -this.size.y * 0.5, this.size.x, this.size.y);
        pop();
      }
    }
  }

  // #endregion
}


class Collision {

  // #region - Main

  static circleOverlapCircle(circle0, circle1) {
    // Detect overlap between 2 circle
    let r0 = circle0.size.x * 0.5 * circle0.tsCmp.scale;
    let r1 = circle1.size.x * 0.5 * circle1.tsCmp.scale;
    let dx = circle1.tsCmp.pos.x - circle0.tsCmp.pos.x;
    let dy = circle1.tsCmp.pos.y - circle0.tsCmp.pos.y;
    let dist = sqrt(dx * dx + dy * dy);
    if (dist < (r0 + r1)) {
      let mult = (r0 + r1 - dist) / dist;
      let correction = { x: -dx * mult, y: -dy * mult };
      return { collided: true, correction: correction };
    } else return { collided: false, correction: null };
  }


  static circleOverlapRect(circle, rect) {
    // Calculate difference
    let r = circle.size.x * 0.5 * circle.tsCmp.scale;
    let dx = rect.tsCmp.pos.x - circle.tsCmp.pos.x;
    let dy = rect.tsCmp.pos.y - circle.tsCmp.pos.y;
    let edx = (rect.size.x * rect.tsCmp.scale * 0.5 + r) - abs(dx);
    let edy = (rect.size.y * rect.tsCmp.scale * 0.5 + r) - abs(dy);

    // Return shortest correction
    if (edx > 0 && edy > 0) {
      return { collided: true, correction: (edx < edy)
        ? { x: -edx * sign(dx), y: 0 }
        : { x: 0, y: -edy * sign(dy) } };
    } else return { collided: false, correction: null };
  }


  static rectOverlapRect(rect0, rect1) {
    // Detect overlap between rect and rect
    return { collided: false, correction: null };
  }

  // #endregion
}
