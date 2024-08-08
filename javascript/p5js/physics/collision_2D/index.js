let GLOBAL_SIM;
let GLOBAL_USER;

function setup() {
    createCanvas(600, 600);
    initWorld1();
    GLOBAL_USER = new User(GLOBAL_SIM);
}

function initWorld1() {
    GLOBAL_SIM = new RigidbodySimulation(true);
    const s1 = Rigidbody.createSquare(GLOBAL_SIM, false, 0.3, new Float2(250, 350), new Float2(100, 100));
    const s2 = Rigidbody.createFunky(GLOBAL_SIM, false, 0.3, new Float2(250, 250), new Float2(230, 45));
    Rigidbody.createSquare(GLOBAL_SIM, false, 0.3, new Float2(400, 350), new Float2(80, 80));
    Rigidbody.createSquare(GLOBAL_SIM, false, 0.3, new Float2(300, 0), new Float2(18, 18));
    Rigidbody.createFunky(GLOBAL_SIM, false, 0.3, new Float2(280, -30), new Float2(20, 20));
    Rigidbody.createSquare(GLOBAL_SIM, true, 0.3, new Float2(300, 500), new Float2(500, 25));
    Rigidbody.createSquare(GLOBAL_SIM, true, 0.3, new Float2(100, 300), new Float2(25, 500));
    Rigidbody.createSquare(GLOBAL_SIM, true, 0.3, new Float2(500, 300), new Float2(25, 500));
    s1.posVel.iadd({ x: 50, y: 0 });
    s1.rotVel += 1.2;
    s2.rotVel += 0.7;
}

function initWorld2() {
    GLOBAL_SIM = new RigidbodySimulation(false);
    const s1 = Rigidbody.createSquare(GLOBAL_SIM, false, 1, new Float2(300, 200), new Float2(100, 100));
    s1.posVel.y = 100;
    Rigidbody.createSquare(GLOBAL_SIM, true, 0.3, new Float2(300, 500), new Float2(250, 25));
}

function draw() {
    background(0);
    GLOBAL_SIM.draw();
    GLOBAL_USER.draw();
}

function mousePressed() {
    GLOBAL_USER.mousePressed();
}

function mouseReleased() {
    GLOBAL_USER.mouseReleased();
}

// -----------------------------------------------------------------------------

class Float2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Float2(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return new Float2(this.x - other.x, this.y - other.y);
    }

    mult(val) {
        return new Float2(this.x * val, this.y * val);
    }

    iadd(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    isub(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    imult(val) {
        this.x *= val;
        this.y *= val;
        return this;
    }

    perp() {
        return new Float2(-this.y, this.x);
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }

    cross(other) {
        return this.x * other.y - this.y * other.x;
    }

    norm() {
        const dst = this.getLength();
        return new Float2(this.x / dst, this.y / dst);
    }

    getLengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    getLength() {
        return sqrt(this.getLengthSq());
    }

    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }

    copy() {
        return new Float2(this.x, this.y);
    }
}

class Utility {
    static calculateBB(points) {
        let minX = points[0].x;
        let minY = points[0].y;
        let maxX = points[0].x;
        let maxY = points[0].y;

        for (let i = 0; i < points.length; i++) {
            minX = min(minX, points[i].x);
            minY = min(minY, points[i].y);
            maxX = max(maxX, points[i].x);
            maxY = max(maxY, points[i].y);
        }

        return { min: new Float2(minX, minY), max: new Float2(maxX, maxY) };
    }

    static checkBBOverlap(bb1, bb2) {
        const d1x = bb2.a.x - bb1.b.x;
        const d1y = bb2.a.y - bb1.b.y;
        const d2x = bb1.a.x - bb2.b.x;
        const d2y = bb1.a.y - bb2.b.y;
        if (d1x > 0.0 || d1y > 0.0) return false;
        if (d2x > 0.0 || d2y > 0.0) return false;
        return true;
    }

    static checkLineOnLine(a, b, c, d) {
        const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) >= (B.y - A.y) * (C.x - A.x);
        return ccw(a, c, d) != ccw(b, c, d) && ccw(a, b, c) != ccw(a, b, d);
    }

    static getClosestPointOnLine(p, a, b) {
        const dir = b.sub(a).norm();
        const v = p.sub(a);
        const d = v.dot(dir);
        return a.add(dir.imult(d));
    }

    static translatePoint(p, pos, rot) {
        return new Float2(pos.x + rot[0][0] * p.x + rot[0][1] * p.y, pos.y + rot[1][0] * p.x + rot[1][1] * p.y);
    }

    static triangulate(points) {
        // Triangulate a simple polygon by continuall ear clipping
        let triangles = [];
        let indicesLeft = [];
        for (let i = 0; i < points.length; i++) indicesLeft.push(i);

        while (indicesLeft.length > 3) {
            let i, pi1, pi2, pi3;

            // Find first ear available (line 1 -> 2 is left of line 1 -> 3)
            for (i = 0; i < indicesLeft.length; i++) {
                pi1 = indicesLeft[i];
                pi2 = indicesLeft[(i + 1) % indicesLeft.length];
                pi3 = indicesLeft[(i + 2) % indicesLeft.length];
                const a = points[pi2].sub(points[pi1]);
                const b = points[pi3].sub(points[pi1]);
                if (a.perp().dot(b) > 0) break;
            }

            // Generate triangle and remove point 2
            triangles.push([pi1, pi2, pi3]);
            indicesLeft.splice((i + 1) % indicesLeft.length, 1);
        }

        // Create final triangle and return
        triangles.push([indicesLeft[0], indicesLeft[1], indicesLeft[2]]);
        return triangles;
    }

    static calculateMass(body) {
        // TODO: Use area of triangles
        const w = body.localBB.max.x - body.localBB.min.x;
        const h = body.localBB.max.y - body.localBB.min.y;
        const m = body.density * w * h;
        return m;
    }

    static calculateInertia(rb) {
        // TODO: Use equation online for each triangle (Sum of mass*perpRad^2 for each point)
        const w = rb.localBB.max.x - rb.localBB.min.x;
        const h = rb.localBB.max.y - rb.localBB.min.y;
        return (rb.mass * (w * w + h * h)) / 12.0;
    }

    // Returns: { isOverlapping, a, p, n, depth, edgeIndex }
    static checkCollisionPointBody(p, body) {
        // Detect overlap by counting intersections
        const farPoint = body.worldBB.max.add({ x: 10, y: 10 });
        const count = body.worldVertices.filter((_, i) =>
            Utility.checkLineOnLine(p, farPoint, body.worldVertices[i], body.worldVertices[(i + 1) % body.worldVertices.length])
        ).length;

        if (count % 2 == 0) return { isOverlapping: false, a: null, p: null, n: null, depth: 0, edgeIndex: -1 };

        // Return info for closest edge
        let closest = null;
        body.worldVertices.forEach((_, i) => {
            const edgeA = body.worldVertices[i];
            const edgeB = body.worldVertices[(i + 1) % body.worldVertices.length];
            if (edgeB.sub(edgeA).perp().dot(p.sub(edgeA)) <= 0) return;

            // Calculate point and then check whether shorter
            const edgePoint = Utility.getClosestPointOnLine(p, edgeA, edgeB);
            const dir = edgePoint.sub(p);
            const depth = dir.getLength();
            if (!closest || depth < closest.depth) closest = { isOverlapping: true, a: p.copy(), p: edgePoint, n: dir.norm(), depth, edgeIndex: i };
        });

        // Return best overlap
        return closest;
    }

    // Returns: { a, b, pointIndex, edgeIndex, info: { isOverlapping, a, p, n, depth } }
    static checkCollisionBodyBody(body1, body2) {
        let collisions = [];

        function check(body1, body2) {
            // Find all collisions of each point in body 1 against body 2
            let edgeHits = [];
            body1.worldVertices.forEach((p, i) => {
                const info = Utility.checkCollisionPointBody(p, body2);
                if (info.isOverlapping) {
                    if (edgeHits[info.edgeIndex] == null) edgeHits[info.edgeIndex] = [];
                    edgeHits[info.edgeIndex].push({ a: body1, b: body2, pointIndex: i, edgeindex: info.edgeIndex, info });
                }
            });

            // Process collision against each edge of body 2
            edgeHits.forEach((hits, i) => {
                if (hits.length == 0) return;

                if (hits.length == 1) {
                    collisions.push(hits[0]);
                    return;
                }

                // Average the collision points, update collision info
                for (let i = 1; i < hits.length; i++) hits[0].info.a.iadd(hits[i].info.a);
                hits[0].info.a.imult(1.0 / hits.length);
                hits[0].info.p = Utility.getClosestPointOnLine(
                    hits[0].info.a,
                    body2.worldVertices[i],
                    body2.worldVertices[(i + 1) % body2.worldVertices.length]
                );
                const dir = hits[0].info.p.sub(hits[0].info.a);
                hits[0].info.n = dir.norm();
                hits[0].info.depth = dir.getLength();
                collisions.push(hits[0]);
            });
        }

        // Check each direction and return
        check(body1, body2);
        check(body2, body1);
        return collisions;
    }
}

class User {
    static DRAG_FORCE = 300;

    constructor(sim) {
        this.sim = sim;
        this.mousePos = new Float2(0, 0);
        this.mouseClicked = false;
        this.mouseHeld = false;
        this.dragInfo = { isDragging: false, draggingRB: null, draggingOffsetAngle: null, draggingOffsetLength: null };
    }

    draw() {
        this.mousePos = new Float2(mouseX, mouseY);

        // Find hovered RBs
        let hoveredRB;
        this.sim.rigidbodys.forEach((rb) => {
            const hovered = Utility.checkCollisionPointBody(this.mousePos, rb).isOverlapping;

            // Visualize potentially draggable bodies
            if (hovered && !this.dragInfo.isDragging) {
                hoveredRB = rb;
                const sx = 200,
                    sy = 90;
                const topLeft = this.mousePos.add({ x: -sx * 0.5, y: -sy * 1 });
                const f = (num) => floor(num * 100) / 100;

                stroke(255);
                fill(10, 100);
                line(rb.pos.x, rb.pos.y, this.mousePos.x, this.mousePos.y);
                rect(topLeft.x, topLeft.y, sx, sy);

                noStroke();
                fill(255);
                textAlign(LEFT, TOP);
                textSize(10);
                text("pos: ", topLeft.x + 10, topLeft.y + 10);
                text(f(rb.pos.x) + ", " + f(rb.pos.y), topLeft.x + 100, topLeft.y + 10);
                text("pos vel: ", topLeft.x + 10, topLeft.y + 20);
                text(f(rb.posVel.x) + ", " + f(rb.posVel.y), topLeft.x + 100, topLeft.y + 20);
                text("rot: ", topLeft.x + 10, topLeft.y + 30);
                text(f(rb.rot), topLeft.x + 100, topLeft.y + 30);
                text("rot vel: ", topLeft.x + 10, topLeft.y + 40);
                text(f(rb.rotVel), topLeft.x + 100, topLeft.y + 40);
                text("mass: ", topLeft.x + 10, topLeft.y + 50);
                text(f(rb.mass), topLeft.x + 100, topLeft.y + 50);
                text("inertia: ", topLeft.x + 10, topLeft.y + 60);
                text(f(rb.inertia), topLeft.x + 100, topLeft.y + 60);
            }
        });

        // Handle not dragging but hovering object
        if (!this.dragInfo.isDragging) {
            if (hoveredRB != null && this.mouseClicked) {
                const dir = this.mousePos.sub(hoveredRB.pos);
                const angle = atan2(dir.y, dir.x) - hoveredRB.rot;
                const length = dir.getLength();
                this.dragInfo.isDragging = true;
                this.dragInfo.draggingRB = hoveredRB;
                this.dragInfo.draggingOffsetAngle = angle;
                this.dragInfo.draggingOffsetLength = length;
            }
        }

        // Handle currently dragging
        else {
            // Move object
            const angle = this.dragInfo.draggingOffsetAngle + this.dragInfo.draggingRB.rot;
            const pos = this.dragInfo.draggingRB.pos.add(
                new Float2(this.dragInfo.draggingOffsetLength * cos(angle), this.dragInfo.draggingOffsetLength * sin(angle))
            );
            const a = this.dragInfo.draggingRB;
            const dir = this.mousePos.sub(pos);
            a.posVel.iadd(dir.mult(User.DRAG_FORCE / a.mass));
            a.rotVel += (pos.sub(a.pos).perp().dot(dir) * User.DRAG_FORCE) / a.inertia;

            stroke(255);
            noFill();
            line(pos.x, pos.y, this.mousePos.x, this.mousePos.y);

            if (!this.mouseHeld) this.dragInfo.isDragging = false;
        }

        this.mouseClicked = false;
    }

    mousePressed() {
        this.mouseHeld = true;
        this.mouseClicked = true;
    }

    mouseReleased() {
        this.mouseHeld = false;
        this.mouseClicked = false;
    }
}

class RigidbodySimulation {
    static GRAVITY = new Float2(0.0, 800);
    static SUB_FRAMES = 5.0;
    static POS_PCT = 0.95;
    static POS_SLOP = 0.01;
    static IMP_E = 0.4;

    constructor(useGravity) {
        this.rigidbodys = [];
        this.collisions = [];
        this.useGravity = useGravity;
        this.dt = 0.0;
    }

    draw() {
        // Update physics and show
        this.dt = 1.0 / 60.0;
        this.stepPhysics(this.dt);
        for (const rb of this.rigidbodys) rb.show();
    }

    showCollisions() {
        // Draw collisions
        strokeWeight(2);
        stroke(100, 200, 100);
        noFill();
        this.collisions.forEach((c) => {
            line(c.info.p.x, c.info.p.y, c.info.p.x + c.info.n.x * 50, c.info.p.y + c.info.n.y * 50);
            rect(c.info.p.x - 5, c.info.p.y - 5, 10, 10);
        });
        strokeWeight(1);
    }

    stepPhysics(dt) {
        // Split DT up and step forward
        for (let _ = 0; _ < RigidbodySimulation.SUB_FRAMES; _++) {
            this.stepDynamics(dt / RigidbodySimulation.SUB_FRAMES);
            this.detectCollisions();
            this.resolveCollisions();
        }
    }

    stepDynamics(dt) {
        this.rigidbodys.forEach((rb) => {
            // Cancel out dynamics
            if (rb.isStatic) {
                rb.rotVel = 0;
                rb.posVel.imult(0);
                return;
            }

            // Apply gravity force
            if (this.useGravity) rb.posVel.iadd(RigidbodySimulation.GRAVITY.mult(dt));

            // Update pos / rot
            rb.pos.iadd(rb.posVel.mult(dt));
            rb.rot += rb.rotVel * dt;
            rb.rot = (rb.rot + TWO_PI) % TWO_PI;

            // Update vertices
            rb.updateWorldShape();
        });
    }

    detectCollisions() {
        // Loop over and find all valid pairs
        this.collisions = [];
        for (let i = 0; i < this.rigidbodys.length - 1; i++) {
            for (let j = i + 1; j < this.rigidbodys.length; j++) {
                const rb1 = this.rigidbodys[i];
                const rb2 = this.rigidbodys[j];
                if (rb1.isStatic && rb2.isStatic) continue;
                const rb12Collisions = Utility.checkCollisionBodyBody(rb1, rb2);
                rb12Collisions.forEach((c) => this.collisions.push(c));
            }
        }
    }

    resolveCollisions() {
        this.collisions.forEach((c) => {
            // Collate needed variables
            const e = RigidbodySimulation.IMP_E;
            const n = c.info.n;
            const m_a = c.a.mass;
            const m_b = c.b.mass;
            const I_a = c.a.inertia;
            const I_b = c.b.inertia;
            const mI_a = c.a.isStatic ? 0.0 : 1.0 / m_a;
            const mI_b = c.b.isStatic ? 0.0 : 1.0 / m_b;
            const II_a = c.a.isStatic ? 0.0 : 1.0 / I_a;
            const II_b = c.b.isStatic ? 0.0 : 1.0 / I_b;

            // Calculate collision variables
            const rP_a = c.info.a.sub(c.a.pos);
            const rP_b = c.info.a.sub(c.b.pos);
            const rPT_a = rP_a.perp();
            const rPT_b = rP_b.perp();
            const vP_a = c.a.posVel.add(rPT_a.mult(c.a.rotVel));
            const vP_b = c.b.posVel.add(rPT_b.mult(c.b.rotVel));
            const vRP = vP_b.sub(vP_a);
            const vRN = vRP.dot(n);
            if (vRN < 0) return;

            // ------------------
            // Resolve impulses
            // ------------------
            const j = (-(1 + e) * vRN) / (mI_a + mI_b + pow(rP_a.cross(n), 2) * II_a + pow(rP_b.cross(n), 2) * II_b);
            const jn_a = n.mult(-j);
            const jn_b = n.mult(j);
            c.a.deltaPosVel.iadd(jn_a.mult(mI_a));
            c.b.deltaPosVel.iadd(jn_b.mult(mI_b));
            c.a.deltaRotVel += rPT_a.dot(jn_a) * II_a;
            c.b.deltaRotVel += rPT_b.dot(jn_b) * II_b;

            // ------------------
            // Resolve positions
            // ------------------
            const amount = (RigidbodySimulation.POS_PCT * max(c.info.depth - RigidbodySimulation.POS_SLOP, 0.0)) / (mI_a + mI_b);
            const correction = c.info.n.mult(amount);
            if (!c.a.isStatic) c.a.deltaPos.iadd(correction.mult(mI_a));
            if (!c.b.isStatic) c.b.deltaPos.iadd(correction.mult(-mI_b));
            c.a.deltaUpdate = !c.a.isStatic;
            c.b.deltaUpdate = !c.b.isStatic;
        });

        // Apply and empty deltas
        this.rigidbodys.forEach((cl) => {
            if (!cl.deltaUpdate) return;

            // Add deltas
            if (!cl.isStatic) {
                cl.pos.iadd(cl.deltaPos);
                cl.rot += cl.deltaRot;
                cl.posVel.iadd(cl.deltaPosVel);
                cl.rotVel += cl.deltaRotVel;
                cl.updateWorldShape();
            }

            // Empty deltas
            cl.deltaPos.imult(0);
            cl.deltaPosVel.imult(0);
            cl.deltaRot *= 0;
            cl.deltaRotVel *= 0;
            cl.deltaUpdate = false;
        });
    }
}

class Rigidbody {
    constructor(world, isStatic, density) {
        // Add to world
        this.world = world;
        this.world.rigidbodys.push(this);

        // Dynamics variables
        this.pos = new Float2(0, 0);
        this.posVel = new Float2(0, 0);
        this.rot = 0;
        this.rotVel = 0;

        // Physical attributes
        this.isStatic = isStatic;
        this.density = density;
        this.mass = 0;
        this.inertia = 0;

        // Shape data
        this.localVertices = [];
        this.localBB = null;
        this.worldVertices = [];
        this.worldBB = null;
        this.triangles = [];

        // Collision deltas
        this.updateDelta = false;
        this.deltaPos = new Float2(0, 0);
        this.deltaPosVel = new Float2(0, 0);
        this.deltaRot = 0;
        this.deltaRotVel = 0;
    }

    static createSquare(world, isStatic, density, pos, size) {
        // Setup points
        const WOBBLINESS = 0.15;
        const vertices = [];
        vertices.push(new Float2(-size.x * 0.5, -size.y * 0.5));
        vertices.push(new Float2(size.x * 0.5, -size.y * 0.5));
        vertices.push(new Float2(size.x * 0.5, size.y * 0.5));
        vertices.push(new Float2(-size.x * 0.5, size.y * 0.5));

        // Creatae and return rigidbody
        const newRigidbody = new Rigidbody(world, isStatic, density);
        newRigidbody.pos = pos;
        newRigidbody.setShape(vertices);
        return newRigidbody;
    }

    static createFunky(world, isStatic, density, pos, size) {
        // Setup points
        const WOBBLINESS = 0.15;
        const vertices = [];
        vertices.push(new Float2(0, -size.y * 0.5));
        vertices.push(new Float2(size.x * 0.5, -size.y * 0.5));
        vertices.push(new Float2(size.x * 0.3, 0));
        vertices.push(new Float2(size.x * 0.5, size.y * 0.2));
        vertices.push(new Float2(-size.x * 0.2, size.y * 0.35));
        vertices.push(new Float2(-size.x * 0.3, 0));

        // Creatae and return rigidbody
        const newRigidbody = new Rigidbody(world, isStatic, density);
        newRigidbody.pos = pos;
        newRigidbody.setShape(vertices);
        return newRigidbody;
    }

    show() {
        noFill();

        // Draw triangles
        stroke(120);
        this.triangles.forEach((t) =>
            triangle(
                this.worldVertices[t[0]].x,
                this.worldVertices[t[0]].y,
                this.worldVertices[t[1]].x,
                this.worldVertices[t[1]].y,
                this.worldVertices[t[2]].x,
                this.worldVertices[t[2]].y
            )
        );

        // Draw bounds
        stroke(150, 150, 220);
        rect(this.worldBB.min.x, this.worldBB.min.y, this.worldBB.max.x - this.worldBB.min.x, this.worldBB.max.y - this.worldBB.min.y);

        // Draw edge
        stroke(255);
        beginShape();
        this.worldVertices.forEach((v) => vertex(v.x, v.y));
        endShape(CLOSE);

        // Draw centre
        ellipse(this.pos.x, this.pos.y, 5, 5);
    }

    setShape(newVertices) {
        // Set points and update
        this.localVertices = newVertices;
        this.updateLocalShape();
    }

    updateWorldShape() {
        // Setup rotation matrix
        const rotMat = [
            [cos(this.rot), -sin(this.rot)],
            [sin(this.rot), cos(this.rot)],
        ];

        // Update world vertices and BB
        this.worldVertices = this.localVertices.map((v) => Utility.translatePoint(v, this.pos, rotMat));
        this.worldBB = Utility.calculateBB(this.worldVertices);
    }

    updateLocalShape() {
        // Recalculate physical attributes
        this.localBB = Utility.calculateBB(this.localVertices);
        this.triangles = Utility.triangulate(this.localVertices);
        this.mass = Utility.calculateMass(this);
        this.inertia = Utility.calculateInertia(this);

        // Reculate world shape
        this.updateWorldShape();
    }
}

/*
class Shape {
    // #region - Setup

    constructor(pos_, vertexOffsets_, vertexTriangles_) {
        // Declare and initialize other variables
        this.vtxInfo = {
            offsets: vertexOffsets_,
            points: [],
            outer: [],
            triangles: vertexTriangles_,
        };

        // Main setup
        this.updateVertexPoints();
        this.updateVertexOuterIndices();
        this.mass = this.calculateMass();
        this.momInertPos = this.calculateMomInertPos();
    }

    static newSquare(pos = new Float2(0, 0), size = new Float2(100, 100), quality = 1, wobbly = false, wobbliness = 0.3) {
        // Default square variables
        let dx = size.x / quality;
        let dy = size.y / quality;
        let offsets = [];
        let triangles = [];
        for (let y = 0; y <= quality; y++) {
            for (let x = 0; x <= quality; x++) {
                // Add new vertex
                let newVertexOffset = new Float2(-size.x * 0.5 + dx * x, -size.y * 0.5 + dy * y);

                // Offset if specified
                if (wobbly) {
                    let wobblyFloat2 = new Float2(random(dx * wobbliness * 2) - dx * wobbliness, random(dy * wobbliness * 2) - dy * wobbliness);
                    newVertexOffset = newVertexOffset.add(wobblyFloat2);
                }
                offsets.push(newVertexOffset);

                // Add vtxInfo.triangles if necessary
                if (x < quality && y < quality) {
                    triangles.push([y * (quality + 1) + x, y * (quality + 1) + (x + 1), (y + 1) * (quality + 1) + (x + 1)]);
                    triangles.push([y * (quality + 1) + x, (y + 1) * (quality + 1) + (x + 1), (y + 1) * (quality + 1) + x]);
                }
            }
        }

        // Return completed shape
        let newShape = new Shape(pos, offsets, triangles);
        return newShape;
    }

    // #endregion

    // #region - Main

    earlyUpdate() {
        // Early updates
        this.detectCollisions();
    }

    update() {
        // General updates
        this.updateKinematics();
        this.updateVertexPoints();
    }

    show() {
        // Show each point
        noStroke();
        fill(255);
        for (let point of this.vtxInfo.points) ellipse(point.x, point.y, 2, 2);

        // show each triangle edge
        stroke(255);
        noFill();
        for (let i = 0; i < this.vtxInfo.triangles.length; i++) {
            beginShape();
            for (let index of this.vtxInfo.triangles[i]) vertex(this.vtxInfo.points[index].x, this.vtxInfo.points[index].y);
            endShape(CLOSE);
        }

        // show vtxInfo.outer edge
        stroke("#db3caa");
        fill("#db3caa");
        beginShape();
        for (let outerIndices of this.vtxInfo.outer) {
            ellipse(this.vtxInfo.points[outerIndices[0]].x, this.vtxInfo.points[outerIndices[0]].y, 6, 6);
            line(
                this.vtxInfo.points[outerIndices[0]].x,
                this.vtxInfo.points[outerIndices[0]].y,
                this.vtxInfo.points[outerIndices[1]].x,
                this.vtxInfo.points[outerIndices[1]].y
            );
        }
    }

    // #endregion

    // #region - Kinematics

    // http://chrishecker.com/Rigid_body_dynamics

    updateKinematics() {
        this.updateCollision();

        // Update position
        this.posVel.ipAdd(this.posAcc);
        this.pos.ipAdd(this.posVel);
        this.posAcc.ipMult(0);

        // Update rotation
        this.rotVel += this.rotAcc;
        this.rot += this.rotVel;
        this.rotAcc *= 0;
        this.rot = (this.rot + TWO_PI) % TWO_PI;
    }

    updateCollision() {
        // Update each collision
        for (let collision of this.collisions) {
            this.pos.ipAdd(collision.diff);
            this.applyImpulseToPoint(collision.point, collision.jn);
        }
        this.collisions = [];
    }

    detectCollisions() {
        // For each other shape
        for (let oShp of shapes) {
            if (oShp != this) {
                // Calculate whether there is overlap
                let overlap = false;
                let p = null;
                let n = null;
                let diff = null;

                // Check this point over other shape

                // Calculate collision impulse
                if (overlap) {
                    let cor = 0.88;
                    let vecAPT = p.sub(this.pos).perp();
                    let vecBPT = p.sub(oShp.pos).perp();
                    let velAtPointAP = this.posVel.add(vecAPT.mult(this.rotVel));
                    let velAtPointBP = oShp.posVel.add(vecAPT.mult(oShp.rotVel));
                    let velAB = velAtPointBP.sub(velAtPointAP);
                    let massA = this.mass;
                    let massB = oShp.mass;
                    let inertA = this.momInertPos;
                    let inertB = oShp.momInertPos;
                    let j =
                        (-(1 + cor) * velAB.dot(n)) /
                        (n.dot(n.mult(1.0 / massA + 1.0 / massB)) + (vecAPT.dot(n) * vecAPT.dot(n)) / inertA + (vecBPT.dot(n) * vecBPT.dot(n)) / inertB);

                    // Add impulse
                    if (diff.getLength() > 2) noLoop();
                    this.collisions.push({ point: p, jn: n.mult(-j), diff: diff.mult(-0.5) });
                    oShp.collisions.push({ point: p, jn: n.mult(j), diff: diff.mult(0.5) });
                }
            }
        }
    }

    applyImpulseToPoint(point, jn) {
        // jn = mv - mu
        // posVel += (jn) / mass;
        // rotAcc += (jn • rAP^T) / momInert;
        this.posVel.ipAdd(jn.mult(1.0 / this.mass));
        this.rotVel += point.sub(this.pos).perp().dot(jn) / this.momInertPos;
    }

    calculateMass() {
        // Use density and area of triangles
        // dens * vol = mass
        // s = 1/2 ( a + b + c )
        // Area = sqrt ( s ( s-a) ( s-b) ( s-c) )
        let totalMass = 0;
        for (let triangle of this.vtxInfo.triangles) {
            let a = this.vtxInfo.points[triangle[1]].sub(this.vtxInfo.points[triangle[0]]).getLength();
            let b = this.vtxInfo.points[triangle[2]].sub(this.vtxInfo.points[triangle[1]]).getLength();
            let c = this.vtxInfo.points[triangle[0]].sub(this.vtxInfo.points[triangle[2]]).getLength();
            let s = 0.5 * (a + b + c);
            let area = sqrt(s * (s - a) * (s - b) * (s - c));
            totalMass += area * this.density;
        }
        return totalMass;
    }

    calculateMomInertPos() {
        // Sum of (mass * perpRad^2) for each point
        // Use equation online for each triangle
        let totalMomInertPos = 0;
        totalMomInertPos = 500000000000;
        return totalMomInertPos;
    }

    // #endregion

    // #region - Vertices

    updateVertexPoints() {
        // Update vtxInfo.points using vtxInfo.offsets
        let rotMat = [
            [cos(this.rot), -sin(this.rot)],
            [sin(this.rot), cos(this.rot)],
        ];
        for (let i = 0; i < this.vtxInfo.offsets.length; i++) this.vtxInfo.points[i] = this.pos.add(this.vtxInfo.offsets[i].matMult(rotMat));
    }

    updateVertexOuterIndices() {
        // Find all edges which are unique
        this.vtxInfo.outer = [];
        let allEdges = [];

        // Create a list of all edges
        for (let t = 0; t < this.vtxInfo.triangles.length; t++) {
            allEdges.push([this.vtxInfo.triangles[t][0], this.vtxInfo.triangles[t][1], this.vtxInfo.triangles[t][2]]);
            allEdges.push([this.vtxInfo.triangles[t][1], this.vtxInfo.triangles[t][2], this.vtxInfo.triangles[t][0]]);
            allEdges.push([this.vtxInfo.triangles[t][2], this.vtxInfo.triangles[t][0], this.vtxInfo.triangles[t][1]]);
        }

        // Compare each edge against each other
        for (let e0 = 0; e0 < allEdges.length; e0++) {
            for (let e1 = e0 + 1; e1 < allEdges.length; e1++) {
                if (
                    (allEdges[e0][0] == allEdges[e1][0] && allEdges[e0][1] == allEdges[e1][1]) ||
                    (allEdges[e0][0] == allEdges[e1][1] && allEdges[e0][1] == allEdges[e1][0])
                ) {
                    allEdges.splice(e1, 1);
                    e1--;
                    allEdges.splice(e0, 1);
                    e0--;
                }
            }
        }

        // Path around unique allEdges
        if (allEdges.length > 2) {
            let current = null;
            while (current != allEdges[0]) {
                if (current == null) current = allEdges[0];
                this.vtxInfo.outer.push(current);
                for (let edge of allEdges) {
                    if (edge[0] == current[1]) {
                        current = edge;
                        break;
                    }
                }
            }
        }
    }

    removeIndex(index) {
        // Ensure index is in range
        if (index < 0 || index >= this.vtxInfo.offsets.length) return;

        // Remove corresponding vertexOffset
        this.vtxInfo.offsets.splice(index, 1);

        // Loop over all vtxInfo.triangles
        for (let i = 0; i < this.vtxInfo.triangles.length; i++) {
            // Remove it if it overlaps index
            if (this.vtxInfo.triangles[i].indexOf(index) != -1) {
                this.vtxInfo.triangles.splice(i, 1);
                i--;

                // Lower other indices above index
            } else {
                for (let o = 0; o < this.vtxInfo.triangles[i].length; o++) {
                    if (this.vtxInfo.triangles[i][o] > index) {
                        this.vtxInfo.triangles[i][o]--;
                    }
                }
            }
        }

        // Update vtxInfo.outer
        this.updateVertexPoints();
        this.updateVertexOuterIndices();
    }

    // #endregion
}
*/
