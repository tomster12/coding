
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;


public class UITrackCounter : MonoBehaviour {

  // Declare variables
  public Rail rail;
  private Text counterText;
  private int currentTracks = 0;


  public void Awake() {
    // Get variables
    counterText = transform.GetChild(0).GetComponent<Text>();
  }


  public void Update() {
    // Play vfx if needed
    if (rail.availableTracks == 0) {
      if (currentTracks > 0) playWarningVFX(new Color(0.82f, 0.24f, 0.24f));

    } else if (rail.availableTracks <= 5) {
      if (currentTracks > 5 || currentTracks == 0) playWarningVFX(new Color(0.91f, 0.48f, 0.25f));

    } else if (currentTracks <= 5) resetVFX();

    // Update text
    currentTracks = rail.availableTracks;
    counterText.text = "" + (currentTracks % 100).ToString("d3");;
  }


  private void resetVFX() {
    // Stop any vfx coroutines and reset colour
    if (currentVFX != null) StopCoroutine(currentVFX);
    counterText.color = new Color(0.2f, 0.2f, 0.2f);
  }


  private Vector3 currentScaleBefore;
  private Coroutine currentVFX;

  private void playWarningVFX(Color col, float duration=0.15f, float strength=0.2f) {
    // Ensure no other VFX playing then play
    if (currentVFX != null) {
      StopCoroutine(currentVFX);
      counterText.transform.localScale = currentScaleBefore;
    }
    currentVFX = StartCoroutine(IEPlayWarningVFX(col, duration, strength));
  }

  private IEnumerator IEPlayWarningVFX(Color col, float duration, float strength) {
    // Change colour
    counterText.color = col;

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