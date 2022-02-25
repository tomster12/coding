

class person {


  PVector pos;
  float size;
  boolean selected;

  int age;
  String name;
  int gender;
  int[] col;

  float wage;
  float mood;
  float satisfaction;
  float workRate;
  illness ill;

  int workThreshold;
  int workDone;

  int[][] workHours = new int[5][];
  ArrayList<relation> relations;
  ArrayList<String> workConditions;
  ArrayList<String> events;



  //-------------------------------------------------------------------------------


  person() {
    pos = new PVector(0, 0);
    size = 35;
    selected = false;

    randomiseValues();
  }


  //----------------------------------------


  void randomiseValues() {
    age = floor(random(18, 40));
    gender = floor(random(2));
    name = names[0][gender][floor(random(0, names[0][gender].length))] + " " + names[1][0][floor(random(0, names[1][0].length))];
    col = new int[] {floor(random(120, 255)), floor(random(120, 255)), floor(random(120, 255))};

    wage = random(7, 20);
    mood = 0;
    satisfaction = 0;
    workRate = random(0.8, 1.2);
    ill = new illness(0);

    workThreshold = floor(random(24, 40));
    workDone = 0;

    for (int i = 0; i < workHours.length; i++) {
      if (random(1) < 0.1) {
        workHours[i] = new int[] {0, 0};
      } else {
        workHours[i] = new int[2];
        workHours[i][0] = floor(random(7, 12));
        workHours[i][1] = floor(random(12, 20));
      }
    }

    relations = new ArrayList<relation>();
    workConditions = new ArrayList<String>();

    ArrayList<String> takenConditions = new ArrayList<String>();
    for (int i = 0; i < floor(random(1, 5)); i++) {
      String[] possibleCondition = new String[2];
      boolean allowed = false;
      while (!allowed) {
        possibleCondition = gPossibleConditions[floor(random(gPossibleConditions.length))]; // Pick random pair of conditions
        allowed = true;
        for (int o = 0; o < takenConditions.size(); o++) { // Make sure pair hasnt been chosen before
          if (takenConditions.get(o) == possibleCondition[0]) {
            allowed = false;
          }
        }
      }
      takenConditions.add(possibleCondition[0]); // Remember this condition
      workConditions.add(possibleCondition[floor(random(2))]); // Add it
    }
    events = new ArrayList<String>();
  }


  //-------------------------------------------------------------------------------


  void update() {
    if (hoverOver() && mouseIsPressed) {
      gameSelectPerson(this);
      mdMng.getSound("select").play();
      mouseIsPressed = false;
    }
    
    if (events.size() > 20) {
      events.remove(0); 
    }
  }


  //-------------------------------------------------------------------------------


  void show() {
    float mult = 1;
    if (hoverOver()) {
      mult = 1.2;
    }

    if (selected) {
      stroke(25);
    } else {
      noStroke();
    }
    fill(col[0], col[1], col[2]);
    ellipse(pos.x, pos.y, size * mult, size * mult);
  }


  //-------------------------------------------------------------------------------


  boolean hoverOver() {
    if (gotoScreen.x == 2&& gotoScreen.y == 0) {
      if (dist(trueMouse.x, trueMouse.y, pos.x, pos.y) < size / 2) {
        return true;
      }
    }
    return false;
  }
}


//-------------------------------------------------------------------------------



class illness {


  String name;
  int time;

  int templateMinTime;
  int templateMaxTime;


  illness(int type) {
    if (type == 0) {
      illness ill = gPossibleIllness[floor(random(0, gPossibleIllness.length))];
      time = floor(random(ill.templateMinTime, ill.templateMaxTime));
      name = ill.name;
    } else {
      illness ill = gPossibleIllness[floor(random(0, gPossibleIllness.length))];
      time = floor(random(ill.templateMinTime * 1.5, ill.templateMaxTime * 1.5));
      name = ill.name;
    }
  }


  illness(String name_, int minTime_, int maxTime_) {
    name = name_;
    templateMinTime = minTime_;
    templateMaxTime = maxTime_;
  }
}


//-------------------------------------------------------------------------------


class relation {
  
  
  person p1;
  person p2;
  float strength;
  
  
  relation(person p1_, person p2_, float strength_) {
    p1 = p1_;
    p2 = p2_;
    strength = strength_;
  }
}


//-------------------------------------------------------------------------------
