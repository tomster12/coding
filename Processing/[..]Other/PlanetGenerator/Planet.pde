

class Planet {
 
  
  PVector pos;
  float size;
  PVector mapSize;
  PVector circleSize;
  
  int map[][];
  PVector[][] circlePositions;
  
  
  Planet(PVector pos_, float size_, PVector mapSize_) {
    pos = pos_;
    size = size_;
    mapSize = mapSize_;
    circleSize = mapSize.copy().mult(0.5);
    generateNewMap();
  }
  
  
  void generateNewMap() {
    map = generateMap(mapSize, 0.3, 3);
    circlePositions = getCirclePositions(size, circleSize);
  }
  
  
  void show() {
    drawMap(map, circlePositions, pos, new float[] {circleSize.x, frameCount, circleSize.y, 0});
  }
}
