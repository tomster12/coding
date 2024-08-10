
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;


public class UICountdown : MonoBehaviour {

  // Declare variables
  public Text countdownText;


  public void Awake() {
    // Get variables
    countdownText = GetComponent<Text>();
  }


  public void startCountdown(int duration, bool showGo, Action callback) {
    // Call coroutine
    StartCoroutine(IEStartCountdown(duration, showGo, callback));
  }


  private IEnumerator IEStartCountdown(int duration, bool showGo, Action callback) {
    // Activate text
    countdownText.enabled = true;

    // Countdown the timer
    for (int i = duration; i > 0; i--) {
      countdownText.text = "" + i;
      yield return new WaitForSeconds(1.0f);
    }

    // Show go screen
    if (showGo) {
      countdownText.text = "Go!";
      yield return new WaitForSeconds(0.75f);
    }

    // Deactivate and call the callback
    countdownText.enabled = false;
    callback();
  }
}