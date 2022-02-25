

abstract class textObject {
  
  
  String text;
  PVector pos;
  float size;
  
  int[] col;
  
 
//-------------------------------------------------------------------------------


  textObject(String text_, PVector pos_, float size_) {
    text = text_;
    pos = pos_;
    size = size_;
    
    col = new int[] {80, 80, 80};
  }
  

//-------------------------------------------------------------------------------


  void show() {
    fill(col[0], col[1], col[2]);
    noStroke();
    textSize(size);
    textAlign(CENTER);
    text(text, pos.x, pos.y);
  }
  

//-------------------------------------------------------------------------------

  
  abstract public void update();
}


//-------------------------------------------------------------------------------
