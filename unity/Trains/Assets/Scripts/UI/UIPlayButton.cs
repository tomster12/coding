
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;


public class UIPlayButton : MonoBehaviour {

  public void click() {
    // Load into game scene
    SceneManager.LoadScene("GameScene");
  }
}