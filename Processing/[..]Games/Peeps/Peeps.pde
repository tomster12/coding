
import java.util.*;
import processing.sound.*;


// #region - Setup

AssetManager ASSETS;
Input INPUT;
Game GAME;


void preload() {
}


void setup() {
    // Setup canvas
    size(1500, 1000);
    imageMode(CENTER);
    rectMode(CORNER);
    noSmooth();

    // Load all the images
    ASSETS = new AssetManager(this);
    ASSETS.addImage("stab0", "stab0.png");
    ASSETS.addImage("stab1", "stab1.png");
    ASSETS.addImage("cursor", "cursor.png");

    ASSETS.addSound("walk", "walk.wav");
    ASSETS.addSound("fire", "fire.wav");
    ASSETS.addSound("pain", "pain.wav");
    ASSETS.addSound("die", "die.wav");

    // Setup globals
    INPUT = new Input();
    GAME = new Game(40, 40);
}


void draw() {
    GAME.draw();
    INPUT.lateUpdate();
}


void keyPressed() { INPUT.onKeyPressed(keyCode); }
void keyReleased() { INPUT.onKeyReleased(keyCode); }
void mousePressed() { INPUT.onMousePressed(mouseButton); }
void mouseReleased() { INPUT.onMouseReleased(mouseButton); }
void mouseWheel(MouseEvent event) { INPUT.onMouseWheel(event.getCount()); }

// #endregion


// #region - Game

class Game {

    // #region - Setup

    PGraphics output;
    Int2 gridSize;
    GameCamera cam;
    GameInteractor intr;
    GameParticler ptc;

    Stain[][] stainGrid;
    ArrayList<Stain> stainList;
    ArrayList<Entity> entityList;
    ArrayList<Entity> entityListOrdered;
    GridEntity[][] entityGrid;
    ArrayList<Peep> entityListPeepView;
    ArrayList<Entity> entityQueue;


    Game(int gridSizeX, int gridSizeY) {
        // Initialize variables
        this.gridSize = new Int2(gridSizeX, gridSizeY);
        this.output = createGraphics(this.gridSize.x, this.gridSize.y);
        this.cam = new GameCamera(this);
        this.intr = new GameInteractor(this);
        this.ptc = new GameParticler(this);

        // Intitialize entity containers
        this.stainGrid = new Stain[gridSize.x][gridSize.y];
        this.stainList = new ArrayList<Stain>();
        this.entityList = new ArrayList<Entity>();
        this.entityListOrdered = new ArrayList<Entity>();
        this.entityGrid = new GridEntity[gridSize.x][gridSize.y];
        this.entityListPeepView = new ArrayList<Peep>();
        this.entityQueue = new ArrayList<Entity>();

        // Add a wall
        for (int i = 0; i < 15; i++) {
            Int2 pos = new Int2(10 + i, 10);
            if (this.isBlocked(pos)) continue;
            this.addEntity(new Wall(this, pos, i < 10 ? 4 : 3));
        }

        // Add another wall
        for (int i = 0; i < 15; i++) {
            Int2 pos = new Int2(10, 11 + i);
            if (this.isBlocked(pos)) continue;
            this.addEntity(new Wall(this, pos, i < 10 ? 4 : 3));
        }

        // Add arbitrary campfires
        // for (int i = 0; i < 15; i++)
        // {
        //     Int2 pos = new Int2((int)random(this.gridSize.x), (int)random(this.gridSize.y));
        //     if (this.isBlocked(pos)) continue;
        //     this.addEntity(new Campfire(this, pos));
        // }
        this.addEntity(new Campfire(this, new Int2(20, 20)));

        // Add arbitrary peeps
        for (int i = 0; i < 5; i++)
        {
            Int3 pos = new Int3((int)random(this.gridSize.x), (int)random(this.gridSize.y), 0);
            // Int3 pos = new Int3(20, 20, 0);
            if (this.isBlocked(pos)) continue;
            this.addEntity(new Peep(this, pos));
        }
    }

    // #endregion


    // #region - Main

    void draw() {
        update();
        show();
    }


    void update() {
        // Update camera, interactor
        this.cam.update();
        this.intr.update();

        // Add all entites from queue
        while (this.entityQueue.size() > 0) {
            Entity e = this.entityQueue.get(0);
            this.addEntity(e);
            this.entityQueue.remove(0);
        }

        // Update all entities
        for (Entity e : this.entityList) e.update();

        // Update all particles
        this.ptc.update();
    }


    void show() {
        background(0);

        // Calculate entity draw orders
        this.entityListOrdered = this.entityList;
        Collections.sort(this.entityListOrdered);

        // Begin draw, show entites, end draw
        this.output.beginDraw();
        this.output.background(200);
        this.output.loadPixels();
        for (Stain s : this.stainList) s.show();
        for (Entity e : this.entityListOrdered) e.preshow();
        for (Entity e : this.entityListOrdered) e.show();
        this.output.updatePixels();
        this.output.endDraw();

        // Draw image at correct position
        push();
        cam.transform();
        image(this.output, 0, 0);
        pop();

        // Show interactor UI
        this.intr.showOntop();
    }

    // #endregion


    // #region - Utility

    void drawPixel(int x, int y, color cola) {
        // Draw pixel if within bounds
        if (!this.isInBounds(new Int2(x, y))) return;

        // Mix colors and show
        if (alpha(cola) != 255) {
            color colb = output.pixels[this.gridSize.x * y + x];
            output.pixels[this.gridSize.x * y + x] = blendColor(cola, colb, BLEND);
        }

        // Show to screen
        else output.pixels[this.gridSize.x * y + x] = cola;
    }


    boolean isInBounds(Int3 pos) { return isInBounds(pos.x, pos.y); }
    boolean isInBounds(Int2 pos) { return isInBounds(pos.x, pos.y); }
    boolean isInBounds(int x, int y) {
        // Check whether a point is within the bounds
        return (x >= 0 && x < this.gridSize.x && y >= 0 && y < this.gridSize.y);
    }

    boolean isBlocked(Int2 pos) { return isBlocked(pos.x, pos.y, 0); }
    boolean isBlocked(Int3 pos) { return isBlocked(pos.x, pos.y, pos.z); }
    boolean isBlocked(int x, int y, int z) {
        // Checks whether a point is blocked by static
        if (!isInBounds(x, y)) return true;
        if (entityGrid[x][y] != null) {
            return entityGrid[x][y].isBlocked(x, y, z);
        }
        return false;
    }


    void addEntity(Entity e) {
        // Add a static entity
        this.entityList.add(e);
    }

    void addEntityQueue(Entity e) {
        // Add a static entity
        this.entityQueue.add(e);
    }

    void addStain(Stain s) {
        // Add a stain
        this.stainList.add(s);
        if (this.stainGrid[s.pos.x][s.pos.y] != null) this.stainList.remove(this.stainGrid[s.pos.x][s.pos.y]);
        this.stainGrid[s.pos.x][s.pos.y] = s;
    }


    ArrayList<Peep> getHoveredPeeps(Int2 pos) {
        // Find all hovered entities
        ArrayList<Entity> hoveredEntities = new ArrayList<Entity>();
        if (isInBounds(pos.x, pos.y)) hoveredEntities.add(this.entityGrid[pos.x][pos.y]);
        if (isInBounds(pos.x, pos.y + 1)) hoveredEntities.add(this.entityGrid[pos.x][pos.y + 1]);
        if (isInBounds(pos.x, pos.y + 2)) hoveredEntities.add(this.entityGrid[pos.x][pos.y + 2]);

        // Convert all to peeps and return
        ArrayList<Peep> hoveredPeeps = new ArrayList<Peep>();
        for (Entity e : hoveredEntities) {
            if (e instanceof Peep) hoveredPeeps.add((Peep)e);
        }
        return hoveredPeeps;
    }

    // #endregion
}


class GameCamera {

    final float SHAKE_FREQ = 8.0;
    final float SHAKE_MAG = 0.5;
    Game game;
    Float2 pos;
    float zoom;
    int shakeAmount, shakeStart;


    GameCamera(Game game) {
        // Initialize variables
        this.game = game;
        this.pos = new Float2(0, 0);
        this.zoom = 16;
        this.shakeAmount = 0;
        this.shakeStart = -1;
    }


    void update() {
        // Control camera with INPUT
        if (INPUT.getKeyHeld(65)) this.pos.x--;
        if (INPUT.getKeyHeld(68)) this.pos.x++;
        if (INPUT.getKeyHeld(87)) this.pos.y--;
        if (INPUT.getKeyHeld(83)) this.pos.y++;
        this.zoom *= (1 - INPUT.wheelCount * 0.02);
        this.shakeAmount = max(0, this.shakeAmount - 1);
    }


    void transform() {
        // Move camera to correct position
        translate(width * 0.5, height * 0.5);
        scale(this.zoom);
        translate(-this.pos.x, -this.pos.y);

        // Apply camera shake
        if (shakeAmount > 0) {
            float t = (frameCount - shakeStart) / 60.0;
            float m = (shakeAmount > 45) ? 1 : (shakeAmount / 45.0);
            translate(0, sin(t * TWO_PI * SHAKE_FREQ) * (SHAKE_MAG + random(0.2)) * m);
        }
    }


    void shake(int shakeAmount) {
        // Apply camera shake
        this.shakeAmount += shakeAmount;
        this.shakeStart = frameCount;
    }


    Int2 convertScreenToGrid(Int2 screenPos) {
        // Convert a screen position to a grid position
        float gridX = (screenPos.x - width * 0.5) / this.zoom;
        float gridY = (screenPos.y - height * 0.5) / this.zoom;
        gridX += this.game.gridSize.x * 0.5 + this.game.cam.pos.x;
        gridY += this.game.gridSize.y * 0.5 + this.game.cam.pos.y;
        return new Int2((int)gridX, (int)gridY);
    }

    Int2 convertGridToScreen(Int2 gridPos) {
        // Convert a grid position to a screen position
        float screenX = width * 0.5 + (-pos.x - this.game.gridSize.x * 0.5 + gridPos.x) * zoom;
        float screenY = height * 0.5 + (-pos.y - this.game.gridSize.y * 0.5  + gridPos.y) * zoom;
        return new Int2((int)screenX, (int)screenY);
    }

    Float2 floorScreenToGrid(Int2 screenPos) {
        // Convert a screen position to a grid position
        float flooredX = screenPos.x - width * 0.5;
        float flooredY = screenPos.y - height * 0.5;
        flooredX = floor(flooredX / zoom) * zoom;
        flooredY = floor(flooredY / zoom) * zoom;
        flooredX += width * 0.5;
        flooredY += height * 0.5;
        return new Float2(flooredX, flooredY);
    }

    boolean isScreenInsideGrid(Int2 screenPos) {
        // Check if a screen position is inside the grid
        float tlx = (width * 0.5) - (this.game.gridSize.x * 0.5) * this.zoom;
        float tly = (height * 0.5) - (this.game.gridSize.y * 0.5) * this.zoom;
        float brx = (width * 0.5) + (this.game.gridSize.x * 0.5) * this.zoom;
        float bry = (height * 0.5) + (this.game.gridSize.y * 0.5) * this.zoom;
        return (screenPos.x >= tlx && screenPos.x < brx && screenPos.y >= tly && screenPos.y < bry);
    }
}


class GameInteractor {

    final color colBeheadHighlight = color(255, 100, 100, 100);
    final float CURSOR_LERP = 0.65;
    Game game;
    Float2 cursorLocationCurrent;
    Float2 cursorLocationTarget;
    Int2 cursorLocationGrid;
    boolean canPlace, canBehead, isBeheading;
    ArrayList<Peep> beheadablePeeps;


    GameInteractor(Game game) {
        // Initialize variables
        this.game = game;
    }


    void update() {
        // Calculate mouse position
        Int2 mousePos = new Int2(mouseX, mouseY);
        if (this.game.cam.isScreenInsideGrid(mousePos)) {
            this.cursorLocationTarget = this.game.cam.floorScreenToGrid(mousePos);
            if (this.cursorLocationCurrent == null) this.cursorLocationCurrent = this.cursorLocationTarget;
            this.cursorLocationGrid = this.game.cam.convertScreenToGrid(mousePos);
        }

        // Behead all peeps
        if (INPUT.getKeyPressed(32)) {
            for (Peep p : this.game.entityListPeepView) p.behead();
                this.game.cam.shake(45);
        }


        // Mouse overtop game
        if (this.cursorLocationGrid != null) {
            canPlace = false;
            canBehead = false;

            // Find beheadable peeps
            ArrayList<Peep> hoveredPeeps = this.game.getHoveredPeeps(this.cursorLocationGrid);
            beheadablePeeps = new ArrayList<Peep>();
            for (Peep p : hoveredPeeps) {
                if (!p.isBeheaded) beheadablePeeps.add(p);
            }

            // Behead
            if (beheadablePeeps.size() > 0) {
                canBehead = true;
                if (INPUT.getMousePressed(LEFT)) {
                    isBeheading = true;
                    for (Peep p : beheadablePeeps) p.behead();
                    this.game.cam.shake(25);
                }
            }

            // Create new peep
            if (!canBehead && !this.game.isBlocked(this.cursorLocationGrid)) {
                canPlace = true;
                if (INPUT.getMousePressed(LEFT)) {
                    Peep p = new Peep(this.game, new Int3(this.cursorLocationGrid.x, this.cursorLocationGrid.y, 0));
                    this.game.addEntity(p);
                }
            }
        }

        if (isBeheading && !INPUT.getMouseHeld(LEFT)) isBeheading = false;
    }


    void showOntop() {
        // Draw cursor and lerp
        if (this.cursorLocationCurrent != null) {

            // - Lerp cursor to target and lock if needed
            this.cursorLocationCurrent.x = lerp(this.cursorLocationCurrent.x, this.cursorLocationTarget.x, CURSOR_LERP);
            this.cursorLocationCurrent.y = lerp(this.cursorLocationCurrent.y, this.cursorLocationTarget.y, CURSOR_LERP);
            if ((this.cursorLocationTarget.x - this.cursorLocationCurrent.x) + (this.cursorLocationTarget.y - this.cursorLocationCurrent.y) < 0.01) {
                this.cursorLocationCurrent.x = this.cursorLocationTarget.x;
                this.cursorLocationCurrent.y = this.cursorLocationTarget.y;
            }

            // - Draw cursor
            if (isBeheading) {
                image(ASSETS.getImage("stab1"),
                    cursorLocationCurrent.x + this.game.cam.zoom * 3.5,
                    cursorLocationCurrent.y + this.game.cam.zoom * 0.25,
                    this.game.cam.zoom * 2.5,
                    this.game.cam.zoom * 2.5 * ((float)ASSETS.getImage("stab0").height / (float)ASSETS.getImage("stab0").width)
                );
            } else if (canBehead) {
                noStroke();
                fill(colBeheadHighlight);
                for (Peep p : beheadablePeeps) {
                    Int2 sPos = this.game.cam.convertGridToScreen(new Int2(p.pos.x, p.pos.y));
                    rect(sPos.x, sPos.y - this.game.cam.zoom * 2, this.game.cam.zoom, this.game.cam.zoom * 3);
                }
                image(ASSETS.getImage("stab0"),
                    cursorLocationCurrent.x + this.game.cam.zoom * 3.5,
                    cursorLocationCurrent.y + sin(((float)frameCount / 60) * TWO_PI * (1.0 / 2.0)) * this.game.cam.zoom * 0.25,
                    this.game.cam.zoom * 2.5,
                    this.game.cam.zoom * 2.5 * ((float)ASSETS.getImage("stab0").height / (float)ASSETS.getImage("stab0").width)
                );
            }
            image(ASSETS.getImage("cursor"),
                cursorLocationCurrent.x + this.game.cam.zoom * 0.5,
                cursorLocationCurrent.y + this.game.cam.zoom * 0.5,
                this.game.cam.zoom * (8.0 / 6.0),
                this.game.cam.zoom * (8.0 / 6.0) 
            );
        }
    }
}


class Stain {

    Game game;
    Int2 pos;
    String type;
    color col;


    Stain(Game game, Int2 pos, String type, color col) {
        // Initialize variables
        this.game = game;
        this.pos = pos;
        this.type = type;
        this.col = col;
    }


    void show() {
        // Draw single pixel
        this.game.drawPixel(this.pos.x, this.pos.y, col);
    }
}

// #endregion


// #region - Entities

class Entity implements Comparable<Entity> {

    Game game;
    Int3 pos;
    color colShadow;
    int priority;

    boolean onFire;
    Fire attachedFire;


    Entity(Game game, Int3 pos) {
        // Intialize variables
        this.game = game;
        this.pos = pos;
        colShadow = color(50, 200);
    }


    void update() { };

    void preshow() {
        // Draw shadow
        this.game.drawPixel(this.pos.x, this.pos.y, colShadow);
    };

    void show() { };


    void setPosition(Int3 pos) { this.setPosition(pos.x, pos.y, pos.z); }
    void setPosition(int x, int y, int z) {
        // Update position and grid
        this.pos.x = x;
        this.pos.y = y;
        this.pos.z = z;
    }


    @Override
    public int compareTo(Entity e) {
        // Override compare function for y / z
        int yCompare = Integer.compare(this.pos.y, e.pos.y);
        int zCompare = Integer.compare(this.pos.z, e.pos.z);
        if (yCompare != 0) return yCompare;
        if (zCompare != 0) return zCompare;
        return this.priority - e.priority;
    }
}

class GridEntity extends Entity {

    GridEntity(Game game, Int3 pos) {
        // Initialize variables
        super(game, pos);
        this.game.entityGrid[this.pos.x][this.pos.y] = this;
    }

    
    void setPosition(Int3 pos) { this.setPosition(pos.x, pos.y, pos.z); }
    @Override
    void setPosition(int x, int y, int z) {
        // Update position and grid
        this.game.entityGrid[this.pos.x][this.pos.y] = null;
        this.pos.x = x;
        this.pos.y = y;
        this.pos.z = z;
        this.game.entityGrid[this.pos.x][this.pos.y] = this;
    }


    boolean isBlocked(Int3 pos) { return this.isBlocked(pos.x, pos.y, pos.z); }
    boolean isBlocked(int x, int y, int z) {
        // Check whether other position is blocked by me
        return (x == this.pos.x && y == this.pos.y && z == this.pos.z);
    }
}

class Humanoid extends GridEntity {

    final int[] BEHEAD_PARTICLE_COUNT_RANGE = new int[] { 6, 9 };
    final int[] BEHEAD_PARTICLE_SPEED_RANGE = new int[] { 6, 9 };
    final int BEHEAD_SPURT_FREQUENCY = 22;
    final float BEHEAD_SPURT_SPEED = 2.5;
    final float BEHEAD_SPURT_DURATION = 180;
    color colLegs, colHead, colHeadTop, colBeheaded;
    boolean isAlive;
    boolean isBeheaded;
    int beheadFrame;


    Humanoid(Game game, Int3 pos) {
        // Initialize variables
        super(game, pos);
        this.colLegs = color(48, 59, 122);
        this.colHead = color(181, 144, 123);
        this.colHeadTop = lightenColor(this.colHead);
        this.colBeheaded = color(196, 51, 51);
        this.isAlive = true;
        this.isBeheaded = false;
    }

    @Override
    void update() {
        // Spray blood after death
        if (isBeheaded
            && ((frameCount - beheadFrame) < BEHEAD_SPURT_DURATION)
            && (frameCount % BEHEAD_SPURT_FREQUENCY == 0)
        ) {
            randomSprayBlood(BEHEAD_SPURT_SPEED);
        }
    }


    @Override
    void show() {
        // Draw body as 3 pixels
        this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z, colLegs);
        if (!this.isBeheaded) {
            this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z - 1, colHead);
            this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z - 2, colHeadTop);
        } else {
            this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z - 1, colBeheaded);
        }
    }


    void behead() {
        if (isBeheaded) return;
        
        // *Behead*
        isAlive = false;
        isBeheaded = true;
        beheadFrame = frameCount;
        ASSETS.getSound("die").play();

        // Spray a range of blood
        int amount = BEHEAD_PARTICLE_COUNT_RANGE[0] + (int)random(BEHEAD_PARTICLE_COUNT_RANGE[1] - BEHEAD_PARTICLE_COUNT_RANGE[0]);
        for (int i = 0; i < amount; i++) {
            float speed = BEHEAD_PARTICLE_SPEED_RANGE[0] + (int)random(BEHEAD_PARTICLE_SPEED_RANGE[1] - BEHEAD_PARTICLE_SPEED_RANGE[0]);
            randomSprayBlood(speed);
        }
    }


    void randomSprayBlood(float speed) {
        // Spray blood in a random direction
        float angle = random(TWO_PI);
        this.game.ptc.addParticleQueue(new BloodParticle(
            this.game,
            new Float3((float)this.pos.x, (float)this.pos.y, 1.0),
            new Float3(cos(angle) * speed, sin(angle) * speed, speed)
        ));
    }
    

    @Override 
    boolean isBlocked(int x, int y, int z) {
        // Check whether other position is blocked by me
        return (x == this.pos.x && y == this.pos.y && z >= this.pos.z && z <= this.pos.z + 1);
    }
}

class Peep extends Humanoid {

    final float WALK_SOUND_PCT = 0.35;
    final float PAIN_PCT = 0.02;
    final float MOVE_CHANCE = 0.05;
    final float PANICK_MOVE_CHANCE = 0.3;
    final float FIRE_DEATH_TIME = 240;
    boolean isPanicked;
    int onFireTimer;


    Peep(Game game, Int3 pos) {
        // Initialize variables
        super(game, pos);
        this.game.entityListPeepView.add(this);
        this.isPanicked = false;
        this.onFireTimer = 0;
    }


    @Override
    void update() {
        super.update();
        if (!this.isAlive) return;

        // Update state
        this.isPanicked = this.isAlive && this.onFire;
        if (this.onFire) this.onFireTimer++;
        else this.onFireTimer = 0;
        if (this.onFireTimer > FIRE_DEATH_TIME) this.behead();

        // Scream
        if (this.isPanicked && random(1) < PAIN_PCT) {
            ASSETS.getSound("pain").stop();
            ASSETS.getSound("pain").play();
        }

        // Random movement
        float r = random(1);
        if (this.isPanicked && r < PANICK_MOVE_CHANCE) moveRandomly();
        else if (r < MOVE_CHANCE) moveRandomly();
    }


    void moveRandomly() {
        // Try 4 times
        for (int i = 0; i < 4; i++) {

            // Pick a random direction
            int dx = (int)random(3) - 1;
            int dy = (int)random(3) - 1;
            int nx = this.pos.x + dx;
            int ny = this.pos.y + dy;

            // If can move, then do move
            if (!game.isBlocked(nx, ny, this.pos.z)) {
                setPosition(nx, ny, this.pos.z);

                // Play sound
                if (random(1) < WALK_SOUND_PCT) ASSETS.getSound("walk").play();
                return;
            }
        }
    }
}


class Campfire extends GridEntity {

    color col, colTop;


    Campfire(Game game, Int2 pos) {
        // Initialize variables
        super(game, new Int3(pos.x, pos.y, 0));
        this.col = color(71, 52, 41);
        this.colTop = lightenColor(this.col);

        // Create fire
        Fire f = new Fire(this.game, new Int3(this.pos.x, this.pos.y, this.pos.z), this);
        this.game.addEntity(f);
    }


    @Override
    void show() {
        // Draw body as 2 pixels
        this.game.drawPixel(this.pos.x, this.pos.y, col);
        this.game.drawPixel(this.pos.x, this.pos.y - 1, colTop);
    }
}

class Wall extends GridEntity {

    color colSide, colHeadTop;
    int height;


    Wall(Game game, Int2 pos, int height) {
        // Initialize variables
        super(game, new Int3(pos.x, pos.y, 0));
        this.height = height;
        this.colSide = color(59, 46, 38);
        this.colHeadTop = color(89, 75, 67);
    }


    @Override
    void show() {
        // Draw arbitrary rect
        for (int i = 0; i < this.height; i++) {
            this.game.drawPixel(this.pos.x, this.pos.y - i, colSide);
        }
        this.game.drawPixel(this.pos.x, this.pos.y - this.height, colHeadTop);
    }
    

    @Override 
    boolean isBlocked(int x, int y, int z) {
        // Check whether other position is blocked by me
        return (x == this.pos.x && y == this.pos.y && z >= this.pos.z && z <= this.pos.z + this.height);
    }
}


class Fire extends Entity {
    final float SOUND_PCT = 0.015;
    final int[] SMOKE_INTERVAL_INTERVAL = new int[] { 150, 170 };
    final int FIRE_INTERVAL = 60;
    final float SPREAD_CHANCE = 0.03;
    Entity attachedEntity;
    color col, colTop;
    int smokeInterval;


    Fire(Game game, Int3 pos, Entity attachedEntity) {
        // Initialize variables
        super(game, pos);
        this.col = color(210 + random(40), 100 + random(20), 40 + random(15));
        this.colTop = lightenColor(this.col);
        this.priority = 2;
        smokeInterval = SMOKE_INTERVAL_INTERVAL[0] + (int)random(SMOKE_INTERVAL_INTERVAL[1] - SMOKE_INTERVAL_INTERVAL[0] + 1);

        // Attach to entity
        if (!attachedEntity.onFire) {
            this.attachedEntity = attachedEntity;
            this.attachedEntity.onFire = true;
            this.attachedEntity.attachedFire = this;
            this.pos.x = this.attachedEntity.pos.x;
            this.pos.y = this.attachedEntity.pos.y;
            this.pos.z = this.attachedEntity.pos.z + 1;
        }
    }


    @Override
    void update() {
        // Produce smoke
        if (frameCount != 0 && frameCount % smokeInterval == 0) {
            this.game.ptc.addParticleQueue(new SmokeParticle(this.game, new Int3(this.pos.x, this.pos.y, 1)));
            smokeInterval = SMOKE_INTERVAL_INTERVAL[0] + (int)random(SMOKE_INTERVAL_INTERVAL[1] - SMOKE_INTERVAL_INTERVAL[0] + 1);
        }

        // Produce fire
        if (frameCount != 0 && frameCount % FIRE_INTERVAL == 0) {
            this.game.ptc.addParticleQueue(new FireParticle(this.game, new Int3(this.pos.x, this.pos.y, 1)));
        }

        // Crackel
        if (random(1) < SOUND_PCT) {
            ASSETS.getSound("fire").stop();
            ASSETS.getSound("fire").play();
        }

        // Find entities nearby
        for (Entity e : this.game.entityList) {
            if (!(e instanceof Fire) && !(e instanceof Particle)) {
                float dst = distInt3(this.pos, e.pos);
                if (dst < 2 && !e.onFire) {
                    
                    // Catch fire
                    if (random(1) < SPREAD_CHANCE) {
                        Fire f = new Fire(this.game, new Int3(this.pos.x, this.pos.y, this.pos.z), e);
                        this.game.addEntityQueue(f);
                    }
                }
            }
        }
    }

    @Override
    void show() {
        // Follow attached entity
        if (this.attachedEntity != null) {
            this.pos.x = this.attachedEntity.pos.x;
            this.pos.y = this.attachedEntity.pos.y;
            this.pos.z = this.attachedEntity.pos.z + 1;
        }

        // Draw body as 2 pixels
        this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z, col);
        this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z - 1, colTop);
    }
}

// #endregion


// #region - Particles

class GameParticler {

    Game game;
    ArrayList<Particle> particleQueue;
    ArrayList<Particle> particles;


    GameParticler(Game game) {
        // Initialize variables
        this.game = game;
        this.particleQueue = new ArrayList<Particle>();
        this.particles = new ArrayList<Particle>();
    }


    void update() {
        // Add all particles from queue
        while (this.particleQueue.size() > 0) {
            Particle p = this.particleQueue.get(0);
            this.addParticle(p);
            this.particleQueue.remove(0);
        }

        // Check if any particles finished
        for (int i = 0; i < this.particles.size(); i++) {
            Particle p = this.particles.get(i);
            if (p.hasEnded()) {
                this.game.entityList.remove(p);
                this.particles.remove(i);
            }
        }
    }


    void addParticleQueue(Particle p) {
        // Add particle to be added
        this.particleQueue.add(p);
    }

    void addParticle(Particle p) {
        // Add particle to both this and game
        this.particles.add(p);
        this.game.entityList.add(p);
    }
}


class Particle extends Entity {

    color col, colTop;
    ArrayList<ParticleEnder> enders;


    Particle(Game game, Int3 pos) { this(game, pos, color(200, 100, 100)); }
    Particle(Game game, Int3 pos, color col) {
        // Initialize variables
        super(game, pos);
        this.col = col;
        this.colTop = lightenColor(this.col);
        this.enders = new ArrayList<ParticleEnder>();
        this.priority = 1;

        // Add offscreen ender
        this.addEnder(new ParticleEnderOffscreen(this));
    }


    @Override
    void show() {
        // Draw body as 3 pixels
        this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z, col);
        this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z - 1, colTop);
    }
    

    boolean hasEnded() {
        // Check if ended
        boolean allEnded = false;
        for (ParticleEnder e : this.enders) allEnded |= e.hasEnded();
        return allEnded;
    }


    void addEnder(ParticleEnder ender) { this.enders.add(ender); }
}

class SmokeParticle extends Particle {

    final float MOVE_CHANCE = 0.045;
    final int[] FLOAT_INTERVAL_INTERVAL = new int[] { 20, 30 };
    int floatInterval;


    SmokeParticle(Game game, Int3 pos) {
        // Initialize variables
        super(game, pos, color(160));
        floatInterval = FLOAT_INTERVAL_INTERVAL[0] + (int)random(FLOAT_INTERVAL_INTERVAL[1] - FLOAT_INTERVAL_INTERVAL[0] + 1);
        colShadow = color(0, 50);
    }


    @Override
    void update() {
        if (random(1) < MOVE_CHANCE) moveRandomly();
        if (frameCount % floatInterval == 0) this.pos.z++;
    }


    void moveRandomly() {
        // Pick a random direction
        int dx = (int)random(3) - 1;
        int dy = (int)random(3) - 1;
        int nx = this.pos.x + dx;
        int ny = this.pos.y + dy;
        int nz = this.pos.z;
        setPosition(nx, ny, nz);
    }
}

class FireParticle extends Particle {
   
    final float MOVE_CHANCE = 0.06;
    final int[] FLOAT_INTERVAL_INTERVAL = new int[] { 20, 25 };
    final int[] LIFETIME_INTERVAL = new int[] { 70, 90 };
    int floatInterval;


    FireParticle(Game game, Int3 pos) {
        // Initialize variables
        super(game, pos, color(209, 77, 63));
        floatInterval = FLOAT_INTERVAL_INTERVAL[0] + (int)random(FLOAT_INTERVAL_INTERVAL[1] - FLOAT_INTERVAL_INTERVAL[0] + 1);
        colShadow = color(0, 50);
        int lifetime = LIFETIME_INTERVAL[0] + (int)random(LIFETIME_INTERVAL[1] - LIFETIME_INTERVAL[0] + 1);
        this.addEnder(new ParticleEnderLifetime(this, lifetime));
    }


    @Override
    void update() {
        if (random(1) < MOVE_CHANCE) moveRandomly();
        if (frameCount % floatInterval == 0) this.pos.z++;
    }


    void moveRandomly() {
        // Pick a random direction
        int dx = (int)random(3) - 1;
        int dy = (int)random(3) - 1;
        int nx = this.pos.x + dx;
        int ny = this.pos.y + dy;
        int nz = this.pos.z;
        setPosition(nx, ny, nz);
    } 
}

class PhysicsParticle extends Particle {
    
    final float GRAVITY = 7.5;
    final float AIR_FRICTION = 0.997;
    final float GROUND_FRICTION = 0.99;
    Float3 fPos, fVel;
    boolean useGravity;


    PhysicsParticle(Game game, Float3 fPos, Float3 fVel, boolean useGravity) { this(game, fPos, fVel, useGravity, color(100)); }
    PhysicsParticle(Game game, Float3 fPos, Float3 fVel, boolean useGravity, color col) {
        // Initialize variables
        super(game, new Int3((int)fPos.x, (int)fPos.y, (int)fPos.z), col);
        this.fPos = fPos;
        this.fVel = fVel;
        this.useGravity = useGravity;
    }

    @Override
    void update() {
        // Apply gravity
        this.fVel.z -= GRAVITY / 60;

        // Calculate new position
        Float3 newFPos = new Float3(
            this.fPos.x + this.fVel.x / 60,
            this.fPos.y + this.fVel.y / 60,
            this.fPos.z + this.fVel.z / 60 );
        Int3 newPos = new Int3((int)newFPos.x, (int)newFPos.y, (int)newFPos.z);

        // Constrain to floor
        if (newFPos.z < 0) {
            newFPos.z = 0;
            this.fVel.z = max(0, this.fVel.z);
            newPos = new Int3((int)newFPos.x, (int)newFPos.y, (int)newFPos.z);
        }

        // Constrain with physics
        if (this.game.isBlocked(newPos)) {
            this.fVel.x = 0;
            this.fVel.y = 0;
            newFPos = this.fPos;
            newPos = this.pos;
        }

        // Apply ground friction
        if (this.fPos.z < 0.01) {
            this.fVel.x *= GROUND_FRICTION;
            this.fVel.y *= GROUND_FRICTION;

        // Apply air friction
        } else {
            this.fVel.x *= AIR_FRICTION;
            this.fVel.y *= AIR_FRICTION;
        }

        // Update position
        this.fPos = newFPos;
        this.pos = newPos;
    }


    // @Override
    // void update() {
    //     // Apply gravity, velocity, and limit
    //     this.fVel.z -= GRAVITY / 60;
    //     this.fPos.x += this.fVel.x / 60;
    //     this.fPos.y += this.fVel.y / 60;
    //     this.fPos.z += this.fVel.z / 60;
    //     if (this.fPos.z < 0) {
    //         this.fPos.z = 0;
    //         this.fVel.z = max(0, this.fVel.z);
    //     }

    //     // Apply ground friction
    //     if (this.fPos.z < 0.01) {
    //         this.fVel.x *= GROUND_FRICTION;
    //         this.fVel.y *= GROUND_FRICTION;

    //     // Apply air friction
    //     } else {
    //         this.fVel.x *= AIR_FRICTION;
    //         this.fVel.y *= AIR_FRICTION;
    //     }

    //     // Update position
    //     this.pos = new Int3((int)this.fPos.x, (int)this.fPos.y, (int)this.fPos.z);
    // }


    @Override
    void show() {
        // Draw body as 3 pixels
        this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z, col);
        this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z - 1, colTop);
    }
}

class BloodParticle extends PhysicsParticle {

    final int[] LIFETIME_RANGE = new int[] { 260, 400 };


    BloodParticle(Game game, Float3 fPos, Float3 fVel) {
        // Initialize variables
        super(game, fPos, fVel, true, color(168, 35, 35));
        int lifetime = LIFETIME_RANGE[0] + (int)random(LIFETIME_RANGE[1] - LIFETIME_RANGE[0]);
        this.addEnder(new ParticleEnderLifetime(this, lifetime));
    }


    @Override
    void update() {
        super.update();
        
        // Stain the ground
        if (
            this.fPos.z == 0
            && this.game.isInBounds(this.pos.x, this.pos.y)
            && (this.game.stainGrid[this.pos.x][this.pos.y] == null
            || this.game.stainGrid[this.pos.x][this.pos.y].type != "Blood")
        ) {
            this.game.addStain(new Stain(this.game, new Int2(this.pos.x, this.pos.y), "Blood", color(92 + random(20), 30 + random(10), 30 + random(10))));
        }
    }
}


abstract class ParticleEnder {

    Particle p;

    ParticleEnder(Particle p) {
        // Initialize variables
        this.p = p;
    }

    abstract boolean hasEnded();
}

class ParticleEnderLifetime extends ParticleEnder {

    int frameStart, lifetime;

    ParticleEnderLifetime(Particle p, int lifetime) {
        // Initialize variales
        super(p);
        this.frameStart = frameCount;
        this.lifetime = lifetime;
    }

    @Override
    boolean hasEnded() {
        // Ended when ran out of time
        return (frameCount - this.frameStart) > this.lifetime;
    }
}

class ParticleEnderOffscreen extends ParticleEnder {

    ParticleEnderOffscreen(Particle p) { super(p); }

    @Override
    boolean hasEnded() {
        // Ended when offscreen
        return !this.p.game.isInBounds(new Int2(this.p.pos.x, this.p.pos.y));
    }
}

// #endregion


// #region - Utility

class Input {

    HashMap<Integer,Boolean> keysHeld = new HashMap<Integer,Boolean>();
    HashMap<Integer,Boolean> keysPressed = new HashMap<Integer,Boolean>();
    HashMap<Integer,Boolean> mouseHeld = new HashMap<Integer,Boolean>();
    HashMap<Integer,Boolean> mousePressed = new HashMap<Integer,Boolean>();
    int wheelCount = 0;

    void lateUpdate() {
        for (Map.Entry<Integer,Boolean> entry : this.keysPressed.entrySet()) this.keysPressed.put(entry.getKey(), false);
        for (Map.Entry<Integer,Boolean> entry : this.mousePressed.entrySet()) this.mousePressed.put(entry.getKey(), false);
        this.wheelCount = 0;
    }
    
    void onKeyPressed(int keyCode) { this.keysHeld.put(keyCode, true); this.keysPressed.put(keyCode, true); }
    void onKeyReleased(int keyCode) { this.keysHeld.put(keyCode, false); this.keysPressed.put(keyCode, false); }
    void onMousePressed(int mouseButton) { this.mouseHeld.put(mouseButton, true); this.mousePressed.put(mouseButton, true); }
    void onMouseReleased(int mouseButton) { this.mouseHeld.put(mouseButton, false); this.mousePressed.put(mouseButton, false); }
    void onMouseWheel(int wheelCount) { this.wheelCount = wheelCount; }

    boolean getKeyPressed(int keyCode) { return this.keysPressed.getOrDefault(keyCode, false); }
    boolean getKeyHeld(int keyCode) { return this.keysHeld.getOrDefault(keyCode, false); }
    boolean getMousePressed(int mouseButton) { return this.mousePressed.getOrDefault(mouseButton, false); }
    boolean getMouseHeld(int mouseButton) { return this.mouseHeld.getOrDefault(mouseButton, false); }
}


class AssetManager {

    PApplet parent;
    Map<String, PImage> images;
    Map<String, SoundFile> sounds;


    AssetManager(PApplet parent) {
        // Initialize variables
        this.parent = parent;
        images = new HashMap<String, PImage>();
        sounds = new HashMap<String, SoundFile>();
    }


    void addImage(String name, String filePath) { images.put(name, loadImage(filePath)); }
    PImage getImage(String name) { return images.get(name); }


    void addSound(String name, String filePath) { sounds.put(name, new SoundFile(this.parent, filePath)); }
    SoundFile getSound(String name) { return sounds.get(name); }
}


class Int2 {

    int x, y;

    Int2(int x, int y) {
        this.x = x;
        this.y = y;
    }

    Int2 copy() { return new Int2(x, y); }
}

class Int3 {

    int x, y, z;

    Int3(int x, int y, int z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    Int3 copy() { return new Int3(x, y, z); }
}

class Float2 {

    float x, y;

    Float2(float x, float y) {
        this.x = x;
        this.y = y;
    }

    Float2 copy() { return new Float2(x, y); }
}

class Float3 {

    float x, y, z;

    Float3(float x, float y, float z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    Float3 copy() { return new Float3(x, y, z); }
}


float distInt3(Int3 p0, Int3 p1) {
    // Euclidean distance function
    int dx = p1.x - p0.x;
    int dy = p1.y - p0.y;
    int dz = p1.z - p0.z;
    return sqrt(dx * dx + dy * dy + dz * dz);
}


color lightenColor(color col) {
    float r = min(red(col) * 1.2, 255);
    float g = min(green(col) * 1.2, 255);
    float b = min(blue(col) * 1.2, 255);
    return color(r, g, b);
}

// #endregion
