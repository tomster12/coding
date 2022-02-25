
public static class CollisionInfo {

  public boolean hasCollision;
  public Float2 pointA;
  public Float2 pointB;
  public Float2 normal;
  public float length;


  CollisionInfo(boolean hasCollision_, Float2 pointA_, Float2 pointB_, Float2 normal_, float length_) {
    hasCollision = hasCollision_; pointA = pointA_; pointB = pointB_; normal = normal_; length = length_; }


  CollisionInfo() {
    hasCollision = false; pointA = null; pointB = null; normal = null; length = 0; }
}


static class Overlap {

  public static CollisionInfo checkCircleCircle(Float2 cc1, Float2 cc2, float cr1, float cr2) {
    // Perform collision check
    Float2 dir = cc2.sub(cc1);
    boolean collided = dir.mag() <= (cr1 + cr2);
    if (collided) {

      // Generate and return information
      Float2 normal = dir.normalize();
      Float2 pointA = cc1.add(normal.mult(cr1));
      Float2 pointB = cc2.add(normal.mult(-cr2));
      float depth = pointB.sub(pointA).mag();
      return new CollisionInfo(true, pointA, pointB, normal, depth);

    // Default info otherwise
    } else return new CollisionInfo();
  }


  public static CollisionInfo checkCircleRect(Float2 cc, Float2 rc, float cr, Float2 rs, float ra) {
    // Perform collisions check
    Float2 rel = cc.sub(rc);
    float localX = cos(-ra) * rel.x - sin(-ra) * rel.y;
    float localY = sin(-ra) * rel.x + cos(-ra) * rel.y;
    float nearestLocalX = max(rs.x * -0.5, min(localX, rs.x * 0.5));
    float nearestLocalY = max(rs.y * -0.5, min(localY, rs.y * 0.5));
    float deltaLocalX = localX - nearestLocalX;
    float deltaLocalY = localY - nearestLocalY;
    float distSq = deltaLocalX * deltaLocalX + deltaLocalY * deltaLocalY;
    boolean collided = distSq < (cr * cr);
    if (collided) {

      // Generate and return information
      Float2 nearestWorld = new Float2(
        rc.x + cos(ra) * nearestLocalX - sin(ra) * nearestLocalY,
        rc.y + sin(ra) * nearestLocalX + cos(ra) * nearestLocalY);
      Float2 normal = nearestWorld.sub(cc).normalize();
      Float2 pointA = cc.add(normal.mult(cr));
      Float2 pointB = nearestWorld;
      float length = cr - sqrt(distSq);
      return new CollisionInfo(collided, pointA, pointB, normal, length);

    // Default info otherwise
    } else return new CollisionInfo();
  }


  public static CollisionInfo checkRectRect(Float2 rc1, Float2 rc2, Float2 rs1, Float2 rs2, float ra, float r2) {

    return new CollisionInfo();
  }
}