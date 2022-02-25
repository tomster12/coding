

class InputManager {
  // #region - Setup

  Player player;
  HashMap<Integer,Boolean> keys;


  InputManager(Player player_) {
    player = player_;
    keys = new HashMap<Integer,Boolean>();
  }

  // #endregion


  // #region - Main Functions

  void input(String inType, int kCode) {
    if (player.alive) {
      if (inType == "press") {
        if (kCode == 32) {
          player.roll();
        }

      } else if (inType == "release") {
        if (kCode == 68) {
          player.shoot();
        }
      }

      if (inType == "press" || inType == "release") {
        keys.put(kCode, inType=="press");
      }
    }
  }


  PVector getMovementDir() {
    float pX = (getKey(37)?-1:0) + (getKey(39)?1:0);
    float pY = (getKey(38)?-1:0) + (getKey(40)?1:0);
    return new PVector(pX, pY);
  }


  boolean getMoving() {
    return (getKey(37)^getKey(39)) || (getKey(38)^getKey(40));
  }


  boolean getKey(int kCode) {
    if (!keys.containsKey(kCode)) {
      return false;
    } else {
      return keys.get(kCode);
    }
  }

  // #endregion
}


// #region - Keys

// 37-40 - Arrows
// 16 - Shift
// 68 - D
// 32 - Space

// #endregion
