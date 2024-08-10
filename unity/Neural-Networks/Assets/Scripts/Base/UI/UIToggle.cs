
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;


public class UIToggle : MonoBehaviour {

  // Declare variables
  public Image img;
  public Color offColor = new Color(1.0f, 1.0f, 1.0f);
  public Color onColor = new Color(0.6f, 0.6f, 0.6f);
  public bool toggled { get; private set; } = false;


  public void click() {
    // Handle toggling
    toggled = !toggled;
    if (toggled) img.color = onColor;
    else img.color = offColor;
  }


  public void setToggle(bool newToggled) {
    // Update toggled
    toggled = newToggled;
    if (toggled) img.color = onColor;
    else img.color = offColor;
  }
}