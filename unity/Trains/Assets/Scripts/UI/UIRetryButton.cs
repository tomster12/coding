
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;


public class UIRetryButton : MonoBehaviour {

  public void click() {
    // Reload game scene
    SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
  }
}
