

class time {

  
  int startFrame;
  int week;
  int day;
  int hour;


//-------------------------------------------------------------------------------


  time() {
    startFrame = frameCount + 600;
    update();
  }
  

//-------------------------------------------------------------------------------

  
  void update() {
    float framesElapsed = frameCount - startFrame;
    hour = floor(framesElapsed / framesPerHour);
    day = floor(hour / 24);
    week = floor(day / 7);

    if (hour == ((float)framesElapsed / framesPerHour)) {
      hourTick(week, day, hour);
    }
  }
}


//-------------------------------------------------------------------------------
