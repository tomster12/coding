
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class AutoDelete : MonoBehaviour {

  public void Awake() {
    // Delete on startup
    Destroy(gameObject);
  }
}