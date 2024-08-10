
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;


public class UIMenuButton : MonoBehaviour {

  public void click() {
    // Load into menu scene
    SceneManager.LoadScene("MenuScene");
  }
}