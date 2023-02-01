
import java.util.*;


// #region - Setup

Input INPUT;
Game GAME;


void setup() {
    // Setup canvas
    size(800, 800);
    imageMode(CENTER);
    rectMode(CORNER);
    noSmooth();

    // Setup globals
    INPUT = new Input();
    GAME = new Game(50, 50);
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

    ArrayList<Entity> entityListAll;
    ArrayList<Entity> entityListAllOrdered;
    StaticEntity[][] entityGridStatic;
    ArrayList<DynamicEntity>[][] entityGridDynamic;
    // ArrayList<ArrayList<Entity>> entityLayersOrdered;


    Game(int gridSizeX, int gridSizeY) {
        // Initialize variables
        this.gridSize = new Int2(gridSizeX, gridSizeY);
        this.output = createGraphics(this.gridSize.x, this.gridSize.y);
        this.cam = new GameCamera(this);
        this.intr = new GameInteractor(this);
        this.ptc = new GameParticler(this);

        // Intitialize entity containers
        this.entityListAll = new ArrayList<Entity>();
        this.entityListAllOrdered = new ArrayList<Entity>();
        this.entityGridStatic = new StaticEntity[gridSize.x][gridSize.y];
        this.entityGridDynamic = new ArrayList[gridSize.x][gridSize.y];
        // this.entityLayersOrdered = new ArrayList<ArrayList<Entity>>(gridSize.y);
        for (int x = 0; x < this.gridSize.x; x++) {
            for (int y = 0; y < this.gridSize.y; y++) {
                // if (x == 0) this.entityLayersOrdered.add(new ArrayList<Entity>());
                this.entityGridDynamic[x][y] = new ArrayList<DynamicEntity>();
            }
        }

        // Add a wall
        for (int i = 0; i < 20; i++) {
            Int2 pos = new Int2(10 + i, 10);
            if (this.isBlocked(pos)) continue;
            this.addEntityStatic(new Wall(this, pos, i < 10 ? 4 : 3));
        }

        // Add another wall
        for (int i = 0; i < 20; i++) {
            Int2 pos = new Int2(10, 11 + i);
            if (this.isBlocked(pos)) continue;
            this.addEntityStatic(new Wall(this, pos, i < 10 ? 4 : 3));
        }

        // Add arbitrary peeps
        for (int i = 0; i < 1; i++)
        {
            Int3 pos = new Int3(20, 20, 0);
            if (this.isBlocked(pos)) continue;
            this.addEntityDynamic(new Peep(this, pos));
        }

        // Add campfire
        this.addEntityStatic(new Campfire(this, new Int2(40, 35)));
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

        // Update all entities
        for (Entity e : this.entityListAll) e.update();

        // Update all particles
        this.ptc.update();
    }


    void show() {
        background(0);

        // Calculate entity draw orders
        this.entityListAllOrdered = this.entityListAll;
        Collections.sort(this.entityListAllOrdered);

        // Begin draw, show entites, end draw
        this.output.beginDraw();
        this.output.background(200);
        this.output.loadPixels();
        for (Entity e : this.entityListAllOrdered) e.show();
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

    void drawPixel(int x, int y, color col) {
        // Draw pixel if within bounds
        if (!this.isInBounds(new Int2(x, y))) return;
        output.pixels[this.gridSize.x * y + x] = col;
    }


    boolean isInBounds(Int2 pos) { return isInBounds(pos.x, pos.y); }
    boolean isInBounds(int x, int y) {
        // Check whether a point is within the bounds
        return (x >= 0 && x < this.gridSize.x && y >= 0 && y < this.gridSize.y);
    }


    boolean isBlocked(Int2 pos) { return isBlocked(pos.x, pos.y, 0); }
    boolean isBlocked(Int3 pos) { return isBlocked(pos.x, pos.y, pos.z); }
    boolean isBlocked(int x, int y, int z) {
        // Checks whether a point is blocked by static
        if (!isInBounds(new Int2(x, y))) return true;
        if (entityGridStatic[x][y] != null) return entityGridStatic[x][y].isBlocked(x, y, z);
        return false;
    }


    void addEntityStatic(StaticEntity e) {
        // Add a static entity
        this.entityListAll.add((Entity)e);
        this.entityGridStatic[e.pos.x][e.pos.y] = e;
    }

    void addEntityDynamic(DynamicEntity e) {
        // Add a static entity
        this.entityListAll.add((Entity)e);
        this.entityGridDynamic[e.pos.x][e.pos.y].add(e);
    }

    // #endregion
}


class GameCamera {

    Game game;
    Float2 pos;
    float zoom;


    GameCamera(Game game) {
        // Initialize variables
        this.game = game;
        this.pos = new Float2(0, 0);
        this.zoom = 10;
    }


    void update() {
        // Control camera with INPUT
        if (INPUT.getKeyHeld(65)) this.pos.x--;
        if (INPUT.getKeyHeld(68)) this.pos.x++;
        if (INPUT.getKeyHeld(87)) this.pos.y--;
        if (INPUT.getKeyHeld(83)) this.pos.y++;
        this.zoom *= (1 - INPUT.wheelCount * 0.02);
    }


    void transform() {
        // Move camera to correct position
        translate(width * 0.5, height * 0.5);
        scale(this.zoom);
        translate(-this.pos.x, -this.pos.y);
    }


    Int2 convertScreenToGrid(Int2 screenPos) {
        // Convert a screen position to a grid position
        float gridX = screenPos.x - width * 0.5;
        float gridY = screenPos.y - height * 0.5;
        gridX /= this.zoom;
        gridY /= this.zoom;
        gridX += this.game.gridSize.x * 0.5 + this.game.cam.pos.x;
        gridY += this.game.gridSize.y * 0.5 + this.game.cam.pos.y;
        return new Int2((int)gridX, (int)gridY);
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

    final float CURSOR_LERP = 0.65;

    Game game;
    Float2 cursorLocationCurrent;
    Float2 cursorLocationTarget;
    Int2 cursorLocationGrid;


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

        // Click on board
        if (this.cursorLocationGrid != null && INPUT.getMousePressed(LEFT)) {

            // Behead peep
            boolean hasPopped = false;
            ArrayList<DynamicEntity> el = this.game.entityGridDynamic[this.cursorLocationGrid.x][this.cursorLocationGrid.y];
            for (DynamicEntity e : el) {
                if (e instanceof Peep) {
                    ((Peep)e).behead();
                    hasPopped = true;
                }   
            }

            // Create peep
            if (!hasPopped && !this.game.isBlocked(this.cursorLocationGrid)) {
                Peep p = new Peep(this.game, new Int3(this.cursorLocationGrid.x, this.cursorLocationGrid.y, 0));
                this.game.addEntityDynamic(p);
            }
        }
    }


    void showOntop() {
        // Draw cursor and lerp
        if (this.cursorLocationCurrent != null) {
            noStroke();
            fill(255, 100);
            rect(this.cursorLocationCurrent.x - 0.1, this.cursorLocationCurrent.y - 0.1, this.game.cam.zoom + 0.2, this.game.cam.zoom + 0.2);
            this.cursorLocationCurrent.x = lerp(this.cursorLocationCurrent.x, this.cursorLocationTarget.x, CURSOR_LERP);
            this.cursorLocationCurrent.y = lerp(this.cursorLocationCurrent.y, this.cursorLocationTarget.y, CURSOR_LERP);
        }
    }
}

// #endregion


// #region - Entities

class Entity implements Comparable<Entity> {

    Game game;
    Int3 pos;


    Entity(Game game, Int3 pos) {
        // Intialize variables
        this.game = game;
        this.pos = pos;
    }


    void update() { };
    void show() { };


    void setPosition(Int3 pos) { this.setPosition(pos.x, pos.y, pos.z); }
    void setPosition(int x, int y, int z) {
        // Update position
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
        else return zCompare;
    }
}


class DynamicEntity extends Entity {

    DynamicEntity(Game game, Int3 pos) {
        // Intialize variables
        super(game, pos);
    }


    @Override
    void setPosition(int x, int y, int z) {
        // Update position and grid
        this.game.entityGridDynamic[this.pos.x][this.pos.y].remove(this);
        this.pos.x = x;
        this.pos.y = y;
        this.pos.z = z;
        this.game.entityGridDynamic[this.pos.x][this.pos.y].add(this);
    }
}

class Humanoid extends DynamicEntity {

    final int[] BEHEAD_PARTICLE_COUNT_RANGE = new int[] { 5, 10 };
    final int[] BEHEAD_PARTICLE_SPEED_RANGE = new int[] { 5, 10 };
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
        // *Behead*
        isAlive = false;
        isBeheaded = true;
        beheadFrame = frameCount;

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
}

class Peep extends Humanoid {

    final float MOVE_CHANCE = 0.05;


    Peep(Game game, Int3 pos) {
        // Initialize variables
        super(game, pos);
    }


    @Override
    void update() {
        super.update();
        if (!this.isAlive) return;

        // Random movement
        if (random(1) < MOVE_CHANCE) moveRandomly();

        // Move away if ontop
        if (game.entityGridDynamic[this.pos.x][this.pos.y].size() > 1 && random(1) < 0.5) moveRandomly();
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
                return;
            }
        }
    }
}


class StaticEntity extends Entity {

    StaticEntity(Game game, Int3 pos) {
        // Intialize variables
        super(game, pos);
    }


    @Override
    void setPosition(int x, int y, int z) {
        // Update position and grid
        this.game.entityGridStatic[this.pos.x][this.pos.y] = null;
        this.pos.x = x;
        this.pos.y = y;
        this.pos.y = z;
        this.game.entityGridStatic[this.pos.x][this.pos.y] = this;
    }


    boolean isBlocked(Int3 pos) { return this.isBlocked(pos.x, pos.y, pos.z); }
    boolean isBlocked(int x, int y, int z) {
        // Check whether other position is blocked by me
        return (x == this.pos.x && y == this.pos.y);
    }
}

class Campfire extends StaticEntity {

    final int[] SMOKE_INTERVAL_INTERVAL = new int[] { 55, 70 };
    color col, colTop;
    int smokeInterval;


    Campfire(Game game, Int2 pos) {
        // Initialize variables
        super(game, new Int3(pos.x, pos.y, 0));
        this.col = color(232, 110, 49);
        this.colTop = lightenColor(this.col);
        smokeInterval = SMOKE_INTERVAL_INTERVAL[0] + (int)random(SMOKE_INTERVAL_INTERVAL[1] - SMOKE_INTERVAL_INTERVAL[0] + 1);
    }


    @Override
    void update() {
        // Produce smoke
        if (frameCount != 0 && frameCount % smokeInterval == 0) {
            this.game.ptc.addParticleQueue(new SmokeParticle(this.game, new Int3(this.pos.x, this.pos.y, 1)));
            smokeInterval = SMOKE_INTERVAL_INTERVAL[0] + (int)random(SMOKE_INTERVAL_INTERVAL[1] - SMOKE_INTERVAL_INTERVAL[0] + 1);
        }
    }


    @Override
    void show() {
        // Draw body as 3 pixels
        this.game.drawPixel(this.pos.x, this.pos.y, col);
        this.game.drawPixel(this.pos.x, this.pos.y - 1, colTop);
    }
}

class Wall extends StaticEntity {

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
                this.game.entityListAll.remove(p);
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
        this.game.entityListAll.add(p);
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
        // Apply gravity, velocity, and limit
        this.fVel.z -= GRAVITY / 60;
        this.fPos.x += this.fVel.x / 60;
        this.fPos.y += this.fVel.y / 60;
        this.fPos.z += this.fVel.z / 60;
        if (this.fPos.z < 0) {
            this.fPos.z = 0;
            this.fVel.z = max(0, this.fVel.z);
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
        this.pos = new Int3((int)this.fPos.x, (int)this.fPos.y, (int)this.fPos.z);
    }


    @Override
    void show() {
        // Draw body as 3 pixels
        this.game.drawPixel(this.pos.x, this.pos.y, color(170));
        this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z, col);
        this.game.drawPixel(this.pos.x, this.pos.y - this.pos.z - 1, colTop);
    }
}

class BloodParticle extends PhysicsParticle {

    BloodParticle(Game game, Float3 fPos, Float3 fVel) {
        // Initialize variables
        super(game, fPos, fVel, true, color(168, 35, 35));
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


color lightenColor(color col) {
    float r = min(red(col) * 1.2, 255);
    float g = min(green(col) * 1.2, 255);
    float b = min(blue(col) * 1.2, 255);
    return color(r, g, b);
}

// #endregion
