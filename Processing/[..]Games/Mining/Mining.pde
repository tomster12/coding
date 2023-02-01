
import java.util.Map;
import java.util.function.Consumer;


// #region - Utility

PVector getDirection(int dir) {
  if (dir == 0) return new PVector(1, 0);
  else if (dir == 1) return new PVector(0, 1);
  else if (dir == 2) return new PVector(-1, 0);
  else if (dir == 3) return new PVector(0, -1);
  else return new PVector(0, 0);
}

// #endregion


// #region - Static

class Ore {

  String name;
  color colFull, colEmpty, colItem;


  Ore(String name_, color colFull_, color colEmpty_, color colItem_) {
    // Initialize variables
    name = name_;
    colFull = colFull_;
    colEmpty = colEmpty_;
    colItem = colItem_;
  }
}


HashMap<String, Ore> ORES = new HashMap<String, Ore>();


void initStatic() {
  ORES.put("gold", new Ore("gold", color(200, 100, 200), color(60, 40, 60), color (220, 110, 220)));
  ORES.put("iron", new Ore("iron", color(50, 50, 180), color(40, 40, 70), color(65, 65, 200)));
}

// #endregion


// #region - Driver

Controller CONTROLLER;
World WORLD;
Camera CAM;
Input INP;


void setup() {
  // Initialize processing
  initStatic();
  size(1200, 800);
  noSmooth();
  noStroke();
  strokeWeight(4);

  // Initialize globals
  final int gridWidth = 200;
  final int gridHeight = 200;
  CONTROLLER = new Controller();
  WORLD = new World(gridWidth, gridHeight);
  CAM = new Camera(gridWidth, gridHeight, 50, 50, 20);
  INP = new Input();

  // Initialize world
  WORLD.addBody(49, 50, new OreDeposit(ORES.get("gold"), 10));
  WORLD.addBody(50, 50, new OreDeposit(ORES.get("gold"), 10));
  WORLD.addBody(51, 50, new OreDeposit(ORES.get("gold"), 10));
  WORLD.addBody(52, 50, new OreDeposit(ORES.get("gold"), 10));
  WORLD.addBody(49, 51, new OreDeposit(ORES.get("gold"), 10));
  WORLD.addBody(50, 51, new OreDeposit(ORES.get("gold"), 10));
  WORLD.addBody(51, 51, new OreDeposit(ORES.get("gold"), 10));

  WORLD.addBody(49, 47, new OreDeposit(ORES.get("iron"), 10));
  WORLD.addBody(50, 47, new OreDeposit(ORES.get("iron"), 10));
  WORLD.addBody(51, 47, new OreDeposit(ORES.get("iron"), 10));
  WORLD.addBody(49, 46, new OreDeposit(ORES.get("iron"), 10));
  WORLD.addBody(50, 46, new OreDeposit(ORES.get("iron"), 10));
  WORLD.addBody(51, 46, new OreDeposit(ORES.get("iron"), 10));
  WORLD.addBody(50, 46, new OreDeposit(ORES.get("iron"), 10));
  WORLD.addBody(51, 46, new OreDeposit(ORES.get("iron"), 10));
}


void draw() {
  CONTROLLER.update();
  WORLD.update();
  CAM.update();
  WORLD.lateUpdate();
  INP.lateUpdate();
  CAM.show();
}


void mousePressed() { INP.mousePressed(); }

void mouseReleased() { INP.mouseReleased(); }

void keyPressed() { INP.keyPressed(); }

void keyReleased() { INP.keyReleased(); }

void mouseWheel(MouseEvent event) { INP.zoom(event.getCount()); }

// #endregion


// #region - Main

class Controller {

  final float MOVE_SPEED = 0.4f;
  final float ZOOM_SPEED = 1.0f;
  final float HOVER_LERP = 0.85f;
  final String[] OPTIONS = new String[] { "Conveyor", "Miner", "Bin" };

  Entity hoveredEntity;
  Entity selectedEntity;
  PVector hoverWPos;
  PVector hoverSPos;
  PVector hoverSPosLerp;
  PVector selectedSPos;

  int placementDir = 0;
  int placementOption = -1;


  void update() {
    hoverWPos = CAM.convertStW(mouseX, mouseY);

    // Handle camera input
    PVector dir = new PVector(0, 0);
    if (INP.getKeyHeld(65)) dir.x--;
    if (INP.getKeyHeld(87)) dir.y--;
    if (INP.getKeyHeld(68)) dir.x++;
    if (INP.getKeyHeld(83)) dir.y++;
    CAM.move(dir.mult(ZOOM_SPEED / CAM.camScale));
    CAM.zoom(-INP.zoomAmount * MOVE_SPEED);

    // Remove objects while holding right click
    if (INP.getMouseHeld(RIGHT)) {
      WORLD.removeBody((int)hoverWPos.x, (int)hoverWPos.y);
      WORLD.removeItem((int)hoverWPos.x, (int)hoverWPos.y);
    }

    if (placementOption == -1) {
      // Handle hovering entity
      Entity newHoveredEntity = WORLD.getTopEntity((int)hoverWPos.x, (int)hoverWPos.y);
      if (hoveredEntity != null) hoveredEntity.isHovered = false;
      if (newHoveredEntity != null) newHoveredEntity.isHovered = true;
      hoveredEntity = newHoveredEntity; 

      // Handle selecting entity
      if (INP.getMousePressed(LEFT)) {
        if (selectedEntity != null) selectedEntity.isSelected = false;
        if (hoveredEntity != null) hoveredEntity.isSelected = true;
        selectedEntity = hoveredEntity;
      }

    } else {
      hoveredEntity = null;
      selectedEntity = null;
    }

    // Update UI parts
    updateUI();
  }


  void showScreen() {
    // Lerp hover pos to target
    hoverSPos = CAM.getAlignedS(mouseX, mouseY);
    if (hoverSPosLerp == null) hoverSPosLerp = new PVector(hoverSPos.x, hoverSPos.y);
    hoverSPosLerp.x = lerp(hoverSPosLerp.x, hoverSPos.x, HOVER_LERP);
    hoverSPosLerp.y = lerp(hoverSPosLerp.y, hoverSPos.y, HOVER_LERP);

    // Show box over hovered entity
    fill(150, 100);
    rect(hoverSPosLerp.x, hoverSPosLerp.y, CAM.gridScreenSize, CAM.gridScreenSize);

    // Show outline over selected entity
    if (selectedEntity != null) {
      selectedSPos = CAM.convertWtS(selectedEntity.pos);
      stroke(255);
      noFill();
      rect(selectedSPos.x, selectedSPos.y, CAM.gridScreenSize, CAM.gridScreenSize);
      noStroke();
    }

    // Show UI parts
    showScreenUI();
  }


  // #region - UI

  void updateUI() {
    // Handle placement input
    if (INP.getKeyPressed(82)) placementDir = (placementDir + 1) % 4;
    for (int i = 0; i < OPTIONS.length; i++) {
      if (INP.getKeyPressed(49 + i)) placementOption = i;
    }
    if (INP.getKeyPressed(9)) placementOption = -1;

    // Place new object
    if (placementOption != -1) {
      if (INP.getMouseHeld(LEFT)) {
        if (!WORLD.getBodyBlocked(hoverWPos)) {
          Body newBody;
          String entityChoice = OPTIONS[placementOption];
          if (entityChoice == "Conveyor") newBody = new Conveyor(placementDir);
          else if (entityChoice == "Miner") newBody = new Miner(placementDir);
          else newBody = new Bin();
          WORLD.addBody((int)hoverWPos.x, (int)hoverWPos.y, newBody);
        }
      }
    }
  }


  void showScreenUI() {
    if (placementOption != -1) {
      String entityChoice = OPTIONS[placementOption];
      textAlign(LEFT, TOP);
      textSize(30);
      text(entityChoice, 10, 10);
      text(placementDir, 10, 45);
    }
  }

  // #endregion
}

class World {

  PGraphics output;
  int gridWidth, gridHeight;
  ArrayList<Body> bodyEntities;
  ArrayList<Item> itemEntities;
  ArrayList<Item> movingItemEntities;
  Body[][] bodyGrid;
  Item[][] itemGrid;


  World(int gridWidth_, int gridHeight_) {
    // Initialize variables
    gridWidth = gridWidth_;
    gridHeight = gridHeight_;
    output = createGraphics(gridWidth_, gridHeight_);
    output.noSmooth();
    bodyEntities = new ArrayList<Body>();
    itemEntities = new ArrayList<Item>();
    movingItemEntities = new ArrayList<Item>();
    bodyGrid = new Body[gridWidth_][gridHeight_];
    itemGrid = new Item[gridWidth_][gridHeight_];
  }


  // #region - Driver

  void update() {
    for (Entity body : bodyEntities) body.update();
    for (Entity item : itemEntities) item.update();
    resolveItemMovements();
  }

  void lateUpdate() {
    for (Entity body : bodyEntities) body.lateUpdate();
    for (Entity item : itemEntities) item.lateUpdate();
  }


  void showWorld() {
    output.beginDraw();
    output.background(20);
    output.loadPixels();
    for (Entity e : bodyEntities) e.showWorld();
    for (Entity e : itemEntities) e.showWorld();
    output.updatePixels();
    output.endDraw();
    image(output, 0, 0);
  }

  void showScreen() {
    for (Entity e : bodyEntities) e.showScreen();
    for (Entity e : itemEntities) e.showScreen();
  }

  // #endregion


  // #region - Entities

  void resolveItemMovements() {
    // If there are items to move
    if (movingItemEntities.size() > 0) {
      Item[][] toMoveGrid = new Item[gridWidth][gridHeight];
      ArrayList<Item> toMoveItems = new ArrayList<Item>();

      // Loop over all potential movements
      for (Item item : movingItemEntities) {
        Item current = item;
        while (current != null) {

          // Check if blocked
          int nextX = (int)current.nextPos.x;
          int nextY = (int)current.nextPos.y;
          boolean bodyBlocked = getItemBodyBlocked(current, nextX, nextY);
          boolean itemBlocked =
            toMoveGrid[nextX][nextY] != null
            || itemGrid[nextX][nextY] != null
              && itemGrid[nextX][nextY].nextPos == null;

          // Not blocked, so add to the move list
          if (!bodyBlocked && !itemBlocked) {
            if (toMoveGrid[nextX][nextY] != current) {
              toMoveGrid[nextX][nextY] = current;
              toMoveItems.add(current);
              current = null;
            }

          // Blocked, so remove from move list and loop
          } else {
            if (toMoveGrid[nextX][nextY] == current) {
              toMoveGrid[nextX][nextY] = null;
              toMoveItems.remove(current);
            }
            current.nextPos = null;
            current = toMoveGrid[(int)current.pos.x][(int)current.pos.y];
          }
        }
      }

      // Loop over finalised movements and perform
      for (Item item : toMoveItems) itemGrid[(int)item.pos.x][(int)item.pos.y] = null;
      for (Item item : toMoveItems) {
        itemGrid[(int)item.nextPos.x][(int)item.nextPos.y] = item;
        item.pos = item.nextPos;
        item.nextPos = null;
      }
      movingItemEntities.clear();
    }
  }


  boolean addBody(int x, int y, Body body) { 
    if (getOutsideBounds(x, y)) {
      // println("Canot add body entity at " + x + ", " + y + ": position out of bounds");
      return false;
    }
    if (bodyGrid[x][y] != null) {
      // println("Canot add body entity at " + x + ", " + y + ": body entity already there");
      return false;
    }
    if (itemGrid[x][y] != null && body.getItemBodyBlocked(itemGrid[x][y])) {
      // println("Canot add body entity at " + x + ", " + y + ": item entity blocks position");
      return false;
    }
    bodyEntities.add(body);
    bodyGrid[x][y] = body;
    body.pos = new PVector(x, y);
    return true;
  }

  boolean addItem(int x, int y, Item item) {
    if (getOutsideBounds(x, y)) {
      // println("Canot add item entity at " + x + ", " + y + ": position out of bounds");
      return false;
    }
    if (itemGrid[x][y] != null) {
      // println("Canot add item entity at " + x + ", " + y + ": item already there");
      return false;
    }
    if (getItemBodyBlocked(item, x, y)) {
      // println("Canot add item entity at " + x + ", " + y + ": grid position blocked for items");
      return false;
    }
    itemEntities.add(item);
    itemGrid[x][y] = item;
    item.pos = new PVector(x, y);
    return true;
  }


  boolean getBodyBlocked(PVector pos) { return getBodyBlocked((int)pos.x, (int)pos.y); }
  boolean getBodyBlocked(int x, int y) {
    if (getOutsideBounds(x, y)) return true;
    return bodyGrid[x][y] != null;
  }

  boolean getItemBlocked(Item item, int x, int y) {
    return getItemBodyBlocked(item, x, y) || itemGrid[x][y] != null;
  }

  boolean getItemBodyBlocked(Item item, int x, int y) {
    if (getOutsideBounds(x, y)) return true;
    if (bodyGrid[x][y] != null) return bodyGrid[x][y].getItemBodyBlocked(item);
    return false;
  }


  boolean tryMoveItem(Item item, int tx, int ty) { return tryMoveItem((int)item.pos.x, (int)item.pos.y, tx, ty); }
  boolean tryMoveItem(int sx, int sy, int tx, int ty) {
    if (getOutsideBounds(tx, ty)) {
      println("Canot move item entity to " + tx + ", " + ty + ": position out of bounds");
      return false;
    }
    if (itemGrid[sx][sy] == null) {
      println("Canot move item entity from " + sx + ", " + sy + ": item entity does not exist");
      return false;
    }
    if (itemGrid[sx][sy].nextPos != null) {
      println("Canot move item entity to " + tx + ", " + ty + ": item is already moving");
      return false;
    }
    itemGrid[sx][sy].nextPos = new PVector(tx, ty);
    movingItemEntities.add(itemGrid[sx][sy]);
    return true;
  }


  boolean removeBody(PVector pos) { return removeBody((int)pos.x, (int)pos.y); }
  boolean removeBody(int x, int y) {
    if (getOutsideBounds(x, y)) {
      // println("Canot remove body entity from " + x + ", " + y + ": position out of bounds");
      return false;
    }
    if (bodyGrid[x][y] == null) {
      // println("Canot remove body entity from " + x + ", " + y + ": body entity does not exist");
      return false;
    }
    bodyEntities.remove(bodyGrid[x][y]);
    bodyGrid[x][y] = null;
    return true;
  }

  boolean removeItem(PVector pos) { return removeItem((int)pos.x, (int)pos.y); }
  boolean removeItem(int x, int y) {
    if (getOutsideBounds(x, y)) {
      // println("Canot remove item entity from " + x + ", " + y + ": position out of bounds");
      return false;
    }
    if (itemGrid[x][y] == null) {
      // println("Canot remove item entity from " + x + ", " + y + ": item entity does not exist");
      return false;
    }
    itemEntities.remove(itemGrid[x][y]);
    itemGrid[x][y] = null;
    return true;
  }


  Item getItem(PVector pos) { return getItem((int)pos.x, (int)pos.y); }
  Item getItem(int x, int y) {
    if (getOutsideBounds(x, y)) return null;
    if (itemGrid[x][y] != null) return itemGrid[x][y];
    return null;
  }

  Body getBody(PVector pos) { return getBody((int)pos.x, (int)pos.y); }
  Body getBody(int x, int y) {
    if (getOutsideBounds(x, y)) return null;
    if (bodyGrid[x][y] != null) return bodyGrid[x][y];
    return null;
  }

  Entity getTopEntity(PVector pos) { return getTopEntity((int)pos.x, (int)pos.y); }
  Entity getTopEntity(int x, int y) {
    if (getOutsideBounds(x, y)) return null;
    if (itemGrid[x][y] != null) return itemGrid[x][y];
    if (bodyGrid[x][y] != null) return bodyGrid[x][y];
    return null;
  }

  Entity getBottomEntity(PVector pos) { return getBottomEntity((int)pos.x, (int)pos.y); }
  Entity getBottomEntity(int x, int y) {
    if (getOutsideBounds(x, y)) return null;
    if (bodyGrid[x][y] != null) return bodyGrid[x][y];
    if (itemGrid[x][y] != null) return itemGrid[x][y];
    return null;
  }

  // #endregion


  // #region - Other
  
  boolean getOutsideBounds(int x, int y) {
    return x < 0 || x >= gridWidth || y < 0 || y >= gridHeight;
  }

  // #endregion
}

class Camera {

  final float[] ZOOM_MIN_MAX = new float[] { 1, 100 };
  final float ZOOM_DRAG = 0.85f;
  final float MOVE_DRAG = 0.85f;

  float gridScreenSize;
  PVector camPos;
  PVector camVel;
  float camScale;
  float camScaleVel;


  Camera(
    int gridWidth_, int gridHeight_,
    float startX_, float startY_,
    float startScale_
  ) {
    // Initialize variables
    camPos = new PVector(startX_, startY_);
    camVel = new PVector(0, 0);
    camScale = startScale_;
    camScaleVel = 0;
  }


  void update() {
    // Update cam position, scale and velocity
    camPos = camPos.add(camVel);
    camVel = camVel.mult(MOVE_DRAG);
    camScale *= (1.0f + camScaleVel * 0.1f);
    camScale = min(max(camScale, ZOOM_MIN_MAX[0]), ZOOM_MIN_MAX[1]);
    camScaleVel *= ZOOM_DRAG;

    // Update variables
    gridScreenSize = CAM.getScreenGridSize();
  }


  void show() {
    // Clear output
    background(0);

    // Transform and show world space
    push();
    translate(width * 0.5f, height * 0.5f);
    scale(camScale);
    translate(-camPos.x, -camPos.y);
    WORLD.showWorld();
    pop();

    // Show screen space
    WORLD.showScreen();
    CONTROLLER.showScreen();
  }


  void move(PVector dir) { camVel = camVel.add(dir); }

  void zoom(float dir) { if (dir != 0) camScaleVel = dir; }


  PVector convertStW(PVector scp) { return convertStW(scp.x, scp.y); }
  PVector convertStW(float scx, float scy) {
    float wx = (scx - width * 0.5f) / camScale + camPos.x;
    float wy = (scy - height * 0.5f) / camScale + camPos.y;
    return new PVector((int)wx, (int)wy);
  }

  PVector convertWtS(PVector wp) { return convertWtS(wp.x, wp.y); }
  PVector convertWtS(float wx, float wy) {
    float scx = (wx - camPos.x) * camScale + width * 0.5f;
    float scy = (wy - camPos.y) * camScale + height * 0.5f;
    return new PVector(scx, scy);
  }

  PVector getAlignedS(int scx, int scy) { return convertWtS(convertStW(scx, scy)); }
  float getScreenGridSize() { return camScale; }
}

class Input {

  HashMap<Integer, Boolean> keysPressed = new HashMap<Integer, Boolean>();
  HashMap<Integer, Boolean> keysHeld = new HashMap<Integer, Boolean>();
  HashMap<Integer, Boolean> mousePressed = new HashMap<Integer, Boolean>();
  HashMap<Integer, Boolean> mouseHeld = new HashMap<Integer, Boolean>();
  int zoomAmount;


  void lateUpdate() {
    for (int key : keysPressed.keySet()) keysPressed.put(key, false);
    for (int mb : mousePressed.keySet()) mousePressed.put(mb, false);
    zoomAmount = 0;
  }


  boolean getMousePressed(int mouseButton) {
    return mousePressed.get(mouseButton) != null ? mousePressed.get(mouseButton) : false;
  }

  boolean getMouseHeld(int mouseButton) {
    return mouseHeld.get(mouseButton) != null ? mouseHeld.get(mouseButton) : false;
  }

  boolean getKeyPressed(int keyCode) {
    return keysPressed.get(keyCode) != null ? keysPressed.get(keyCode) : false;
  }

  boolean getKeyHeld(int keyCode) {
    return keysHeld.get(keyCode) != null ? keysHeld.get(keyCode) : false;
  }


  void mousePressed() {
    mousePressed.put(mouseButton, true);
    mouseHeld.put(mouseButton, true);
  }

  void mouseReleased() {
    mouseHeld.put(mouseButton, false);
  }

  void keyPressed() {
    keysPressed.put(keyCode, true);
    keysHeld.put(keyCode, true);
  }

  void keyReleased() {
    keysHeld.put(keyCode, false);
  }


  void zoom(int amount) { zoomAmount = amount; }
}

// #endregion


// #region - Entities

class Entity {

  PVector pos;
  boolean isHovered = false;
  boolean isSelected = false;
  color col = color(255, 255, 255);


  void update() {}

  void lateUpdate() {}


  void showWorld() {
    WORLD.output.pixels[(int)pos.y * WORLD.gridWidth + (int)pos.x] = col;
  }

  void showScreen() {}
}


class Body extends Entity {

  boolean blockItems = true;


  boolean getItemBodyBlocked(Item item) { return blockItems; }
}

class OreDeposit extends Body {

  Ore ore;
  int count;


  OreDeposit(Ore ore_, int count_) {
    ore = ore_;
    count = count_;
    col = ore.colFull;
  }


  OreItem getItem() { return new OreItem(ore); }
  void decrease() { count = max(count - 1, 0); }
}


class Building extends Body {

  int dir = 0;


  Building() { }

  Building(int dir_) {
    dir = dir_;
  }
}

class Miner extends Building {

  final int INTERVAL = 120;

  PVector fromDir;
  PVector toDir;


  Miner(int dir_) {
    super(dir_);
    col = color(50, 50, 50);
    fromDir = getDirection((dir + 2) % 4);
    toDir = getDirection(dir);
  }


  @Override
  void lateUpdate() {
    // Mine on an interval
    if (frameCount % INTERVAL == 0) {

      // Check for a deposit at the mining location
      Body body = WORLD.getBody((int)(pos.x + fromDir.x), (int)(pos.y + fromDir.y));
      OreDeposit deposit = (body instanceof OreDeposit) ? (OreDeposit)body : null;
      if (deposit != null) {

        // Extract ore if there is space in the world
        OreItem item = deposit.getItem();
        int newX = (int)(pos.x + toDir.x);
        int newY = (int)(pos.y + toDir.y);
        if (!WORLD.getItemBlocked(item, newX, newY)) {
          WORLD.addItem(newX, newY, item);
          deposit.decrease();
        }
      }
    }
  }


  @Override
  void showScreen() {
    // Show next position if selected
    if (isSelected) {
      PVector fromPos = CAM.convertWtS(pos.x + fromDir.x, pos.y + fromDir.y);
      PVector toPos = CAM.convertWtS(pos.x + toDir.x, pos.y + toDir.y);
      fill(255, 150);
      rect(fromPos.x, fromPos.y, CAM.gridScreenSize, CAM.gridScreenSize);
      rect(toPos.x, toPos.y, CAM.gridScreenSize, CAM.gridScreenSize);
    }
  }
}

class Conveyor extends Building {

  final int INTERVAL = 40;

  PVector movementDir;


  Conveyor(int dir_) {
    super(dir_);
    blockItems = false;
    col = color(125 + dir * 10);
    movementDir = getDirection(dir);
  }


  @Override
  void update() {
    // Move any item ontop
    if (frameCount % INTERVAL == 0) {
      Item item = WORLD.getItem((int)pos.x, (int)pos.y);
      if (item != null) {
        int newX = (int)(pos.x + movementDir.x);
        int newY = (int)(pos.y + movementDir.y);
        WORLD.tryMoveItem(item, newX, newY);
      }
    }
  }


  @Override
  void showScreen() {
    // Show next position if selected
    if (isSelected) {
      PVector nextPos = CAM.convertWtS(pos.x + movementDir.x, pos.y + movementDir.y);
      fill(255, 150);
      rect(nextPos.x, nextPos.y, CAM.gridScreenSize, CAM.gridScreenSize);
    }
  }
}

class Bin extends Building {

  final int INTERVAL = 10;


  Bin() {
    blockItems = false;
    col = color(60);
  }


  @Override
  void lateUpdate() {
    // Remove any item ontop
    if (frameCount % INTERVAL == 0) {
      WORLD.removeItem((int)pos.x, (int)pos.y);
    }
  }
}


class Item extends Entity {

  int count;
  PVector nextPos;


  Item() {
    col = color(100, 200, 100);
  }


  void changeCount(int amount) { count += amount; }
}

class OreItem extends Item {

  Ore ore;


  OreItem(Ore ore_) {
    ore = ore_;
    col = ore.colItem;
  }
}

// #endregion
