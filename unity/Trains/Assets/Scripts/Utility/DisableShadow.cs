
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Experimental.Rendering.Universal;


public class DisableShadow : MonoBehaviour {

  // Declare reference
  ShadowCaster2D shadow;


  public void Awake() {
    // Get reference
    shadow = GetComponent<ShadowCaster2D>();
  }


  public void Update() {
    // Find difference to camera
    Camera cam = Camera.main;
    Vector3 diff = cam.transform.position - transform.position;
    float camY = cam.orthographicSize;

    // Enable / disable
    if (Mathf.Abs(diff.y) > (camY * 1.2f)) {
      shadow.enabled = false;
    } else shadow.enabled = true;
  }
}