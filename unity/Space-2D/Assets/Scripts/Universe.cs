using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Universe : MonoBehaviour {

  // #region - Setup

  // Declare and initilize constants
  public const float G = 0.6674f;

  // Declare variables
  static public Universe instance;
  static public List<Attractor> attractors;


  public void Awake() {
    // Initialize variables
    if (instance != null) Destroy(this);
    else instance = this;
    attractors = new List<Attractor>();
  }

  // #endregion
}
