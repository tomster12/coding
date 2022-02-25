
//    TODONE
// Show shadows before body for all objects as to not overlap accidentally
// Redo coins as objects
// Make coin extend object class and make it more general
// Put fancyGravitate in object and add an overridable collect method
// Correctly draw player based on y pos
//      (Might have to completely rework how drawing is done)
//      (Moved collect and gravitateToCollect function to Collectable class)
// Put all into a gamemanager that sorts, shows and updates all objects
// Only show whats onscreen
// Add player with input controller and move camera based on position
// Order objects based on on y-axis
// Added images into hashmap to easily access each    (*1)
// Add scaling for Camera
// Zoom and move camera using translate / rotate
// Generalize showBody/show using defaultImg and size
// Streamlined creation and construction of objects
// Add shake for when Destructables are damaged
// Add basic method of attack for player
// Add other objects such as crates
// Fix lag by changing to P2D    (*2)
// Fix stuttering despite 60 fps - potentially processing or maybe java memory    (*2)
// Create images for different kinds of foliage and randomly pick when generating
// Added health bars onto Destructables
// Add a collision radius to all Objects
// Move mouse click damage into a debug class for player
// Find and think about problems with multiple animations at once - cannot attack while rolling
// Add abstract getShowPos for all objects

//    TODONT
// Add T-Pose animation for when an animation shouldnt be showing
// PotentiaLLy move camera in gameManager into a nested class
// Update notifications manager to from same object (including mouse) in list
// Create an image manager to hold and handle all image loading    (*1)
// Move updateMovement and updateForces to object and make it more general
// Manage sizing of images better
// Potentially port over to java    (*2)
// Move notifications manager into gameManager      (*3)
// Seperate animations for hands / body to allow for attacks / weapons - Use y-axis based drawing
// Somehow allows the hand animations to reset after showing an attack

//    TODO
// Clean up update0 etc
// Change facing direction after attacking
// Change outline of Clay to be not black
// Go through all functions on all objects and ensure they are formatted correctly and commented
// Make objects in front of player go translucent (eg trees, walls)
// Add an Animator to player for movement / attack / all actions
// Make player Animator general and implement into other Objects such as foliage
// GET BETTER NAMES FOR ALL CLASSES RATHER THAN JUST _MANAGER

// Add jumping with animations for each direction - potentially try rework stuff
// Need a UI Controller that shows gold / inventory / health etc - put inside gameManager
// Foliage generation to automatically happen when entering sparse area / different rarities
//      For different plant types eg grass / bush and include clumping of grass
// Lighting system to make inside of dungeons darker
// Add items that extend Collectable that give add to your inventory on pickup
// Add toolbar / held items that show on your Player when equipped
// Basic enemies with AI - Enemy extends Object, Walker extends Enemy etc
// Tile System that allows basic floors/walls
// Randomly generate structures / dungeons with enemies inside using tile system
// Add collect animation for when coins go into range
// Get better font, add sound and create assets for all objects / players

//    NOTES
// Classes and Managers
//    GameManager contains all Object classes including Player
//    GameManager also includes InputState which is accessed outside
//    Player contains all Class classes as theyre only needed by player
//    NotificationManager currently seperate but should be moved into GameManager     (*3)
// Animation
//    For player each movement in each class will require multiple pictures for each animation
//    Animater class in player needs to take this into account
//    Just override the showBody and showShadow functions thus allowing easy portability
//    Likely will need to change how the images are stored and seperate animations/foliage/characters
//    This will likely require a custom imageManager class as originally expected
//    if manually did every animation for each class and each direction -
//    9 directions, 4 movement types + 1 attacking - body
// Player Classes
//    Currently classes override update1 and showBody (movement / mouse damage, movementDir)
//    Classes will need to be provided and override update2 which is caled by update1
//    Animator will override showBody so class doesnt need to be involved
//    Classess will need to be able to have access to the animator likely through access to the player


// #region - Setup

float shadowScale = 0.8; // Constant variables
float sizeYScale = 0.4;

GameManager gameMng; // Main variables
NotificationManager notificationMng;


void setup() { // Processing function called at the start
  size(700, 700, P2D);
  noStroke();
  textSize(20);
  textAlign(CENTER);
  imageMode(CENTER);
  ((PGraphicsOpenGL)g).textureSampling(3);
  setupVariables();
}


void setupVariables() { // Setup the variables
  AssetsHolder.loadAnimations(this);
  AssetsHolder.loadImages(this);
  gameMng = new GameManager(this);
  notificationMng = new NotificationManager();
}

// #endregion


// #region - Main

void draw() { // Processing function called each frame
  update();
  show();
}


void update() { // Generate a coin and update coinMng / notifications
  gameMng.update();
  notificationMng.update();
}


void show() { // Show coinMng / notifications
  background(128, 194, 158);
  pushMatrix();
  gameMng.camMove();
  gameMng.show();
  notificationMng.show();
  popMatrix();
}

// #endregion


// #region - Other

float randomBetween(float r0, float r1) { // Generate a random number between limits
  return r0 + random(1) * (r1-r0);
}


float distSq(float x0, float y0, float x1, float y1) { // Return the distance squared for 2 (x, y)
  float dx = x1-x0;
  float dy = y1-y0;
  return dx*dx + dy*dy;
}

float distSq(float x0, float y0, float z0, float x1, float y1, float z1) { // Return the distance squared for 3 (x, y)
  float dx = x1-x0;
  float dy = y1-y0;
  float dz = z1-z0;
  return dx*dx + dy*dy + dz*dz;
}


int sign(float f) { // Get the sign of a number
  if (f > 0) return 1;
  if (f < 0) return -1;
  return 0;
}


boolean compareVectors(PVector v0, PVector v1) { // Retrn whether the vectors are identical
  return v0.x == v1.x
      && v0.y == v1.y
      && v0.z == v1.z;
}


void keyPressed() { // Input from key being pressed
  gameMng.inputState.keyPressed(keyCode);
}

void keyReleased() { // Input from key being released
  gameMng.inputState.keyReleased(keyCode);
}

void mousePressed() { // Input from mouse being pressed
  gameMng.inputState.mousePressed(mouseButton);
}

void mouseReleased() { // Input from mouse being released
  gameMng.inputState.mouseReleased(mouseButton);
}


void mouseWheel(MouseEvent e) { // Input from mouse wheel
  gameMng.camScaleVel += e.getCount() * -0.005;
}

// #endregion


class GameManager {
  // #region - Setup

  PApplet pApp;
  ArrayList<QueuedObject> queuedObjects;
  ArrayList<Object> objects;
  InputState inputState;
  Player player;

  PVector camCentre;
  float camScale;
  float camScaleVel;


  GameManager(PApplet pApp_) {
    pApp = pApp_;
    queuedObjects = new ArrayList<QueuedObject>();
    objects = new ArrayList<Object>();
    inputState = new InputState();
    player = new Player(new PVector(width*0.5, height*0.5));
    objects.add(player);
    generateFoliageInArea(-width*2, -height*2, width*5, height*5, 500);

    camCentre = new PVector(width*0.5, height*0.5);
    camScale = 1;
    camScaleVel = 0;
  }

  // #endregion


  // #region - Main

  void update() { // Update all objects and queued objects
    camUpdate();
    ArrayList<Object> updateObjects = new ArrayList<Object>();
    for (Object obj : objects)
      updateObjects.add(obj);
    for (Object obj : updateObjects)
      obj.update0();

    ArrayList<QueuedObject> updateQueuedObjects = new ArrayList<QueuedObject>();
    for (QueuedObject obj : queuedObjects)
      updateQueuedObjects.add(obj);
    for (QueuedObject obj : updateQueuedObjects)
      obj.update();
  }


  void show() { // Show all objects in correct order
    ArrayList<Object> showObjects = new ArrayList<Object>();
    for (Object obj : objects)
      if (obj.onscreen()) showObjects.add(obj);
    showObjects = sortObjectsByPosY(showObjects);

    noStroke();
    fill(80, 80, 80, 100);
    for (Object obj : showObjects)
      obj.showShadow0();
    for (Object obj : showObjects)
      obj.showBody0();
    for (Object obj : showObjects)
      obj.showAdditional0();
  }


  void camUpdate() { // Update the position of the camera
    camScale += camScaleVel;
    camScale = min(max(camScale, 0.5), 2);
    camScaleVel *= 0.9;
    PVector dir = new PVector(
      player.pos.x - camCentre.x,
      player.pos.y - camCentre.y
    );
    camCentre.add(dir.mult(0.1));
  }


  void camMove() { // Translate and scale the screen based on the camera
    translate(width/2, height/2); // Set origin to middle of screen
    scale(camScale); // Scale objects based on origin
    translate(-camCentre.x, -camCentre.y); // Place camera onto origin
  }

  // #endregion


  // #region - Other

  void generateFoliage(PVector pos) { // Generate a single random foliage at a position
    PImage img = null;
    if (random(1) < 0.7) {
      int type = floor(random(2));
      img = AssetsHolder.foliage.get("Grass0"+type);
      objects.add(new Foliage(pos, img, 0.4));
    } else {
      img = AssetsHolder.foliage.get("Grass1");
      objects.add(new Foliage(pos, img, 0.5));
    }
  }

  void generateFoliageInArea(float px, float py, float sx, float sy, int amount) { // Generate random foliage in area
    for (int i = 0; i < amount; i++) {
      // POSSIBLY USE POISSON SAMPLING

      if (random(1) < 0.2) { // Generate a patch
        int patchAmount = floor(random(20));
        i += patchAmount;
        PVector patchPos = new PVector(
          random((int)sx) + px,
          random((int)sy) + py
        );

        for (int o = 0; o < patchAmount; o++) { // Generate each foliage in patch
          float angle = random(1)*TWO_PI;
          float distance = random(patchAmount*10);
          PVector pos = new PVector(
            patchPos.x + cos(angle) * distance,
            patchPos.y + sin(angle) * distance
          );
          generateFoliage(pos);
        }

      } else { // Generate singular
        PVector pos = new PVector(
          random((int)sx) + px,
          random((int)sy) + py
        );
        generateFoliage(pos);
      }
    }
  }

   void queueRandomCoin(PVector pos, float[] angleRange, float[] magRange, int time) { // Queue a random coin to be added after time
    float horzAngle = random(TWO_PI);
    float vertAngle = randomBetween(angleRange[0], angleRange[1]);
    float mag = randomBetween(magRange[0], magRange[1]);
    PVector genPos = pos.copy();
    PVector genVel = new PVector(
      (cos(horzAngle) * cos(vertAngle)) * mag,
      (sin(horzAngle) * cos(vertAngle)) * mag,
      (sin(vertAngle)) * mag
    );
    Coin coin = new Coin(genPos);
    coin.vel = genVel;
    queuedObjects.add(new QueuedObject(
      coin, time
    ));
  }


  void damageInArea(PVector pos, float range, float damage) { // Damage all destructables in area
    ArrayList<Destructable> destructables = new ArrayList<Destructable>();
    for (Object obj : gameMng.objects)
      if (obj.getType() == "Destructable") destructables.add((Destructable)obj);
    for (Destructable dObj : destructables) {
      float collideDist = range+dObj.collideRange;
      if (distSq(pos.x, pos.y, dObj.pos.x, dObj.pos.y) < collideDist*collideDist)
        dObj.damage(damage);
    }
  }


  PVector getWorldMousePos() { // Get a vector for the mouse
    return new PVector(
      (mouseX-width/2)/camScale + camCentre.x,
      (mouseY-height/2)/camScale + camCentre.y
    );
  }


  ArrayList<Object> sortObjectsByPosY(ArrayList<Object> objects) { // Selection sort
    for (int i = 0; i < objects.size(); i++) {
      float lowest = objects.get(i).pos.y;
      int lowestIndex = i;
      for (int j = i+1; j < objects.size(); j++) {
        if (objects.get(j).pos.y < lowest) {
          lowest = objects.get(j).pos.y;
          lowestIndex = j;
        }
      }
      Object currentObj = objects.get(lowestIndex);
      objects.set(lowestIndex, objects.get(i));
      objects.set(i, currentObj);
    }
    return objects;
  }

  // #endregion


  // #region - Objects

  // ------------------------------- Update0

  // constructor  - (Object, timer)
  class QueuedObject {
    // #region - Main

    Object obj;
    int timer;


    QueuedObject(Object obj_, int timer_) {
      obj = obj_;
      timer = timer_;
    }


    void update() { // Update the timer and remove
      timer--;
      if (timer <= 0) {
        gameMng.queuedObjects.remove(this);
        gameMng.objects.add(obj);
      }
    }

    // #endregion
  }

  // To Override  - (update1, getType) (showShadow1, showBody1, showAdditional1)
  // constructor  - (isKinematic, pos, defaultImage, size)
  abstract class Object {
    // #region - Setup

    boolean isKinematic;
    PVector pos;
    PVector vel;
    PVector acc;

    PImage defaultImg;
    PVector size;
    float collideRange;


    Object(boolean isKinematic_, PVector pos_, PImage defaultImg_, float size_) {
      isKinematic = isKinematic_;
      pos = pos_;
      vel = new PVector(0, 0, 0);
      acc = new PVector(0, 0, 0);

      defaultImg = defaultImg_;
      if (defaultImg == null) size = new PVector(size_, size_ * sizeYScale, size_);
      else size = new PVector(size_, size_ * sizeYScale, size_ * defaultImg_.height/defaultImg_.width);
      collideRange = size.x*0.6;
    }


    abstract void update1();

    abstract String getType();

    void showShadow1() {}; // Doesnt have to be implemented

    void showBody1() {}; // Doesnt have to be implemented

    void showAdditional1() {}; // Doesnt have to be implemented

    // #endregion


    // #region - Main

    void update0() {  // Update the object
      if (isKinematic) {
        updateForces();
        updateMovement();
      }
      update1();
    }


    void updateForces() {
      if (pos.z < 0) { // Under the ground then bounce
        pos.z = 0;
        if (vel.z < -1) acc.z = -vel.z * 1.6;
        else acc.z = -vel.z;

      } else if (pos.z == 0) { // On the ground then friction
        float frMaxMag = 0.2;
        float frMag = sqrt(vel.x*vel.x + vel.y*vel.y);
        PVector friction =
          PVector.fromAngle(vel.heading())
          .mult(-min(frMaxMag, frMag));
        acc.add(friction);

      } else if (pos.z > 0) { // Above the ground then gravity
        acc.z -= 0.1;
      }
    }


    void updateMovement() { // Move based on vel and acc
      vel.add(acc);
      pos.add(vel);
      acc.mult(0);
    }


    void showShadow0() { // Show the shadow of the object
    // Formatting already set
      ellipse(pos.x, pos.y,
        size.x * shadowScale,
        size.y * shadowScale
      );
      showShadow1();
    }


    void showBody0() { // Show the body of the object
      PVector showPos = getShowPos();
      if (defaultImg != null) {
        image(defaultImg,
          showPos.x, showPos.y,
          size.x, size.z
        );

      } else {
        noStroke();
        fill(255);
        ellipse(
          showPos.x, showPos.y,
          size.x, size.z
        );
      }
      showBody1();
    }


    void showAdditional0() { // Show any additional parts
      showAdditional1();
    }


    PVector getShowPos() { // Get the centre of the shown image
      return new PVector(pos.x, pos.y-pos.z-size.z/2);
    }


    boolean onscreen() { // Check if the object is onscreen
      return
        pos.x+size.x > gameMng.camCentre.x-(width/2)/camScale
        && pos.x-size.x < gameMng.camCentre.x+(width/2)/camScale
        && pos.y+size.y > gameMng.camCentre.y-(width/2)/camScale
        && pos.y-size.y < gameMng.camCentre.y+(height/2)/camScale;
    }


    boolean pointOntop(float px, float py, float pz) { // Check if a point is ontop
      return distSq(pos.x, pos.y, pos.z, px, py, pz) < collideRange*collideRange;
    }

    // #endregion
  }


  // ------------------------------- Update1

  // Overrides    - (update1, getType)
  // To Override  - (update2, collect)
  // constructor  - (isKinematic, Pos, defaultImg, size)
  // super        - (isKinematic, Pos, defaultImg, size)
  abstract class Collectable extends Object {
    // #region - Setup

    boolean canCollect;
    int canCollectTimer;


    Collectable(boolean isKinematic_, PVector pos_, PImage defaultImg_, float size_) {
      super(isKinematic_, pos_, defaultImg_, size_);
      canCollect = false;
      canCollectTimer = 30;
    }


    abstract void update2();

    abstract void collect();

    // #endregion


    // #region - Override

    @Override
    void update1() {
      if (canCollectTimer > 0)
        canCollectTimer--;
      else canCollect = true;
      update2();
    }


    @Override
    String getType() {
      return "Collectable";
    }

    // #endregion


    // #region - Main

    void gravitateToCollect(float px, float py, float pz, float force, // Gravitate towards position
      float activeRadius, float hoverRadius, float collectRadius) {
        float dx = px-pos.x;
        float dy = py-pos.y;
        float distSq = dx*dx + dy*dy;

        if (distSq < activeRadius*activeRadius) { // If in activeRadius then gravitate
          float mag = min(1, force * 1000 / distSq);
          PVector dir = new PVector(dx, dy);
          dir.normalize().mult(mag);
          acc.add(dir);

          if (distSq < hoverRadius*hoverRadius) { // If in hoverRadius then hover
            pos.z = max(pz, pos.z);
            vel.z = 0;
          }

          if (distSq < collectRadius*collectRadius) // If in collectRadius then collect
            collect();
        }
      }

      // #endregion
  }

  // Overrides    - (update1, getType, showBody1)
  // To Override  - (update2, destroy)
  // constructor  - (isKinematic, Pos, health, defaultImg, size)
  // super        - (isKinematic, Pos, defaultImg, size)
  abstract class Destructable extends Object {
    // #region - Setup

    float maxHealth;
    float health;
    boolean shaking;
    float sTime;


    Destructable(boolean isKinematic_, PVector pos_, float health_, PImage defaultImg_, float size_) {
      super(isKinematic_, pos_, defaultImg_, size_);
      maxHealth = health_;
      health = health_;

      shaking = false;
      sTime = 0;
    }


    abstract void update2();

    abstract void destroy();

    // #endregion


    // #region - Override

    @Override
    void update1() {
      if (shaking) {
        pos.x += 5 * min(max(sin(5*PI*sTime)/(5*PI*sTime-PI), -1), 1);
        sTime += 1.0 / 20.0;
        pos.x += 5 * min(max(-sin(5*PI*sTime)/(5*PI*sTime-PI), -1), 1);
        if (sTime >= 1) {
          shaking = false;
          sTime = 0;
        }
      }
      update2();
    }

    @Override
    void showBody1() {
      if (health != maxHealth)
        showHealthbar();
    }


    @Override
    String getType() {
      return "Destructable";
    }

    // #endregion


    // #region - Main

    void damage(float damage) {
      health -= damage;
      shaking = true;
      sTime = 0;

      if (health <= 0)
        destroy();
    }


    void showHealthbar() {
      noStroke();
      float sx = 60;
      float sy = 5;

      fill(200, 100, 100);
      rect(pos.x-(sx/2), (pos.y-pos.z)-(sy/2)+(20),
      sx, sy);

      fill(100, 200, 100);
      rect(pos.x-(sx/2), (pos.y-pos.z)-(sy/2)+(20),
      sx * health/maxHealth, sy);
    }

    // #endregion
  }

  // Overrides    - (update1, showBody0, getType)
  // constructor  - (pos)
  // super        - (false, pos, null, 40)
  class Player extends Object {
    // #region - Setup

    HashMap<Integer, Float> movementSpeeds;
    final int IDLE = 0;
    final int ACTING = 1;
    final int WALKING = 2;
    final int RUNNING = 3;
    final int ROLLING = 4;
    void initConstants() {
      movementSpeeds = new HashMap<Integer, Float>();
      movementSpeeds.put(IDLE, 0.0f);
      movementSpeeds.put(ACTING, 0.5f);
      movementSpeeds.put(WALKING, 3.0f);
      movementSpeeds.put(RUNNING, 6.0f);
      movementSpeeds.put(ROLLING, 20.0f);
    }

    Class curClass;
    PVector facingDir;
    Animator anm;

    int movementType;
    int rollTimer;
    int rollCooldown;


    Player(PVector pos_) {
      super(false, pos_, null, 50);
      initConstants();

      curClass = new Clay(this);
      facingDir = new PVector(1, 0);
      anm = new Animator(this, 4);

      movementType = IDLE;
      rollTimer = 0;
      rollCooldown = 0;
    }

    // #endregion


    // #region - Override

    @Override
    void update1() {
      updateMovement();
      curClass.update();
      updateAnimation();
      anm.update();
    }


    @Override
    void showBody0() {
      anm.show();
      curClass.show();
    }


    @Override
    void showAdditional1() {
      noStroke();
      fill(0);
      if (anm.currentAnimation != null) {
        text(anm.currentAnimation.name
        + ": "+ anm.currentFrame
        + ": " + anm.currentTime
        + "/" + anm.currentAnimation.frames[anm.currentFrame].time,
        pos.x, pos.y + 50);
        text(movementType, pos.x, pos.y + 80);
        text(facingDir.x + ", " + facingDir.y, pos.x, pos.y + 110);
      }
    }


    @Override
    String getType() {
      return "Player";
    }

    // #endregion


    // #region - Main

    void updateMovement() {
      // The movement direction is what way the user is currently trying to move
      PVector movementDir = gameMng.inputState.getMovementDirection();

      // Update cooldowns
      if (rollCooldown > 0) rollCooldown--;

      if (rollTimer > 0) { // Currently rolling
        movementType = ROLLING;
        rollTimer--;

      } else if (gameMng.inputState.inputs[17] && rollCooldown == 0) { // Initiating roll
        movementType = ROLLING; rollTimer = 10; rollCooldown = 30;
        facingDir = movementDir;

      } else if (curClass.getActing()) { // Class currently acting
        movementType = ACTING;

      } else if (movementDir != null) {
          if (!compareVectors(movementDir, facingDir)) // Update facing direction
            facingDir = movementDir;

          if (gameMng.inputState.inputs[16]) // Currently sprinting
            movementType = RUNNING;

          else // Currently walking
            movementType = WALKING;

      } else // Currently idle
        movementType = IDLE;


      if (movementType == ROLLING) { // If rolling use facingDir
        PVector movement = PVector.mult(facingDir, movementSpeeds.get(movementType));
        pos.add(movement);

      } else if (movementType == WALKING || movementType == RUNNING) { // Move if not idle
        PVector movement = PVector.mult(movementDir, movementSpeeds.get(movementType));
        pos.add(movement);
      }
    }


    void updateAnimation() {
      // Call recurring movement animations
      if (movementType == IDLE
      ||  movementType == WALKING
      ||  movementType == RUNNING
      ||  movementType == ROLLING) {
        anm.playAnimation(0, ""
        + curClass.getClassName()
        + getMovementDirName()
        + getMovementTypeName());
      }
    }


    String getMovementDirName() {
      String[][] facingTypes = new String[][] {
        new String[] {"BackLeft",  "Back",  "RightBack"},
        new String[] {"Left",      "NA",    "Right"},
        new String[] {"LeftFront", "Front", "FrontRight"}
      };
      return facingTypes[sign(facingDir.y)+1][sign(facingDir.x)+1];
    }


    String getMovementTypeName() {
      HashMap<Integer, String> movementTypeName = new HashMap<Integer, String>();
      movementTypeName.put(IDLE, "Idle");
      movementTypeName.put(WALKING, "Walking");
      movementTypeName.put(RUNNING, "Running");
      movementTypeName.put(ROLLING, "Rolling");
      return movementTypeName.get(movementType);
    }


    PVector getMouseDir8() {
      PVector dir = PVector.sub(gameMng.getWorldMousePos(), pos).normalize();
      return new PVector(Math.round(dir.x), Math.round(dir.y)).normalize();
    }

    // #endregion


    // #region - Class

    // To Override   - (update, show, getActing, getClassName)
    // constructor   - (Player)
    abstract class Class {
      // #region - Setup

      Player player;


      Class(Player player_) {
        player = player_;
      }


      abstract void update();

      abstract void show();

      abstract boolean getActing();

      abstract String getClassName();

      // #endregion
    }


    // Overrides    - (update, show, getClassName)
    // constructor  - (player)
    // super        - (player)
    class Clay extends Class {
      // #region - Setup

      float damageCooldown;
      PVector damagePos;
      float damageRange;


      Clay(Player player_) {
        super(player_);

        damageCooldown = 0;
        damagePos = null;
        damageRange = 0;
      }

      // #endregion


      // #region - Overrides

      @Override
      void update() {
        if (player.movementType != player.ROLLING) { // Update attacks if not rolling
          if (damageCooldown > 0)
            damageCooldown--;

          else if (gameMng.inputState.mouse == LEFT) {
            PVector dir = PVector.sub(gameMng.getWorldMousePos(), pos).normalize();
            player.facingDir = player.getMouseDir8();
            damageCooldown = 30;
            damagePos = PVector.add(pos, dir.mult(40));
            damageRange = 40;
            gameMng.damageInArea(damagePos, damageRange, 10);
            player.anm.playAnimation(1, "ClayAttack"+player.getMovementDirName());
          }

        } else { // Rolling so reset cooldowns
          damageCooldown = 0;
        }
      }


      @Override
      void show() {
        if (damageCooldown > 0) {
          fill(200, 100, 100, 80);
          ellipse(damagePos.x, damagePos.y,
          damageRange*2, damageRange*2);
        }
      }


      @Override
      boolean getActing() { // Get the name of this class
        return (damageCooldown > 0);
      }


      @Override
      String getClassName() { // Get the name of this class
        return "Clay";
      }

      // #endregion
    }

    // #endregion
  }


  // Overrides    - (update1, showBody0, getType)
  // constructor  - (pos, image, centreImage)
  // super        - (false, pos, image, centreImage, 20+random(20))
  class Foliage extends Object {
    // #region - Setup

    float imageYOffset;


    Foliage(PVector pos_, PImage img_, float imageYOffset_) {
      super(false, pos_, img_, 20+floor(random(20)));
      imageYOffset = imageYOffset_;
    }

    // #endregion


    // #region - Override

      @Override
      void update1() {
      }


      @Override
      void showBody0() {
        image(defaultImg,
          pos.x, pos.y-pos.z-imageYOffset*size.z,
          size.x, size.z
        );
      }


      @Override
      String getType() {
        return "Foliage";
      }

      // #endregion
  }


  // ------------------------------- Update2

  // Overrides    - (update2, destroy)
  // constructor  - (pos)
  // super        - (false, pos, Barrel0, false, 50)
  class Barrel extends Destructable {
    // #region - Setup

    Barrel(PVector pos_) {
      super(false, pos_, 100, AssetsHolder.destructables.get("Barrel0"), 50);
    }

    // #endregion


    // #region - Override

    @Override
    void update2() { // Update the barrel
    }


    @Override
    void destroy() { // Create coins on destruction
      int amount = floor(random(1)*10+15);
      for (int i = 0; i < amount; i++)
        gameMng.queueRandomCoin(pos, new float[] {PI * 0.15, PI * 0.3}, new float[] {2, 3}, floor(random(25)));
      gameMng.objects.remove(this);
    }

    // #endregion
  }

  // Overrides    - (update2, destroy)
  // constructor  - (pos)
  // super        - (false, pos, Box0, 35)
  class Box extends Destructable {
    // #region - Setup

    Box(PVector pos_) {
      super(false, pos_, 50, AssetsHolder.destructables.get("Box0"), 35);
    }

    // #endregion


    // #region - Override

    @Override
    void update2() { // Update the barrel
    }


    @Override
    void destroy() { // Create coins on destruction
      int amount = floor(random(1)*5+5);
      for (int i = 0; i < amount; i++)
        gameMng.queueRandomCoin(pos, new float[] {PI * 0.15, PI * 0.3}, new float[] {2, 3}, floor(random(25)));
      gameMng.objects.remove(this);
    }

    // #endregion
  }

  // Overrides    - (update2, collect)
  // constructor  - (pos)
  // super        - (true, pos, Coin0, 20)
  class Coin extends Collectable {
    // #region - Setup

    Coin(PVector pos_) {
      super(true, pos_, AssetsHolder.collectables.get("Coin0"), 20);
    }

    // #endregion


    // #region - Override

    @Override
    void update2() { // Update the coin
      if (canCollect) {
        gravitateToCollect(gameMng.player.pos.x, gameMng.player.pos.y, 5,
        2, 200, 150, gameMng.player.collideRange);
      }
    }


    @Override
    void collect() { // Collect this coin
      float angle = randomBetween(PI * 0.3, PI * 0.7);
      notificationMng.addNotification(
        "+1",
        new PVector(pos.x, pos.y-pos.z),
        new PVector(cos(angle)*2, -sin(angle)*2),
        30, color(221, 217, 74)
      );
      gameMng.objects.remove(this);
    }

    // #endregion
  }


  // -------------------------------

  // #endregion


  class InputState {
    // #region - Main

    boolean[] inputs;
    int mouse;


    InputState() {
      inputs = new boolean[300];
      mouse = -1;
    }


    void keyPressed(int keyCode) { // Called when key is pressed
      inputs[keyCode] = true;

      // --DEBUG--
      if (keyCode == 9) { // Generate coins
        for (int i = 0; i < 20; i++)
          gameMng.queueRandomCoin(gameMng.getWorldMousePos(), new float[] {PI * 0.2, PI * 0.4}, new float[] {2, 3}, (i*5));

      } else if (keyCode == 90) { // Create Box
        gameMng.objects.add(new Box(gameMng.getWorldMousePos()));

      } else if (keyCode == 88) { // Create barrel
        gameMng.objects.add(new Barrel(gameMng.getWorldMousePos()));
      }
      // ---------
    }

    void keyReleased(int keyCode) { // Called when key is released
      inputs[keyCode] = false;
    }

    void mousePressed(int mouseButton) { // Called when mouse pressed
      mouse = mouseButton;
    }

    void mouseReleased(int mouseButton) { // Called when mouseReleased
      mouse = -1;
    }



    PVector getMovementDirection() { // Get a pvector signifying direction
      float dx =
        (inputs[37] || inputs[65]) ? -1
      : (inputs[39] || inputs[68]) ? 1
      : 0;
      float dy =
        (inputs[38] || inputs[87]) ? -1
      : (inputs[40] || inputs[83]) ? 1
      : 0;

      if (dx==0 && dy==0) return null;
      else return new PVector(dx, dy).normalize();
    }

    // #endregion
  }


  class Animator {
    // #region - Setup

    Object obj;
    float anmScale;
    Animation currentAnimation;
    int currentPriority;
    int currentFrame;
    int currentTime;


    Animator(Object obj_, float anmScale_) {
      obj = obj_;
      anmScale = anmScale_;
      currentAnimation = null;
      currentPriority = 0;
      currentFrame = 0;
      currentTime = 0;
    }

    // #endregion


    // #region - Main

    void playAnimation(int priority, String name) { // Try to play an animation
      Animation an = AssetsHolder.animations.get(name);
      if (an != null && an != currentAnimation && priority >= currentPriority) {
        currentAnimation = an;
        currentPriority = priority;
        currentFrame = 0;
        currentTime = 0;
      }
    }


    void update() {
      if (currentAnimation != null) { // Update timers and frames of current animation
        currentTime++;
        if (currentTime >= currentAnimation.frames[currentFrame].time) {
          currentFrame++;
          currentTime = 0;
        }
        if (currentFrame >= currentAnimation.frames.length) {
          if (currentAnimation.looping)
            currentFrame = 0;
          else currentAnimation = null;
        }
      }
    }


    void show() {
      if (currentAnimation != null) {
        PImage curImg = currentAnimation.frames[currentFrame].img; // Setup variables
        obj.size = new PVector(
          curImg.width * anmScale,
          curImg.width * anmScale * sizeYScale,
          curImg.height * anmScale
        );

        PVector showPos = player.getShowPos();
        image(curImg, // Show the current animation frame at correct position
          showPos.x, showPos.y,
          obj.size.x, obj.size.z
        );
      }
    }

    // #endregion
  }
}


class NotificationManager { // Text, pos, vel, time, col
  // #region - Setup

  ArrayList<Notification> notifications;


  NotificationManager() {
    notifications = new ArrayList<Notification>();
  }

  // #endregion


  // #region - Main

  void update() { // Update all notifications
    for (int i = notifications.size()-1; i >= 0; i--)
      notifications.get(i).update();
  }


  void show() { // Show all notifications
    noFill();
    for (Notification notification : notifications)
      notification.show();
  }


  void addNotification(String text, PVector pos, PVector vel, int time, color col) { // Add a notification
    notifications.add(new Notification(
        text, pos, vel, time, col
    ));
  }

  // #endregion


  // #region - Notification

  class Notification {
    // #region - Main

  String text;
  PVector pos;
  PVector vel;
  int timer;
  color col;


  Notification(String text_, PVector pos_, PVector vel_,  int timer_, color col_) {
    text = text_;
    pos = pos_;
    vel = vel_;
    timer = timer_;
    col = col_;
  }


  void update() {
    timer--;
    if (timer == 0) {
      notificationMng.notifications.remove(this);

    } else {
      pos.x += vel.x;
      pos.y += vel.y;
      vel.y += 0.1;
    }
  }


  void show() {
    fill(col);
    text(text, pos.x, pos.y);
  }

  // #endregion
  }

  // #endregion
}


static class AssetsHolder {
  // #region - Main

  static HashMap<String, Animation> animations;
  static HashMap<String, PImage> foliage;
  static HashMap<String, PImage> collectables;
  static HashMap<String, PImage> destructables;


  static void loadAnimations(Strayed0 s) {
    animations = new HashMap<String, Animation>();

    // #region - Clay

    // #region - Idle

    animations.put("ClayFrontIdle", s.new Animation("ClayFrontIdle", true, new AnimationFrame[] {
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/FrontIdle0.png")),
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/FrontIdle1.png"))
    }));
    animations.put("ClayFrontRightIdle", s.new Animation("ClayFrontRightIdle", true, new AnimationFrame[] {
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/FrontRightIdle0.png")),
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/FrontRightIdle1.png"))
    }));
    animations.put("ClayRightIdle", s.new Animation("ClayRightIdle", true, new AnimationFrame[] {
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/RightIdle0.png")),
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/RightIdle1.png"))
    }));
    animations.put("ClayRightBackIdle", s.new Animation("clayRightBackIdle", true, new AnimationFrame[] {
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/RightBackIdle0.png")),
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/RightBackIdle1.png"))
    }));
    animations.put("ClayBackIdle", s.new Animation("ClayBackIdle", true, new AnimationFrame[] {
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/BackIdle0.png")),
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/BackIdle1.png"))
    }));
    animations.put("ClayBackLeftIdle", s.new Animation("ClayBackLeftIdle", true, new AnimationFrame[] {
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/BackLeftIdle0.png")),
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/BackLeftIdle1.png"))
    }));
    animations.put("ClayLeftIdle", s.new Animation("ClayLeftIdle", true, new AnimationFrame[] {
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/LeftIdle0.png")),
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/LeftIdle1.png"))
    }));
    animations.put("ClayLeftFrontIdle", s.new Animation("ClayLeftFrontIdle", true, new AnimationFrame[] {
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/LeftFrontIdle0.png")),
      s.new AnimationFrame(30, s.loadImage("assets/images/animations/classes/clay/idle/LeftFrontIdle1.png"))
    }));

    // #endregion


    // #region - Walking

    animations.put("ClayRightWalking", s.new Animation("ClayRightWalking", false, new AnimationFrame[] {
      s.new AnimationFrame(5, s.loadImage("assets/images/animations/classes/clay/idle/FrontIdle0.png")),
    }));

    // #endregion


    // #region - Sprinting

    // #endregion


    // #region - Rolling

    // #endregion


    // #region - Attacking


    // #endregion

    // #endregion
  }


  static void loadImages(Strayed0 s) {
    foliage = new HashMap<String, PImage>();
    collectables = new HashMap<String, PImage>();
    destructables = new HashMap<String, PImage>();

    collectables.put("Coin0", s.loadImage("assets/images/collectables/Coin0.png"));
    destructables.put("Barrel0", s.loadImage("assets/images/destructables/Barrel0.png"));
    destructables.put("Box0", s.loadImage("assets/images/destructables/Box0.png"));
    foliage.put("Grass00", s.loadImage("assets/images/foliage/Grass00.png"));
    foliage.put("Grass01", s.loadImage("assets/images/foliage/Grass01.png"));
    foliage.put("Grass1", s.loadImage("assets/images/foliage/Grass1.png"));
  }

  // #endregion
}

// #region - Animation Classes

public class Animation {

  String name;
  boolean looping;
  AnimationFrame[] frames;


  Animation(String name_, boolean looping_, AnimationFrame[] frames_) {
    name = name_;
    looping = looping_;
    frames = frames_;
  }
}


public class AnimationFrame {

  int time;
  PImage img;


  AnimationFrame(int time_, PImage img_) {
    time = time_;
    img = img_;
  }
}

// #endregion
