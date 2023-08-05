
// #region - Setup

String data = "20101322330404113023211431303300402400050320412200014222421222201100032013411135310221044000200104040144142033022034241523131313003113212014223133144134144121150140032121141300411101002412410040310015040331432341122101010040120412442442402513331220330103113111211210322314513104242241303041102031232043135";
PVector pos = new PVector(width * 0.3, height * 0.7);
int current = 0;
float size = 15;
float pct = 1;


void setup() {
  size(1200, 800);
  background(255);
  strokeWeight(1.5);
  pos = new PVector(width * 0.3, height * 0.7);
}


void draw() {
  // Do next line
  if (frameCount > 600 && frameCount % 10 == 0 && current < data.length()) {
    int val = Character.getNumericValue(data.charAt(current));
    fill(255 - (255 * pct), 150);
    stroke(255 - (255 * pct), 150);

    // Draw dot
    if (val == 0) {
      ellipse(pos.x, pos.y, size * 0.25, size * 0.25);
      pct = 1;

    // Draw line
    } else if (val < 5) {
      int[][] dirs = { { 0, -1 }, { 1, 0 }, { 0, 1 }, { -1, 0 } };
      PVector dir = new PVector(dirs[val - 1][0], dirs[val - 1][1]);
        line(pos.x, pos.y, pos.x + dir.x * size, pos.y + dir.y * size);
        pos.x += dir.x * size;
        pos.y += dir.y * size;
        pct -= 0.04;

    // End of line
    } else if (val == 5) ellipse(pos.x, pos.y, size * 0.4, size * 0.4);
    current += 1;
  }
}

// #endregion
