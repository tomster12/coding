
public class AutomataSim {

  // Declare variables
  int[][] cellRules;
  PVector gridSize;
  PVector showPos;
  PVector showSize;

  PGraphics out;
  int[][] cells;
  boolean isUpdating;


  AutomataSim(int[][] cellRules_, PVector gridSize_, PVector showPos_, PVector showSize_) {
    // Initialize variables
    cellRules = cellRules_;
    gridSize = gridSize_;
    showPos = showPos_;
    showSize = showSize_;

    out = createGraphics((int)gridSize.x, (int)gridSize.y);
    out.beginDraw();
    initGrid();
    isUpdating = true;
  }


  void initGrid() {
    // Initialize cells as 0s
    cells = new int[(int)gridSize.x][(int)gridSize.y];
    for (int x = 0; x < gridSize.x; x++) {
      for (int y = 0; y < gridSize.y; y++) {
        cells[x][y] = random(2) < 0.7 ? 0 : 1;
      }
    }
  }


  void update() {
    // Handle drawing / removing
    if (mouseButton == LEFT || mouseButton == RIGHT) {
      float px = constrain(mouseX, showPos.x, showPos.x + showSize.x);
      float py = constrain(mouseY, showPos.y, showPos.y + showSize.y);
      int cx = floor(map(px, showPos.x, showPos.x + showSize.x, 0, gridSize.x - 1));
      int cy = floor(map(py, showPos.y, showPos.y + showSize.y, 0, gridSize.y - 1));
      if (mouseButton == LEFT) cells[cx][cy] = 1;
      else if (mouseButton == RIGHT) cells[cx][cy] = 0;
    }


    // Update cells
    if (isUpdating) {

      // Loop over each pixel
      int[][] nCells = new int[(int)gridSize.x][(int)gridSize.y];
      for (int x = 0; x < gridSize.x; x++) {
        for (int y = 0; y < gridSize.y; y++) {
          nCells[x][y] = cells[x][y];

          // Count neighbours
          int count = countNeighbours(x, y);

          // Check rules for coming alive
          if (cells[x][y] == 0) {
            boolean comeAlive = (count >= cellRules[0][0]) && (count <= cellRules[0][1]);
            if (comeAlive) nCells[x][y] = 1;

          // Check rules for staying alive
          } else if (cells[x][y] == 1) {
            boolean stayAlive = (count >= cellRules[1][0]) && (count <= cellRules[1][1]);
            if (!stayAlive) nCells[x][y] = 0;
          }
        }
      }

      // Update cells
      cells = nCells;
    }
  }


  void show() {
    // Load out graphic, and then draw cells onto it
    out.loadPixels();
    for (int x = 0; x < cells.length; x++) {
      for (int y = 0; y < cells[0].length; y++) {
        int index = x + y * cells[0].length;
        out.pixels[index] = cells[x][y] == 1 ? color(50) : color(220);
      }
    }
    out.updatePixels();


    // Show out at position with gridSize
    image(out, showPos.x, showPos.y, showSize.x, showSize.y);
  }


  int countNeighbours(int x, int y) {
    // Init count
    int count = 0;

    // Loop over neighbours
    for (int xOff = -1; xOff < 2; xOff++) {
      for (int yOff = -1; yOff < 2; yOff++) {
        if (!(xOff == 0 && yOff == 0)) {

          // Check neighbour pos is within bounds
          if ((x + xOff) >= 0 && (x + xOff) < gridSize.x
          && (y + yOff) >= 0 && (y + yOff) < gridSize.y) {

            // Found neighbour at new pos
            if (cells[x + xOff][y + yOff] == 1) count++;
          }
        }
      }
    }

    // Return final count
    return count;
  }
}
