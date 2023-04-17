



// Sort out coin friction

// Make all objects have animation manager, pos and vel





//      IMPROVEMENT
// Use super.update to cascade updates downwards with
//   earlyupdate and lateupdates implemented from start
// Use basePosition on sprites for bettter placement
//   of sprites
// Redo animation handling to make it easier to add new
//   and to easily identify and call animations


//      TODONE
// Encapsulated game within manager for organised code
// Provided basis for inheritance based object system
// Future-proofed translation for camera shake effects
// Add dyanmic 2.5D camera view that allows you to change
//   the angle of the camera which affects the conversion
//   between world position and camera position used with
//   object position and shadow scaling
// Move strayed github to encapsulate entire project


//      TODO
// Find better system for scaling / size of objects and animations
// Add AnimationManager with functionality for looping,
//   Single-fire and static animations as well as priority
//   and object movement. Make it easy for an object to play /
//   loop an animation with a single function call.
// Add AssetManager that loads images, sounds and animations
//   and sorts into categories along with functionality to get
//   by name


// screen has objects, animations, notifications, images, sounds,
//    player, inputs and needs to handle camera movement and zoom
// GameManager stores and updates objects, handles camera movement,
//    zoom, player and inputs
// assetManager loads images, sounds and animations
// notificationManager needs to be implemented


// #region - Setup

// Declare variables
final float DEGTORAD = TWO_PI / 360;
final float RADTODEG = 360 / TWO_PI;
GameManager gameManager;
AssetsManager assetsManager;


void setup() {
  // Setup processing
  size(600, 600, P2D);
  noFill();
  noStroke();
  textAlign(CENTER);
  imageMode(CENTER);
  textSize(20);
  ((PGraphicsOpenGL)g).textureSampling(3);

  // Setup variables
  setupVariables();
}


void setupVariables() {
  // Initialize variables
  AssetsManager.initialize(this);
  gameManager = new GameManager();
}

// #endregion


// #region - Main

void draw() {
  // Main gameManager loop
  gameManager.update();
}

// #endregion


// #region - Input

void keyPressed() {
  // Pass keyPressed through to gameManager
  gameManager.keyPressed();
}


void keyReleased() {
  // Pass keyReleased through to gameManager
  gameManager.keyReleased();
}


void mousePressed() {
  // Pass mousePressed through to gameManager
  gameManager.mousePressed();
}


void mouseReleased() {
  // Pass mouseReleased through to gameManager
  gameManager.mouseReleased();
}

// #endregion


// Singleton as global variable 'gameManager'
// Handles updating / showing objects, inputs and camera
class GameManager {

  // #region - Setup

  // Declare variables
  int mouse;
  boolean[] inputs;
  ArrayList<Object> objects;
  ArrayList<Object> objectsToAdd;
  Player player;
  float camAngle;
  float camScale;


  GameManager() {
    // Initialize variables
    mouse = 0;
    inputs = new boolean[400];
    objects = new ArrayList<Object>();
    objectsToAdd = new ArrayList<Object>();
    player = new Player(new PVector(width * 0.5, height * 0.5));
    camAngle = 37 * DEGTORAD;
    camScale = 1;

    // Additional setup
    objects.add(player);
    for (int i = 0; i < 10; i++)
      objects.add(new Coin(new PVector(random(width), random(height))));
  }

  // #endregion


  // #region - Main

  void update() {
    // Draw background and translate to player
    background(125, 213, 123);
    PVector camPosition = player.getShowPosition();
    PVector translation = convertWorldToScreen(camPosition);
    translate(width * 0.5 - translation.x, height * 0.5 - translation.y);

    // Get a list of all objects to update and sort based on y
    // Allows deletion of objects, sorting every frame to handle movement
    ArrayList<Object> objectsToUpdate = new ArrayList<Object>();
    for (Object obj : objects) objectsToUpdate.add(obj);
    for (int i = 0; i < objectsToUpdate.size(); i++) {
      int lowestIndex = i;
      float lowestValue = objectsToUpdate.get(i).pos.y;
      for (int o = i + 1; o < objectsToUpdate.size(); o++) {
        if (objectsToUpdate.get(o).pos.y < lowestValue) {
          lowestIndex = o;
          lowestValue = objectsToUpdate.get(o).pos.y;
        }
      }
      Object obj = objectsToUpdate.get(i);
      objectsToUpdate.set(i, objectsToUpdate.get(lowestIndex));
      objectsToUpdate.set(lowestIndex, obj);
    }

    // Call early, standard and late update on all objects
    for (Object obj : objectsToUpdate)
      obj.earlyUpdate();
    for (Object obj : objectsToUpdate)
      obj.update();
    for (Object obj : objectsToUpdate)
      obj.lateUpdate();

    // Add all new objects
    for (Object obj : objectsToAdd)
      objects.add(obj);
  }


  PVector convertWorldToScreen(PVector pos) {
    // Convert a position in the world to a position on screen
    return new PVector(
      pos.x,
      sin(gameManager.camAngle) * pos.y
      - cos(gameManager.camAngle) * pos.z
    );
  }

  // #endregion


  // #region - Input

  void keyPressed() {
    // Update inputs based on keyCode
    inputs[keyCode] = true;
  }


  void keyReleased() {
    // Update inputs based on keyCode
    inputs[keyCode] = false;
  }


  void mousePressed() {
    // Update mouse based on mouseButton
    mouse = mouseButton;
  }


  void mouseReleased() {
    // Update mouse based on mouseButton
    mouse = 0;
  }

  // #endregion


  // #region - Classes

  // #region - Objects

  // ----------------------------- Inheritance level 0

  // Constructor  - (pos, size)
  // Provides     - (showShadow, show)
  // Implements   - ()
  abstract class Object {

    // #region - Setup

    // Declare variables
    AnimationController animationController;
    PVector pos;
    PVector size;
    PVector vel;
    ArrayList<String> tags;


    Object(PVector pos_, PVector size_) {
      // Initialize variables
      animationController = new AnimationController(this);
      pos = pos_;
      size = size_;
      vel = new PVector(0, 0);
      tags = new ArrayList<String>();

      // Other setup
      tags.add("object");
    }

    // #endregion


    // #region - Main

    void earlyUpdate() {
      // Called first
      showShadow();
    }


    void update() {
      // Called second
      show();
    }


    void lateUpdate() {
      // Called last
    }


    PVector getShowPosition() {
      // Where to show the object
      return pos.copy();
    }


    // To be implemented
    abstract void showShadow();
    abstract void show();

    // #endregion
  }


  // ----------------------------- Inheritance level 1

  // Constructor  - (pos)
  // Provides     - ()
  // Implements   - (showShadow, show)
  class Player extends Object {

    // #region - Setup

    Player(PVector pos_) {
      // Initialize variables
      super(pos_, new PVector(50, 50));

      // Other setup
      tags.add("player");
    }

    // #endregion


    // #region - Main

    @Override
    void earlyUpdate() {
      // Update movement before all else
      movement();
      super.earlyUpdate();
    }


    void movement() {
      // Move based on input
      if (gameManager.inputs[37] || gameManager.inputs[65]) vel.x -= 0.2;
      if (gameManager.inputs[38] || gameManager.inputs[87]) vel.y -= 0.2;
      if (gameManager.inputs[39] || gameManager.inputs[68]) vel.x += 0.2;
      if (gameManager.inputs[40] || gameManager.inputs[83]) vel.y += 0.2;
      if (gameManager.inputs[32] && pos.z == 0) vel.z += 8;

      // Apply friction and update pos
      vel.x *= 0.94;
      vel.y *= 0.94;
      vel.z -= 0.5;
      pos.add(vel);

      // Prevent moving through floor
      if (pos.z <= 0) {
        vel.z = max(vel.z, 0);
        pos.z = max(vel.z, 0);
      }
    }


    @Override
    void showShadow() {
      // Show shadow as transparent flat circle
      fill(50, 100);
      noStroke();
      PVector shadowPos = pos.copy();
      shadowPos.z = 0;
      PVector screenPos = convertWorldToScreen(shadowPos);
      PVector screenSize = convertWorldToScreen(size);
      ellipse(screenPos.x, screenPos.y, screenSize.x, screenSize.y);
    }


    @Override
    void show() {
      // Show body as blue opaque circle
      fill(79, 184, 180);
      noStroke();
      PVector screenPos = gameManager.convertWorldToScreen(pos);
      ellipse(screenPos.x, screenPos.y - size.y / 2, size.x, size.y);
    }

    // #endregion
  }


  // Constructor  - (pos, size)
  // Provides     - (showShadow, show)
  // Implements   - ()
  abstract class Collectable extends Object {

    // #region - Setup

    Collectable(PVector pos_, PVector size_) {
      // Initialize variables
      super(pos_, size_);

      // Other setup
      tags.add("collectable");
    }

    // #endregion


    // #region - Main

    @Override
    void earlyUpdate() {
      // Update movement before other
      movement();
      super.earlyUpdate();
    }


    void movement() {
      // Apply friction and update pos
      vel.x *= 0.94;
      vel.y *= 0.94;
      vel.z -= 0.5;
      pos.add(vel);

      // Prevent moving through floor
      if (pos.z <= 0) {
        vel.z = max(vel.z, 0);
        pos.z = max(vel.z, 0);
      }
    }


    void gravitateTowards(PVector oPos, float range, float strength) {
      // Gravitate towards a position when in range with a specific strength
      PVector vec = oPos.copy().sub(pos);
      float mag = vec.mag();
      if (mag < range) {
        float magSq = mag * mag;
        PVector dir = vec.normalize();
        vel.add(dir.mult(min(strength * 0.001 + strength / magSq, 15)));
      }
    }


    // to be implemented
    abstract void showShadow();
    abstract void show();
    abstract void collect();

    // #endregion
  }


  // ----------------------------- Inheritance level 2

  // Constructor  - (pos)
  // Provides     - ()
  // Implements   - (showShadow, show)
  class Coin extends Collectable {

    // #region - Setup

    Coin(PVector pos_) {
      // Initialize variables
      super(pos_, new PVector(20, 20));

      // Other setup
      animationController.playAnimation("Coin", "Idle");
      tags.add("coin");
    }

    // #endregion


    // #region - Main

    @Override
    void earlyUpdate() {
      // Gravitate towards player and collect
      PVector pPos = gameManager.player.pos.copy();
      gravitateTowards(gameManager.player.pos, 200, 250);
      if (dist(pos.x, pos.y, pPos.x, pPos.y) < 20)
        collect();
      super.earlyUpdate();
    }

    @Override
    void showShadow() {
      // Show shadow as transparent flat circle
      fill(50, 100);
      noStroke();
      PVector shadowPos = pos.copy();
      shadowPos.z = 0;
      PVector screenPos = convertWorldToScreen(shadowPos);
      PVector screenSize = convertWorldToScreen(size);
      ellipse(screenPos.x, screenPos.y, screenSize.x, screenSize.y);
    }

    @Override
    void show() {
      animationController.show();
    }


    @Override
    void collect() {
      gameManager.objects.remove(this);
    }

    // #endregion
  }

  // #endregion

  // #endregion
}


// Singleton as global variable 'assetManager'
// Handles loading, storing and getting images and sounds
static class AssetsManager {

  // #region - Setup

  // Declare static variables
  static HashMap<String, HashMap<String, Animation>> animations;


  static void initialize(Strayed1 s) {
    // Initialize static variables
    AssetsManager.animations = new HashMap<String, HashMap<String, Animation>>();

    // Load assets
    loadAnimations(s);
  }


  static void loadAnimations(Strayed1 s) {
    // Setup all coin animations
    HashMap<String, Animation> coinAnimations = new HashMap<String, Animation>();
    coinAnimations.put("Idle", s.new Animation("Idle", new AnimationFrame[] {
      s.new AnimationFrame(new PVector(0, 0.5), 1, s.loadImage("assets/images/collectables/Coin0.png"))
    }, Animation.LOOPING));
    animations.put("Coin", coinAnimations);
  }

  // #endregion


  // #region - Main

  static Animation getAnimation(String objectName, String animationName) {
    // Return a specific animation for a specific object
    HashMap<String, Animation> objectAnimations = animations.get(objectName);
    if (objectAnimations == null) return null;
    else return objectAnimations.get(animationName);
  }

  // #endregion
}


// AnimationController, Animation, AnimationFrame
// #region - Animation

// Linked to and controlled by a GameManager.Object
// Plays animations and manages priorities and looping
class AnimationController {

  // #region - Setup

  // Declare variables
  GameManager.Object object;
  Animation animation;
  int currentFrame;


  AnimationController(GameManager.Object object_) {
    // Initialize variables
    object = object_;
    animation = null;
    currentFrame = 0;
  }

  // #endregion


  // #region - Main

  void show() {
    if (animation != null) {
      // Show current animation
      AnimationFrame frame = animation.frames[currentFrame];
      PVector showPos = gameManager.convertWorldToScreen(object.getShowPosition());
      image(
        frame.image,
        showPos.x - frame.basePos.x * object.size.x,
        showPos.y - frame.basePos.y * object.size.y,
        object.size.x, object.size.y
      );

      // Update frame
      currentFrame++;
      if (currentFrame == animation.frames.length) {
        if (animation.type == animation.ONESHOT)
          finishAnimation();
        else if (animation.type == animation.LOOPING)
          currentFrame = 0;
      }
    }
  }


  boolean playAnimation(String objectName, String animationName) {
    // Start a specific animation
    animation = AssetsManager.getAnimation(objectName, animationName);
    if (animation == null) return false;
    currentFrame = 0;
    return true;
  }


  void finishAnimation() {
    // Remove and reset animation
    animation = null;
    currentFrame = 0;
  }

  // #endregion
}


// Storage class for full animations
class Animation {

  // #region - Setup

  // Initialize static variables
  static final int ONESHOT = 0;
  static final int LOOPING = 1;
  static final int SINGLE = 2;

  // Declare variables
  String name;
  AnimationFrame[] frames;
  int type;

  Animation(String name_, AnimationFrame[] frames_, int type_) {
    // Initialize variables
    name = name_;
    frames = frames_;
    type = type_;
  }

  // #endregion
}


// Storage class for single animation frames
class AnimationFrame {

  // #region - Setup

  // Declare variables
  PVector basePos;
  PImage image;
  int maxTime;
  int time;


  AnimationFrame(PVector basePos_, int time_,  PImage image_) {
    // Initialize variables
    basePos = basePos_;
    maxTime = time_;
    time = 0;
    image = image_;
  }

  // #endregion
}

// #endregion
