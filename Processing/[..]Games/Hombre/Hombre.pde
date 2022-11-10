
import java.util.*;
import java.lang.reflect.*;


// #region - Driver

// Globals
Input INPUT;
World WORLD;
float DT;


void setup() {
    size(800, 800);
    rectMode(CENTER);
    INPUT = new Input();
    WORLD = new World();
}


void draw() {
    background(0);
    DT = 1.0 / frameRate;
    WORLD.draw();
    INPUT.lateUpdate();
    // debug();
}


void debug() {
    float aPosX = 400;
    float aPosY = 400;
    float bPosX = mouseX;
    float bPosY = mouseY;
    float aRadius = 100;
    float bRadius = 100;
    OverlapInfo info = Overlap.checkCircleCircle(aPosX, aPosY, aRadius, bPosX, bPosY, bRadius, false);

    if (info.isOverlapping) stroke(200, 50, 50);
    else stroke(150);
    noFill();
    ellipse(aPosX, aPosY, aRadius * 2, aRadius * 2);
    ellipse(bPosX, bPosY, bRadius * 2, bRadius * 2);

    if (info.isOverlapping) {
        stroke(255);
        noFill();
        ellipse(info.aPosX, info.aPosY, 6, 6);
        ellipse(info.bPosX, info.bPosY, 6, 6);
        line(
            info.bPosX, info.bPosY,
            info.bPosX + info.normalX * info.length,
            info.bPosY + info.normalY * info.length
        );
    }
}

// #endregion


// #region - Input

class Input {

    HashMap<Integer,Boolean> keysHeld = new HashMap<Integer,Boolean>();
    HashMap<Integer,Boolean> keysPressed = new HashMap<Integer,Boolean>();
    HashMap<Integer,Boolean> mouseHeld = new HashMap<Integer,Boolean>();
    HashMap<Integer,Boolean> mousePressed = new HashMap<Integer,Boolean>();

    void lateUpdate() {
        for (Map.Entry<Integer,Boolean> entry : keysPressed.entrySet()) keysPressed.put(entry.getKey(), false);
        for (Map.Entry<Integer,Boolean> entry : mousePressed.entrySet()) mousePressed.put(entry.getKey(), false);
    }
    
    void onKeyPressed(int keyCode) { keysHeld.put(keyCode, true); keysPressed.put(keyCode, true); }
    void onKeyReleased(int keyCode) { keysHeld.put(keyCode, false); keysPressed.put(keyCode, false); }
    void onMousePressed(int mouseButton) { mouseHeld.put(mouseButton, true); mousePressed.put(mouseButton, true); }
    void onMouseReleased(int mouseButton) { mouseHeld.put(mouseButton, false); mousePressed.put(mouseButton, false); }

    boolean getKeyPressed(int keyCode) { return keysPressed.getOrDefault(keyCode, false); }
    boolean getKeyHeld(int keyCode) { return keysHeld.getOrDefault(keyCode, false); }
    boolean getMousePressed(int mouseButton) { return mousePressed.getOrDefault(mouseButton, false); }
    boolean getMouseHeld(int mouseButton) { return mouseHeld.getOrDefault(mouseButton, false); }
}


void keyPressed() { INPUT.onKeyPressed(keyCode); }
void keyReleased() { INPUT.onKeyReleased(keyCode); }
void mousePressed() { INPUT.onMousePressed(mouseButton); }
void mouseReleased() { INPUT.onMouseReleased(mouseButton); }

// #endregion


// #region - World

class World {
    
    ArrayList<Entity> entities = new ArrayList<Entity>();
    ArrayList<RigidBody> bodies = new ArrayList<RigidBody>();


    World() {
        addEntity(new Player(this, 150, 150));
        addEntity(new Ground(this, 375.0, 640.0, 500.0, 80.0, 0.0));
        addEntity(new Ground(this, 655.0, 485.0, 150.0, 65.0, 0.0));
    }


    void draw() {
        // Update all entities and handle physics
        for (Entity o : entities) o.update();
        for (Entity o : entities) o.lateUpdate();
        for (RigidBody b : bodies) b.detectCollisions();
        for (RigidBody b : bodies) b.resolveCollisions();

        // Show all entities
        for (Entity o : entities) o.show();
    }


    void addEntity(Entity entity) {
        entities.add(entity);
        if (entity instanceof RigidBody) bodies.add((RigidBody)entity);
    }


    <T> ArrayList<T> getView() {
        // Get all entities of a certain type
        ArrayList<T> view = new ArrayList<T>();
        for (Entity e : entities) {
            try { view.add((T)e); }
            catch (Exception _) { }
        }
        return view;
    }
}


abstract class Bounds {

    Entity entity;


    Bounds(Entity entity) {
        this.entity = entity;
    }


    void show() {}


    public OverlapInfo checkOverlap(Bounds other) {
        if (other instanceof CircleBounds) return checkOverlap((CircleBounds)other);
        else if (other instanceof RectBounds) return checkOverlap((RectBounds)other);
        else return new OverlapInfo();
    }

    public abstract OverlapInfo checkOverlap(CircleBounds other);
    public abstract OverlapInfo checkOverlap(RectBounds other);
}

class CircleBounds extends Bounds {

    float radius;


    CircleBounds(Entity entity, float radius) {
        super(entity);
        this.radius = radius;
    }


    @Override
    void show() {
        push();
        noFill();
        stroke(200, 100, 100);
        translate(entity.posX, entity.posY);
        ellipse(0, 0, radius * 2, radius * 2);
        pop();
    }


    OverlapInfo checkOverlap(CircleBounds other) {
        OverlapInfo info = Overlap.checkCircleCircle(
            entity.posX, entity.posY, radius,
            other.entity.posX, other.entity.posY, other.radius,
            false);
        return info;
    }

    OverlapInfo checkOverlap(RectBounds other) {
        OverlapInfo info = Overlap.checkRectCircle(
            other.entity.posX, other.entity.posY, other.sizeX, other.sizeY, other.angle,
            entity.posX, entity.posY, radius,
            true);
        return info;
    }
}

class RectBounds extends Bounds {

    float sizeX, sizeY, angle;


    RectBounds(Entity entity, float sizeX, float sizeY, float angle) {
        super(entity);
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.angle = angle;
    }


    @Override
    void show() {
        push();
        noFill();
        stroke(255);
        rotate(angle);
        translate(entity.posX, entity.posY);
        rect(0, 0, sizeX, sizeY);
        pop();
    }


    OverlapInfo checkOverlap(CircleBounds other) {
        OverlapInfo info = Overlap.checkRectCircle(
            entity.posX, entity.posY, sizeX, sizeY, angle,
            other.entity.posX, other.entity.posY, other.radius,
            false);
        return info;
    }

    OverlapInfo checkOverlap(RectBounds other) {
        OverlapInfo info = Overlap.checkRectRect(
            entity.posX, entity.posY, sizeX, sizeY, angle,
            other.entity.posX, other.entity.posY, other.sizeX, other.sizeY, other.angle,
            false);
        return info;
    }
}


int NEXT_UID = 1;
class Entity {

    int UID;
    World world;
    float posX = 0, posY = 0;


    Entity() { }

    Entity(World world, float posX, float posY) {
        this.UID = NEXT_UID;
        NEXT_UID++;
        this.world = world;
        this.posX = posX;
        this.posY = posY;
    }


    void update() {}
    void lateUpdate() {}
    void show() {}
}

class RigidBody extends Entity {

    class Collision {

        OverlapInfo info;
        boolean isFlipped;

        Collision(OverlapInfo info, boolean isFlipped) {
            this.info = info;
            this.isFlipped = isFlipped;
        }
    }

    // Constants
    final float percent = 0.95;
    final float slop = 0.01;

    Bounds bounds;
    boolean isStatic = false;
    float velX = 0, velY = 0;
    boolean[] sidesBlocked = new boolean[4];
    Set<Integer> checked = new HashSet<Integer>();
    ArrayList<Collision> collisions = new ArrayList<Collision>();


    RigidBody(World world, float posX, float posY, boolean isStatic) {
        super(world, posX, posY);
        this.isStatic = isStatic;
    }

    RigidBody(World world, float posX, float posY, boolean isStatic, float radius) {
        this(world, posX, posY, isStatic);
        this.bounds = new CircleBounds(this, radius);
    }

    RigidBody(World world, float posX, float posY, boolean isStatic, float sizeX, float sizeY, float angle) {
        this(world, posX, posY, isStatic);
        this.bounds = new RectBounds(this, sizeX, sizeY, angle);
    }


    @Override
    void lateUpdate() {
        // Update dynamics
        posX += velX * DT;
        posY += velY * DT;
    }


    void detectCollisions() {
        // For each other body not checked
        for (RigidBody other : world.bodies) {
            if (other == this) continue;
            if (checked.contains(other.UID)) continue;

            // Check if colliding
            checked.add(other.UID);
            other.checked.add(UID);
            OverlapInfo info = bounds.checkOverlap(other.bounds);
            if (info.isOverlapping) {
                collisions.add(new Collision(info, false));
                other.collisions.add(new Collision(info, true));
            }
        }
    }

    void resolveCollisions() {
        if (isStatic) return;
        sidesBlocked = new boolean[4];
        for (Collision c : collisions) {
            float flip = c.isFlipped ? -1 : 1;

            // Resolve positions
            posX += flip * c.info.normalX * max(c.info.length - slop, 0.0f) * percent;
            posY += flip * c.info.normalY * max(c.info.length - slop, 0.0f) * percent;

            // Resolve velocities
            float dot = flip * -c.info.normalX * velX + flip * -c.info.normalY * velY;
            if (dot > 0) {
                velX += flip * c.info.normalX * dot;
                velY += flip * c.info.normalY * dot;
            }

            // Update sides blocked
            // TODO: Fix this
            if (c.info.normalX / abs(c.info.normalY) < -1) sidesBlocked[0] = true;
            if (c.info.normalY / abs(c.info.normalX) > 1) sidesBlocked[1] = true;
            if (c.info.normalX / abs(c.info.normalY) > 1) sidesBlocked[2] = true;
            if (c.info.normalY / abs(c.info.normalX) < -1) sidesBlocked[3] = true;
        }

        // Update variables
        checked.clear();
        collisions.clear();
    }


    @Override
    void show() {
        bounds.show();
    }
}

class Ground extends RigidBody {

    float sizeX, sizeY;


    Ground(World world, float posX, float posY, float sizeX, float sizeY, float angle) {
        super(world, posX, posY, true, sizeX, sizeY, angle);
    }
}

class Player extends RigidBody {

    final float MOVE_ACC = 30;
    final float MOVE_VEL_MAX = 250;
    final float GROUND_DRAG = 0.4;
    final float AIR_DRAG = 0.98;
    final float JUMP_ACC = -350;
    final float GRAVITY_UP_HOLD = 12;
    final float GRAVITY_DOWN_HOLD = 15;
    final float GRAVITY_RELEASE = 19;


    Player (World world, float posX, float posY) {
        super(world, posX, posY, false, 18);
    }


    @Override
    void update() {
        super.update();

        // Handle input
        float inputX = 0;
        float inputY = 0;
        if (INPUT.getKeyHeld(65)) inputX--;
        if (INPUT.getKeyHeld(87)) inputY--;
        if (INPUT.getKeyHeld(68)) inputX++;
        if (INPUT.getKeyHeld(83)) inputY++;
        boolean isMoving = inputX != 0 || inputY != 0;
        boolean isGrounded = sidesBlocked[1];
        boolean holdingJump = INPUT.getKeyHeld(32);

        // Movement
        if (isMoving) {
            if (inputX < 0) velX = min(velX, 0);
            if (inputX > 0) velX = max(velX, 0);
            if (velX * inputX < MOVE_VEL_MAX) {
                velX += inputX * MOVE_ACC;
            } else velX = inputX * MOVE_VEL_MAX;
        }

        if (isGrounded) {

            // Ground drag
            if (!isMoving) velX *= GROUND_DRAG;

            // Jump
            if (holdingJump) velY += JUMP_ACC;

        } else {
            // Air drag
            velX *= AIR_DRAG;

            // Jump gravity
            if (holdingJump) {
                if (velY <= 0) velY += GRAVITY_UP_HOLD;
                else velY += GRAVITY_DOWN_HOLD;

            // Falling gravity
            } else {
                velY = max(velY, 0.0f);
                velY += GRAVITY_RELEASE;
            }
        }
    }
}

// #endregion
