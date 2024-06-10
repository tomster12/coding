
import java.util.*;
import java.lang.reflect.*;


// #region - Driver

// Globals
AssetManager ASSETS;
Input INPUT;
World WORLD;
PWorld PWORLD;
float DT;

boolean SHOW_DEBUG = false;
boolean USE_SHADERS = true;


void setup() {
    size(1000, 1000, P2D);
    rectMode(CENTER);
    imageMode(CENTER);
    ((PGraphicsOpenGL)g).textureSampling(2);

    ASSETS = new AssetManager();
    ASSETS.addImage("ponchoChar", "./assets/ponchoChar.png");
    ASSETS.addImage("ponchoUV", "./assets/ponchoUV.png");
    ASSETS.addShader("pixellate", "./assets/pixellate.frag");
    ASSETS.addShader("outline", "./assets/outline.frag");
    ASSETS.loadAll();

    INPUT = new Input();
    WORLD = new World();
    PWORLD = new PWorld();

    tmpOut = createGraphics(width, height, P2D);
    tmpOut.imageMode(CENTER);
    tmpShd1 = ASSETS.getShader("pixellate");
    tmpShd2 = ASSETS.getShader("outline");
    tmpImg = ASSETS.getImage("ponchoUV");
    ((PGraphicsOpenGL)tmpOut).textureSampling(2);
}


void draw() {
    background(0);
    DT = 1.0f / 60.0f;
    WORLD.draw();
    PWORLD.draw();
    if (INPUT.getKeyPressed(49)) SHOW_DEBUG = !SHOW_DEBUG;
    if (INPUT.getKeyPressed(50)) USE_SHADERS = !USE_SHADERS;
    // debug();
    INPUT.lateUpdate();
}


PGraphics tmpOut;
PShader tmpShd1, tmpShd2;
PImage tmpImg;

void debug() {
    float drawX = mouseX;
    float drawY = mouseY;
    float offsetX = drawX / width;
    float offsetY = -drawY / height;
    float pixelSize = 5.0f;
    float drawSize = 250.0f;

    tmpOut.beginDraw();
    tmpOut.clear();
    tmpOut.translate(drawX, drawY);
    tmpOut.rotate(PI * -0.45f);
    tmpOut.image(tmpImg, 0, 0, drawSize, drawSize);
    tmpOut.endDraw();

    tmpShd1.set("u_uv_offset", offsetX, offsetY);
    tmpShd1.set("u_grid_size", width / pixelSize, height / pixelSize);
    shader(tmpShd1);
    image(tmpOut, width * 0.5f, height * 0.5f);
    resetShader();

    noFill();
    stroke(255);
    rect(drawX + pixelSize * 0.5f, drawY + pixelSize * 0.5f, pixelSize, pixelSize);
}

// #endregion


// #region - Assets

class AssetManager {

    abstract class Asset {

        boolean isLoaded;
        String name, path;

        Asset(String name, String path) {
            this.name = name;
            this.path = path;
        }

        abstract void load();
    }

    class ImageAsset extends Asset {

        PImage img;

        ImageAsset(String name, String path) { super(name, path); }

        void load() {
            if (isLoaded) return;
            img = loadImage(path);
            if (img != null) isLoaded = true;
        }
    }

    class ShaderAsset extends Asset {

        PShader shader;

        ShaderAsset(String name, String path) { super(name, path); }

        void load() {
            if (isLoaded) return;
            shader = loadShader(path);
            if (shader != null) isLoaded = true;
        }
    }


    ArrayList<Asset> assets = new ArrayList<Asset>();
    Map<String, ImageAsset> imageAssets = new HashMap<String, ImageAsset>();
    Map<String, ShaderAsset> shaderAssets = new HashMap<String, ShaderAsset>();


    AssetManager() { }


    void addImage(String name, String path) {
        imageAssets.put(name, new ImageAsset(name, path));
        assets.add(imageAssets.get(name));
    }

    void addShader(String name, String path) {
        shaderAssets.put(name, new ShaderAsset(name, path));
        assets.add(shaderAssets.get(name));
    }


    PImage getImage(String name) { return imageAssets.get(name).img; }

    PShader getShader(String name) { return shaderAssets.get(name).shader; }


    void loadAll() {
        for (Asset a : assets) a.load();
    }
}

// #endregion


// #region - Animation

class Animation {

    Animation(PImage img, int startX, int startY, int frameSizeX, int frameSizeY, int frameCount) {
        // TODO
        // this.img = img;
        // this.startX = startX;
        // this.startY = startY;
        // this.frameSizeX = frameSizeX;
        // this.frameSizeY = frameSizeY;
        // this.frameCount = frameCount;
    }


    void show(PGraphics out) {
        // TODO
    }
}


class Animator {

    Map<String, Animation> animations = new HashMap<String, Animation>();
    Animation currentAnimation = null;
    int currentFrame = -1;


    Animator() {}


    void update() {
        // TODO
    }

    void show(PGraphics out) {
        // TODO
    }


    void addAnimation(String name, Animation animation) {
        // TODO
    }

    void playAnimation(String name, boolean toLoop) {
        // TODO
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
        addEntity(new Player(this, 250, 580));
        addEntity(new Ground(this, 375.0f, 640.0f, 500.0f, 80.0f, 0.0f));
        addEntity(new Ground(this, 655.0f, 485.0f, 150.0f, 65.0f, 0.0f));
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
            catch (Exception ex) { }
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
    final float percent = 0.95f;
    final float slop = 0.01f;

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


    @Override
    void update() {
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
            if (c.info.normalX > 0 && abs(c.info.normalX) > abs(c.info.normalY)) sidesBlocked[0] = true;
            if (c.info.normalY < 0 && abs(c.info.normalY) > abs(c.info.normalX)) sidesBlocked[1] = true;
            if (c.info.normalX < 0 && abs(c.info.normalX) > abs(c.info.normalY)) sidesBlocked[2] = true;
            if (c.info.normalY > 0 && abs(c.info.normalY) > abs(c.info.normalX)) sidesBlocked[3] = true;
        }

        // Update variables
        checked.clear();
        collisions.clear();
    }

    
    void setBounds(Bounds bounds) { this.bounds = bounds; }
}

class Ground extends RigidBody {

    float sizeX, sizeY;


    Ground(World world, float posX, float posY, float sizeX, float sizeY, float angle) {
        super(world, posX, posY, true);
        setBounds(new RectBounds(this, sizeX, sizeY, angle));
    }


    @Override
    void show() {
        bounds.show();
    }
}

class Player extends RigidBody {

    class Poncho {

        final int COLS = 5;
        final int ROWS = 5;
        final float[] ROW_WIDTHS = new float[] { 0.5f, 1.05f, 1.48f, 1.52f, 0.9f };
        final float[] ROW_HEIGHTS = new float[] { 0.0f, 1.175f, 2.0f, 2.95f, 4.0f };
        final float OFFSET_Y = -0.05f;
        final float PWORLD_DRAG = 0.1f;
        final float PWORLD_GRAVITY = 2500;
        
        Player player;
        PWorld pWorld;
        PWorld.PPoint[][] points;
        ArrayList<PWorld.PStick> sticks;
        PImage img;
        PShader pixellateShader;
        PGraphics out;
        float gridSizeY;


        Poncho(Player player) {
            this.player = player;
            pWorld = new PWorld(PWORLD_DRAG, PWORLD_GRAVITY);
            points = new PWorld.PPoint[COLS][ROWS];
            sticks = new ArrayList<PWorld.PStick>();
            img = ASSETS.getImage("ponchoUV");
            pixellateShader = ASSETS.getShader("pixellate");
            out = createGraphics(width, height, P2D);
            ((PGraphicsOpenGL)out).textureSampling(2);
            
            for (int x = 0; x < COLS; x++) {
                for (int y = 0; y < ROWS; y++) {
                    boolean toPin = (y == 0) || (y == 1 && (x == 0 || x == (COLS - 1)));
                    float px = player.posX + player.sizeX * ROW_WIDTHS[y] * (-0.5f + (float)x / (COLS - 1));
                    float py = player.posY + player.sizeY * OFFSET_Y + player.pixelSize * ROW_HEIGHTS[y];
                    points[x][y] = pWorld.addPoint(px, py, 1.0f);
                    if (toPin) points[x][y].pin();
                }
            }

            for (int x = 0; x < COLS; x++) {
                for (int y = 0; y < ROWS; y++) {
                    if (x < COLS - 1) sticks.add(pWorld.addStick(points[x][y], points[x + 1][y]));
                    if (y < ROWS - 1) sticks.add(pWorld.addStick(points[x][y], points[x][y + 1]));
                    if (x < COLS - 1 && y < ROWS - 1) {
                        sticks.add(pWorld.addStick(points[x][y], points[x + 1][y + 1]));
                        sticks.add(pWorld.addStick(points[x][y + 1], points[x + 1][y]));
                    }
                }
            }
        }


        void update() {
            for (int x = 0; x < COLS; x++) {
                for (int y = 0; y < ROWS; y++) {
                    boolean toPin = (y == 0) || (y == 1 && (x == 0 || x == (COLS - 1)));
                    if (toPin) {
                        float px = player.posX + player.sizeX * ROW_WIDTHS[y] * (-0.5f + (float)x / (COLS - 1));
                        float py = player.posY + player.sizeY * OFFSET_Y + player.pixelSize * ROW_HEIGHTS[y];
                        points[x][y].pinX = px;
                        points[x][y].pinY = py;
                    }
                }
            }

            pWorld.update();
        }

        void show(PGraphics topOut) {
            if (out == null) return;

            // Draw poncho into output
            out.beginDraw();
            out.clear();
            out.noFill();
            out.noStroke();
            out.textureMode(NORMAL);
            for (int y = 0; y < ROWS - 1; y++) {
                out.beginShape(TRIANGLE_STRIP);
                out.texture(img);
                for (int x = 0; x < COLS; x++) {
                    float x1 = points[x][y].posX;
                    float y1 = points[x][y].posY;
                    float u = (float)x / (COLS - 1);
                    float v1 = (float)y / (ROWS - 1);
                    float x2 = points[x][y + 1].posX;
                    float y2 = points[x][y + 1].posY;
                    float v2 = (float)(y + 1) / (ROWS - 1);
                    out.vertex(x1, y1, u, v1);
                    out.vertex(x2, y2, u, v2);
                }
                out.endShape();
            }
            out.endDraw();

            // Draw physics world
            if (SHOW_DEBUG) {
                pWorld.show();
            }

            // Draw output to layer above
            else {
                if (USE_SHADERS) {
                    pixellateShader.set("u_uv_offset", player.posX / width, -player.posY / height + (player.pixelSize * 0.4f) / height);
                    pixellateShader.set("u_grid_size", width / player.pixelSize, height / player.pixelSize);
                    topOut.shader(pixellateShader);
                }
                topOut.image(out, width * 0.5f, height * 0.5f);
                if (USE_SHADERS) topOut.resetShader();
            }
        }
    }


    final float HEIGHT = 55.0f;
    final float MOVE_ACC = 40.0f;
    final float MOVE_VEL_MAX = 400.0f;
    final float GROUND_DRAG = 0.28f;
    final float AIR_DRAG = 0.95f;
    final float JUMP_ACC = -350.0f;
    final float GRAVITY_UP_HOLD = 14.0f;
    final float GRAVITY_DOWN_HOLD = 22.0f;
    final float GRAVITY_RELEASE = 25.50f;

    PImage img;
    PShader outlineShader;
    PGraphics out;
    float sizeX, sizeY, pixelSize, imgSizeX, imgSizeY;
    Poncho poncho;
    boolean isGrounded, isMoving, holdingJump, isFlipped;


    Player(World world, float posX, float posY) {
        super(world, posX, posY, false);
        setBounds(new CircleBounds(this, HEIGHT * 0.5f));

        // Initialize variables
        img = ASSETS.getImage("ponchoChar");
        outlineShader = ASSETS.getShader("outline");
        sizeX = HEIGHT * img.width / img.height;
        sizeY = HEIGHT;
        pixelSize = sizeX / 8.0f;

        poncho = new Poncho(this);

        // Setup output
        out = createGraphics(width, height, P2D);
        ((PGraphicsOpenGL)out).textureSampling(2);
        out.imageMode(CENTER);
    }


    @Override
    void update() {
        // Handle input
        float inputX = 0;
        float inputY = 0;
        if (INPUT.getKeyHeld(65)) inputX--;
        if (INPUT.getKeyHeld(87)) inputY--;
        if (INPUT.getKeyHeld(68)) inputX++;
        if (INPUT.getKeyHeld(83)) inputY++;
        isMoving = inputX != 0 || inputY != 0;
        isGrounded = sidesBlocked[1];
        holdingJump = INPUT.getKeyHeld(32);
        if (inputX != 0) isFlipped = inputX < 0;

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
            if (holdingJump) {
                velY += JUMP_ACC;
                isGrounded = false;
            }

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

        // Update physics
        super.update();

        // Update poncho
        poncho.update();
    }

    @Override
    void show() {
        // Start
        ((PGraphicsOpenGL)out).textureSampling(2);
        out.beginDraw();
        out.clear();

        // Show bounds
        if (SHOW_DEBUG) {
            bounds.show();

        // Show image
        } else {
            out.push();
            out.translate(posX, posY);
            if (isFlipped) out.scale(-1, 1);
            out.image(img, 0, 0, sizeX, sizeY);
            out.pop();
        }

        // Show poncho
        poncho.show(out);

        // End
        out.endDraw();

        // Show to screen
        if (USE_SHADERS) {
            outlineShader.set("u_grid_size", pixelSize / width, pixelSize / height);
            outlineShader.set("u_outline_color", 0.11, 0.11, 0.11, 1.0);
            outlineShader.set("u_include_corners", false);
            shader(outlineShader);
        }
        image(out, width * 0.5f, height * 0.5f);
        if (USE_SHADERS) resetShader();
    }
}

// #endregion
