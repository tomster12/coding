
class Collision {

  public RigidBody bodyA;
  public RigidBody bodyB;
  public CollisionInfo info;


  Collision(RigidBody bodyA_, RigidBody bodyB_, CollisionInfo info_) {
    bodyA = bodyA_; bodyB = bodyB_; info = info_; }
}


abstract class Collider {

  public boolean collided;


  // Collision function redirector
  public CollisionInfo checkCollision(Transform transform, Collider otherCollider, Transform otherTransform) {

    if (otherCollider instanceof CircleCollider) {
      return checkCollision(transform, (CircleCollider)otherCollider, otherTransform);

    } else if (otherCollider instanceof RectCollider) {
      return checkCollision(transform, (RectCollider)otherCollider, otherTransform);

    } else return new CollisionInfo();
  }

  public abstract CollisionInfo checkCollision(Transform transform, CircleCollider otherCollider, Transform otherTransform);
  public abstract CollisionInfo checkCollision(Transform transform, RectCollider otherCollider, Transform otherTransform);

  public abstract float getArea(Transform transform);
  public abstract void show(Transform transform);
}


class CircleCollider extends Collider {

  public CollisionInfo checkCollision(Transform transform, CircleCollider otherCollider, Transform otherTransform) {
    // Circle on circle
    Float2 cc1 = transform.position;
    Float2 cc2 = otherTransform.position;
    float cr1 = transform.size.x * 0.5;
    float cr2 = otherTransform.size.x * 0.5;
    CollisionInfo info = Overlap.checkCircleCircle(cc1, cc2, cr1, cr2);
    if (info.hasCollision) { this.collided = true; otherCollider.collided = true; }
    return info;
  }


  public CollisionInfo checkCollision(Transform transform, RectCollider otherCollider, Transform otherTransform) {
    // Circle on rect
    Float2 cc = transform.position;
    Float2 rc = otherTransform.position;
    float cr = transform.size.x * 0.5;
    Float2 rs = otherTransform.size;
    float ra = otherTransform.rotation;
    CollisionInfo info = Overlap.checkCircleRect(cc, rc, cr, rs, ra);
    if (info.hasCollision) { this.collided = true; otherCollider.collided = true; }
    return info;
  }


  public float getArea(Transform transform) {
    // Return area of circle
    return (float)Math.PI * transform.size.x * transform.size.x;
  }


  public void show(Transform transform) {
    // Show as circle
    pushMatrix();
    if (false && collided) stroke(255, 100, 100);
    else stroke(255);
    noFill();
    translate(transform.position.x, transform.position.y);
    rotate(transform.rotation);
    ellipse(0, 0, transform.size.x, transform.size.x);
    line(0, 0, transform.size.x * 0.5, 0);
    popMatrix();
  }
}


class RectCollider extends Collider {

  public CollisionInfo checkCollision(Transform transform, CircleCollider otherCollider, Transform otherTransform) {
    // Rect on circle
      Float2 cc = otherTransform.position;
      Float2 rc = transform.position;
      float cr = otherTransform.size.x * 0.5;
      Float2 rs = transform.size;
      float ra = transform.rotation;
      CollisionInfo info = Overlap.checkCircleRect(cc, rc, cr, rs, ra);
      if (info.hasCollision) { this.collided = true; otherCollider.collided = true; }
      return info;
    }


  public CollisionInfo checkCollision(Transform transform, RectCollider otherCollider, Transform otherTransform) {
    // Rect on rect
    Float2 rc1 = transform.position;
    Float2 rc2 = otherTransform.position;
    Float2 rs1 = transform.size;
    Float2 rs2 = otherTransform.size;
    float ra1 = transform.rotation;
    float ra2 = otherTransform.rotation;
    CollisionInfo info = Overlap.checkRectRect(rc1, rc2, rs1, rs2, ra1, ra2);
    if (info.hasCollision) { this.collided = true; otherCollider.collided = true; }
    return info;
  }


  public float getArea(Transform transform) {
    // Return area of rect
    return transform.size.x * transform.size.y;
  }


  public void show(Transform transform) {
    // Show as rect
    pushMatrix();
    if (false && collided) stroke(255, 100, 100);
    else stroke(255);
    noFill();
    translate(transform.position.x, transform.position.y);
    rotate(transform.rotation);
    rect(-transform.size.x * 0.5, -transform.size.y * 0.5, transform.size.x, transform.size.y);
    popMatrix();
  }
}