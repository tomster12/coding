
// #region - Setup

// Declare variables
PVector start;
float size;
String[] data = {
  "2010132233040411302321143130330040240005",
  "0320412200014222421222201100032013411135",
  "3102210440002001040401441420330220342415",
  "2313131300311321201422313314413414412115",
  "0140032121141300411101002412410040310015",
  "0403314323411221010100401204124424424025",
  "133312203301031131112112103223145",
  "13104242241303041102031232043135"
};


void setup() {
  size(1200, 800);
  noFill();
  stroke(0);

  // Initialize variables
  start = new PVector(50, 50);
  size = 20;
}


void draw() {
  background(220);

  // For each eye
  for (int row = 0; row < data.length; row++) {
    for (int col = 0; col < data[row].length(); col++) {

      // Get value
      int val = Character.getNumericValue(data[row].charAt(col));
      if (val != 5) {

        // Calculate position
        PVector pos = new PVector(start.x + col * size, start.y + row * size);
        if (row % 2 == 1) pos.x += size * 0.5;
        PVector ctr = new PVector(pos.x + size * 0.5, pos.y + size * 0.5);

        // Draw eye
        stroke(180);
        ellipse(ctr.x, ctr.y, size * 0.6, size * 0.6);

        // Draw lines
        stroke(0);
        if (val == 0) {
          // ellipse(ctr.x, ctr.y, size * 0.3, size * 0.3);
          // line(pos.x, pos.y, pos.x + size, pos.y + size);
          // line(pos.x + size, pos.y, pos.x, pos.y + size);
          line(pos.x, pos.y + size * 0.5, pos.x + size, pos.y + size * 0.5);
          line(pos.x + size * 0.5, pos.y, pos.x + size * 0.5, pos.y + size);
          // rect(pos.x, pos.y, size, size);
        }
        else if (val == 1) line(pos.x, pos.y, pos.x + size, pos.y);
        else if (val == 2) line(pos.x + size, pos.y, pos.x + size, pos.y + size);
        else if (val == 3) line(pos.x, pos.y + size, pos.x + size, pos.y + size);
        else if (val == 4) line(pos.x, pos.y, pos.x, pos.y + size);
      }
    }
  }
}

// #endregion
