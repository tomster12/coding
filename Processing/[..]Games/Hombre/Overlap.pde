
public static class OverlapInfo {

  boolean isOverlapping = false;
  float aPosX, aPosY, bPosX, bPosY;
  float normalX, normalY;
  float length;


  OverlapInfo() { }

  OverlapInfo(boolean isOverlapping, float aPosX, float aPosY, float bPosX, float bPosY, float normalX, float normalY, float length) {
    this.isOverlapping = isOverlapping;
    this.aPosX = aPosX;
    this.aPosY = aPosY;
    this.bPosX = bPosX;
    this.bPosY = bPosY;
    this.normalX = normalX;
    this.normalY = normalY;
    this.length = length;
  }
}


static class Overlap {

  public static OverlapInfo checkCircleCircle(
    float aCentreX, float aCentreY, float aRadius,
    float bCentreX, float bCentreY, float bRadius,
    boolean flip
  ) {
    // Perform collision check
    float dX = bCentreX - aCentreX;
    float dY = bCentreY - aCentreY;
    float dst = sqrt(dX * dX + dY * dY);
    boolean isOverlapping = dst <= (aRadius + bRadius);

    // No overlap so empty info
    if (!isOverlapping) return new OverlapInfo();

    // Is overlapping so generate info
    float normalX = dX / dst;
    float normalY = dY / dst;
    float aPosX = aCentreX + normalX * aRadius;
    float aPosY = aCentreY + normalY * aRadius;
    float bPosX = bCentreX - normalX * bRadius;
    float bPosY = bCentreY - normalY * bRadius;
    float pdX = bPosX - aPosX;
    float pdY = bPosY - aPosY;
    float length = sqrt(pdX * pdX + pdY * pdY);
    if (flip) return new OverlapInfo(true, bPosX, bPosY, aPosX, aPosY, -normalX, -normalY, length);
    else return new OverlapInfo(true, aPosX, aPosY, bPosX, bPosY, normalX, normalY, length);
  }


  public static OverlapInfo checkRectCircle(
    float rCentreX, float rCentreY, float rSizeX, float rSizeY, float rAngle,
    float cCentreX, float cCentreY, float cRadius,
    boolean flip
  ) {
    // Perform collisions check
    float worldDX = cCentreX - rCentreX;
    float worldDY = cCentreY - rCentreY;
    float localDX = cos(-rAngle) * worldDX - sin(-rAngle) * worldDY;
    float localDY = sin(-rAngle) * worldDX - cos(-rAngle) * worldDY;
    float localEdgeX = max(-rSizeX * 0.5, min(localDX, rSizeX * 0.5));
    float localEdgeY = max(-rSizeY * 0.5, min(localDY, rSizeY * 0.5));
    float localGapX = localDX - localEdgeX;
    float localGapY = localDY - localEdgeY;
    float edgeDstSq = localGapX * localGapX + localGapY * localGapY;
    boolean isOverlapping = edgeDstSq < cRadius * cRadius;

    // No overlap so empty info
    if (!isOverlapping) return new OverlapInfo();

    // Is overlapping so generate info
    float aPosX = rCentreX + cos(rAngle) * localEdgeX - sin(rAngle) * localEdgeY;
    float aPosY = rCentreY + sin(rAngle) * localEdgeX - cos(rAngle) * localEdgeY;
    float dirX = aPosX - cCentreX;
    float dirY = aPosY - cCentreY;
    float dirDst = sqrt(dirX * dirX + dirY * dirY);
    float normalX = dirX / dirDst;
    float normalY = dirY / dirDst;
    float bPosX = cCentreX + cRadius * normalX;
    float bPosY = cCentreY + cRadius * normalY;
    float length = cRadius - sqrt(edgeDstSq);
    if (flip) return new OverlapInfo(true, bPosX, bPosY, aPosX, aPosY, -normalX, -normalY, length);
    else return new OverlapInfo(true, aPosX, aPosY, bPosX, bPosY, normalX, normalY, length);
  }


  public static OverlapInfo checkRectRect(
    float aCentreX, float aCentreY, float aSizeX, float aSizeY, float aAngle,
    float bCentreX, float bCentreY, float bSizeX, float bSizeY, float bAngle,
    boolean flip
  ) {
    // Not Implemented
    return new OverlapInfo();
  }
}