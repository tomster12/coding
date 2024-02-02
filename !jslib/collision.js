
class Collision {

  // #region - Main

  static circleOverlapCircle(pos0, radius0, pos1, radius1) {
    // Detect overlap between 2 circle
    let dx = pos1.x - pos0.x;
    let dy = pos1.y - pos0.y;
    let dist = sqrt(dx * dx + dy * dy);
    if (dist < (radius0 + radius1)) {
      let mult = (radius0 + radius1 - dist) / dist;
      let correction = { x: -dx * mult, y: -dy * mult };
      return { collided: true, correction: correction };
    } else return { collided: false, correction: null };
  }


  static circleOverlapRect(circlePos, circleRadius, rectPos, rectSize) {
    // Calculate difference
    let dx = rectPos.x - circlePos.x;
    let dy = rectPos.y - circlePos.y;
    let edx = abs(dx) - (rectSize.x * 0.5 + circleRadius);
    let edy = abs(dy) - (rectSize.y * 0.5 + circleRadius);

    // Return shortest correction
    if (edx < 0 && edy < 0) {
      return { collided: true, correction: (edx < edy)
        ? { x: edx * sign(dx), y: 0 }
        : { x: 0, y: edy * sign(dy) } };
    } else return { collided: false, correction: null };
  }


  static rectOverlapRect(rect0, rect1) {
    // Detect overlap between rect and rect
    return { collided: false, correction: null };
  }

  // #endregion
}
