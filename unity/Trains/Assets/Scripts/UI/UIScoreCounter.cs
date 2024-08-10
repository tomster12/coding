
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;


public class UIScoreCounter : MonoBehaviour {

  // Declare variables
  public Controller controller;
  private Text counterText;
  private int currentScore = 0;


  public void Awake() {
    // Get variables
    counterText = transform.GetChild(0).GetComponent<Text>();
  }


  public void Update() {
    // Play vfx if needed
    if (currentScore != controller.score) popVFX();

    // Update text
    currentScore = controller.score;
    counterText.text = "" + (currentScore % 1000).ToString("d4");
  }


  private void resetVFX() {
    // Stop any vfx coroutines and reset colour
    if (currentVFX != null) StopCoroutine(currentVFX);
    counterText.color = new Color(0.2f, 0.2f, 0.2f);
  }


  private Vector3 currentScaleBefore;
  private Coroutine currentVFX;

  private void popVFX(float duration=0.15f, float strength=0.08f) {
    // Ensure no other VFX playing then play
    if (currentVFX != null) {
      StopCoroutine(currentVFX);
      counterText.transform.localScale = currentScaleBefore;
    }
    currentVFX = StartCoroutine(IEPopVFX(duration, strength));
  }

  private IEnumerator IEPopVFX(float duration, float strength) {
    // Grow counter
    currentScaleBefore = counterText.transform.localScale;
    float t = 0;
    while (t < 1.0f) {
      float scale = 1 + Easing.easeBounceCubic(t, 0.3f) * strength;
      counterText.transform.localScale = currentScaleBefore * scale;
      t += Time.deltaTime * 1.0f / duration;
      yield return null;
    }

    // Ensure scale afterwards
    counterText.transform.localScale = currentScaleBefore;
  }
}