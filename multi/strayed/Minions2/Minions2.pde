
//        TODONE
// Basic minion class heirarchy
// Started implementing basic Blob species
// Basic player class
// Minions size based on max health
// Minions untame while outside of range
// Stroke weight increase / white underglow when selected
// Dynamic system for showing health / ability bars under
//    players and minions
// Show bar under player for cooldown of attack and health
//    if health isnt max
// Bars under minions for health


//        TODO
// Start implementing dungeons
// Change colours / add background to make it more visible
// Enemies that can attack / be attacked
// Better indicator for tamed / controllable minions
// Implement player camera control (follow / zoom)
// Select minions / move to position / follow
// Minions color based on health / max health
// Stats UI for when selecting singular / multiple minions
// implement minions that dont untame / non wild variants
// Able to select minions and have stats / list shown


//      THINKING SPACE
// Clicking with no selection will perform headbutt of sorts

// Can only select blobs that are tamed
// When minion selected need to be able to target enemy by clicking
// This will change their mode from FOLLOWING to ATTACKING and
//    Set a attackTarget variable
// If they detect this variable is null they will return to following
// If blobs selected and click on player they will return to following

// When they are attacking they do not perform untame / follow AI
// After their target is dead they will return to following in turn
//    meaning if you walked too far away they will untame (for Blob anyway)

// Blob attack needs to be:
//    Traverse towards target
//    Repeatedly "headbutt" similar to player attack
// Enemies need to be able to damage them back
// Most will deal contact damage
// Blobs need to keep track of when they are attacking so they can
//    Correctly deal / take damage


//      MAIN IDEA
// Top down dungeon crawlery game
// Randomly generated dungeons
// Minions with different stats
// Different player classes / upgradeable
// Upgradeable minions

// Minions will follow player and
//    perform abilities based on ai

// Minion stats:
//    speed
//    color
//    size
//    health
//    traits

// Predefined species of minions
// Random variation
// Some minions support


// #region - Setup

// Declare variables
HashMap<String, PImage> images;
Player player;
ArrayList<Minion> minions;


void setup() {
  // Preload images
  images = new HashMap<String, PImage>();
  images.put("glow", loadImage("glow.png"));

  // Main setup
  size(800, 800);
  imageMode(CENTER);
  setupVariables();
}


void setupVariables() {
  // Initialize variables
  player = new Player(new PVector(width * 0.5, height * 0.5));
  minions = new ArrayList<Minion>();

  // Populate minions
  for (int i = 0; i < 50; i++)
    minions.add(new Blob(new PVector(random(width * 4) - width * 2, random(height * 4) - height * 2)));
}

// #endregion


// #region - Main

void draw() {
  // Main draw
  background(137, 185, 123);

  // if (minions.size() > 0) {
  //   // Set closest to first
  //   closestMinion = minions.get(0);
  //   closestMinionDist = dist(
  //     getWorldMouseX(), getWorldMouseY(),
  //     minions.get(0).pos.x, minions.get(0).pos.y);
  //
  //   // Loop over all minions
  //   for (Minion minion : minions) {
  //     float currentDist = dist(
  //       getWorldMouseX(), getWorldMouseY(),
  //       minion.pos.x, minion.pos.y);
  //
  //       // If closer then update
  //       if (currentDist < closestMinionDist) {
  //         closestMinion = minion;
  //         closestMinionDist = currentDist;
  //       }
  //     }
  // } else {
  //
  //   // No minions to be closest
  //   closestMinion = null;
  //   closestMinionDist = -1;
  // }

  // Update player and minions
  for (Minion minion : minions) minion.update();
  player.update();
  for (Minion minion : minions) minion.lateUpdate();
  player.lateUpdate();

  // Show player and minions
  player.transformCamera();
  noStroke();
  fill(#6e6e6e);
  rect(0, 0, width * 0.5, 50);
  for (Minion minion : minions) minion.earlyShow();
  player.earlyShow();
  for (Minion minion : minions) minion.show();
  player.show();
  for (Minion minion : minions) minion.lateShow();
  player.lateShow();
}


float getWorldMouseX() {
  // Return where the mouse is in the world
  return mouseX + player.pos.x - width * 0.5;
}


float getWorldMouseY() {
  // Return where the mouse is in the world
  return mouseY + player.pos.y - height * 0.5;
}


PVector getWorldMousePos() {
  // Return the world mouse position as a vector
  return new PVector(
    getWorldMouseX(),
    getWorldMouseY()
  );
}

// #endregion


// #region - Input

void keyPressed() {
  player.keyPressed();
}


void keyReleased() {
  player.keyReleased();
}


void mousePressed() {
  player.mousePressed();
}


void mouseReleased() {
  player.mouseReleased();
}

// #endregion


class Player {

  // #region - Setup

  // Declare variables
  ArrayList<VisualBar> visualBars;
  ArrayList<Minion> controlledMinions;
  boolean[] inputs;
  int mouseInput;

  PVector otherVel;
  PVector pos;
  int size;
  float maxHealth;
  float health;

  PVector movementVel;
  float movementSpeed;
  float movementSpeedMax;
  float movementFriction;

  PVector attackVel;
  float attackCooldown;
  float attackMaxCooldown;
  float attackPower;


  Player(PVector pos_) {
    // Initialize variables
    visualBars = new ArrayList<VisualBar>();
    controlledMinions = new ArrayList<Minion>();
    inputs = new boolean[400];
    mouseInput = 0;

    otherVel = new PVector(0, 0);
    pos = pos_;
    size = 40;
    maxHealth = 100;
    health = 100;

    movementVel = new PVector(0, 0);
    movementSpeed = 1;
    movementSpeedMax = 5;
    movementFriction = 0.92;

    attackVel = new PVector(0, 0);
    attackCooldown = 60;
    attackMaxCooldown = 60;
    attackPower = 15;

    // Populate visual bars
    visualBars.add(new VisualBar("Health", health, maxHealth, color(#62cf70), color(#933838)));
    visualBars.add(new VisualBar("Attack", attackCooldown, attackMaxCooldown, color(#c4b770), color(#aba371)));
  }

  // #endregion


  // #region - Main

  void update() {
    // Update attack cooldown
    if (attackCooldown < attackMaxCooldown)
      attackCooldown++;

    // Main update
    movement();
    updateVisualBars();
  }


  void lateUpdate() {
    // Late update
  }


  void earlyShow() {
    // Show glow if hovered
    if (hovered()) {
      tint(#6298af);
      image(images.get("glow"),
        pos.x, pos.y, size * 1.75, size * 1.75);
    }
  }


  void show() {
    // Show ellipse as body
    stroke(#455961);
    fill(#6298af);
    ellipse(pos.x, pos.y, size, size);
  }


  void lateShow() {
    // Late show
    showBars();
  }


  void movement() {
    // Handle movement
    if (inputs[65]) movementVel.x -= movementSpeed;
    if (inputs[87]) movementVel.y -= movementSpeed;
    if (inputs[68]) movementVel.x += movementSpeed;
    if (inputs[83]) movementVel.y += movementSpeed;
    movementVel.setMag(min(movementVel.mag(), movementSpeedMax));

    // Friction
    otherVel.mult(movementFriction);
    movementVel.mult(movementFriction);
    attackVel.mult(movementFriction);

    // Update position
    pos.add(totalVel());
  }


  void updateVisualBars() {
    // Update the values of the visual bars
    visualBars.get(0).value = health;
    visualBars.get(1).value = attackCooldown;
  }


  void transformCamera() {
    // Move the camera to centre on player
    translate(width * 0.5 - pos.x, height * 0.5 - pos.y);
  }


  void showBars() {
    // // Temporary bar formatting
    float barOffsetY = 12;
    float barWidth = 40;
    float barHeight = 6;

    // Show health / tame bars
    noStroke();
    int count = 0;
    for (VisualBar visualBar : visualBars) {
      if (visualBar.value != visualBar.maxValue) {
        count++;
        fill(visualBar.maxValueCol);
        rect(
          pos.x - barWidth / 2,
          pos.y + size / 2 + barOffsetY * count - barHeight / 2,
          barWidth, barHeight);
        fill(visualBar.valueCol);
        rect(
          pos.x - barWidth / 2,
          pos.y + size / 2 + barOffsetY * count - barHeight / 2,
          barWidth * visualBar.value / visualBar.maxValue, barHeight);
      }
    }
  }


  PVector totalVel() {
    // Return the sum of all velocities
    return otherVel.copy().add(movementVel).add(attackVel);
  }


  boolean hovered() {
    // Return whether this minion is being hovered
    return dist(
      getWorldMouseX(),
      getWorldMouseY(),
      pos.x, pos.y
    ) - size / 2 < size;
  }

  // #endregion


  // #region - Input

  void keyPressed() {
    inputs[keyCode] = true;

    // Double tamed minions (TODO TMP)
    if (keyCode == 9) {
      int amount = controlledMinions.size();
      for (int i = 0; i < amount; i++)
        minions.add(new Blob(controlledMinions.get(i).pos.copy()));
    }
  }


  void keyReleased() {
    inputs[keyCode] = false;
  }


  void mousePressed() {
    mouseInput = mouseButton;

    // Attack towards mouse
    if (attackCooldown == attackMaxCooldown) {
      PVector dir = getWorldMousePos().sub(pos).normalize();
      attackVel.add(dir.mult(attackPower));
      attackCooldown = 0;
    }
  }


  void mouseReleased() {
    mouseInput = 0;
  }

  // #endregion
}


// Class for static values
static class MinionState {

  // #region - Setup

  // Declare and initialize static variables
  static int IDLE = 0;
  static int FOLLOW = 1;
  static int ATTACK = 2;
  static int STAY = 3;

  // #endregion
}


// Parent class for all minion sub classes
abstract class Minion {

  // #region - Setup

  // Declare variable
  ArrayList<VisualBar> visualBars;
  PVector vel;
  PVector pos;
  int mode;

  float maxHealth;
  float health;
  float size;

  float strokeWidth;
  color strokeColor;
  color fillColor;


  Minion() {}


  void initializeVariables(PVector pos_, float maxHealth_, color strokeColor_, color fillColor_) {
    // Initialize variables
    visualBars = new ArrayList<VisualBar>();
    vel = new PVector(0, 0);
    pos = pos_;
    mode = MinionState.IDLE;

    maxHealth = maxHealth_;
    health = maxHealth * (0.1 + random(0.8));
    size = 2 * sqrt(maxHealth / PI);

    strokeWidth = 1;
    strokeColor = strokeColor_;
    fillColor = fillColor_;

    // Populate visual Bars
    visualBars.add(new VisualBar("Health", health, maxHealth, color(#62cf70), color(#933838)));
  }

  // #endregion


  // #region - Main

  void update() {
    // Update
    movement();
    ai();
    overlap();
  }


  void lateUpdate() {
    // Late update
  }


  void earlyShow() {
    // Show glow if hovered
    if (hovered()) {
      tint(fillColor);
      image(images.get("glow"),
        pos.x, pos.y, size * 2, size * 2);
    }
  }


  void show() {
    // Show as an ellipse
    strokeWeight(strokeWidth);
    stroke(strokeColor);
    fill(fillColor);
    ellipse(pos.x, pos.y, size, size);
    strokeWeight(1);
  }


  void lateShow() {
    // Late show
    if (hovered())
      showBars();
  }


  void movement() {
    // velocity
    vel.mult(0.94);
    pos.add(vel);
  }


  void showBars() {
    // // Temporary bar formatting
    float barOffsetY = 12;
    float barWidth = 40;
    float barHeight = 6;

    // Show health / tame bars
    noStroke();
    for (int i = 0; i < visualBars.size(); i++) {
      fill(visualBars.get(i).maxValueCol);
      rect(
        pos.x - barWidth / 2,
        pos.y + size / 2 + barOffsetY * (i + 1) - barHeight / 2,
        barWidth, barHeight);
      fill(visualBars.get(i).valueCol);
      rect(
        pos.x - barWidth / 2,
        pos.y + size / 2 + barOffsetY * (i + 1) - barHeight / 2,
        barWidth * visualBars.get(i).value / visualBars.get(i).maxValue, barHeight);
    }
  }


  void overlap() {
    // Prevent overlap of other minions
    for (Minion minion : minions) {
      if (minion != this) {
        float distToMinion = dist(pos.x, pos.y, minion.pos.x, minion.pos.y);
        if (distToMinion < size / 2 + minion.size / 2) {
          PVector dir = PVector.sub(pos, minion.pos).normalize();
          vel.add(dir.mult(0.2 / distToMinion * distToMinion));
        }
      }
    }
  }


  boolean hovered() {
    // Return whether this minion is being hovered
    return dist(
      getWorldMouseX(),
      getWorldMouseY(),
      pos.x, pos.y
    ) - size / 2 < size;
  }


  abstract void ai();

  // #endregion
}


// Friendly blob minion sub class
class Blob extends Minion {

  // #region - Setup

  // Declare variables
  float untameDist;
  float visionDist;
  float followDist;
  float closeDist;
  boolean tamed;

  float movementSpeed;
  float movementAngleAlt;
  int movementTimer;
  int movementTimerMax;

  color defaultStrokeColor;
  color hoverStrokeColor;
  color selectStrokeColor;
  color defaultFillColor;


  Blob(PVector pos_) {
    // Initialize variables
    super();
    untameDist = 350 + random(50);
    visionDist = 175 + random(50);
    followDist = 70 + random(70);
    closeDist = 30 + random(20);
    tamed = false;

    movementSpeed = 3.5 + random(1);
    movementAngleAlt = -PI * (0.2 + random(0.15));
    movementTimer = 0;
    movementTimerMax = 4 + floor(random(5));

    defaultStrokeColor = color(#ab9b52);
    hoverStrokeColor = color(#c4b880);
    selectStrokeColor = color(#f4f4f4);
    defaultFillColor = color(#d2be60);

    // Initialize main variables
    float maxHealth = 70 + random(50);
    color strokeColor = defaultStrokeColor;
    color fillColor = defaultFillColor;
    initializeVariables(pos_, maxHealth, strokeColor, fillColor);
  }

  // #endregion


  // #region - Main

  void ai() {
    float distToPlayer = max(dist(pos.x, pos.y, player.pos.x, player.pos.y) - size / 2 - player.size / 2, 0);
    PVector dirToPlayer = player.pos.copy().sub(pos).normalize();

    // If tamed
    if (tamed) {

      // Untame if too far
      if (distToPlayer > untameDist) {
        untame();

      // Tamed and can perform tamed action
      } else {
        PVector dir = null;

        // Move towards player if far away
        if (mode == MinionState.FOLLOW && distToPlayer > followDist)
          dir = dirToPlayer.copy();

        // Move away from player if too close
        if (distToPlayer < closeDist)
          dir = dirToPlayer.copy().mult(-1);

        // Actual movement
        if (dir != null) {
          movementTimer++;
          if (movementTimer == movementTimerMax) {
            movementTimer = 0;
            movementAngleAlt *= -1;
            dir = PVector.fromAngle(dir.heading2D() + movementAngleAlt);
            vel.add(dir.mult(movementSpeed));
          }
        }
      }

    // Tame if close
    } else {
      if (distToPlayer < visionDist)
        tame();
    }
  }


  void tame() {
    // Become controllable by the player
    player.controlledMinions.add(this);
    tamed = true;
    movementTimer = 0;
    mode = MinionState.FOLLOW;
  }


  void untame() {
    // Untame from the player
    player.controlledMinions.remove(this);
    tamed = false;
    movementTimer = 0;
    mode = MinionState.IDLE;
  }

  // #endregion
}


// Enemy blub minion sub class
class Blub extends Minion {

  // #region - Setup

  Blub(PVector pos_) {
    super();
    color strokeColor = color(#2e5e30);
    color fillColor = color(#3aa73e);
    initializeVariables(pos_, 10, strokeColor, fillColor);
  }


  void ai() {}

  // #endregion
}


// Storage class
class VisualBar {

  // #region - Setup

  String name;
  float value;
  float maxValue;
  color valueCol;
  color maxValueCol;


  VisualBar(String name_, float value_, float maxValue_, color valueCol_, color maxValueCol_) {
    name = name_;
    value = value_;
    maxValue = maxValue_;
    valueCol = valueCol_;
    maxValueCol = maxValueCol_;
  }

  // #endregion
}
