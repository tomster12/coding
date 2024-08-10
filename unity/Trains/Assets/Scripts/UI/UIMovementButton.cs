
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;


public class UIMovementButton : MonoBehaviour {

  // Declare variables
  public Controller controller;
  public Rail rail;
  public int dir;
  public Image backgroundImage;
  public Image verticalTrackImage;
  public Image cornerTrackImage;
  public Image stopImage;


  public void Update() {
    // get type based on direction
    TrackType type = rail.checkTrackType(dir);

    // Update track based on type
    int rotates = 0;
    if (type == TrackType.HORZ) rotates = 1;
    else if (type == TrackType.TL) rotates = 3;
    else if (type == TrackType.TR) rotates = 2;
    else if (type == TrackType.BR) rotates = 1;

    if (type == TrackType.BLOCKED) {
      verticalTrackImage.gameObject.SetActive(false);
      cornerTrackImage.gameObject.SetActive(false);
      stopImage.gameObject.SetActive(true);

    } else if (type == TrackType.VERT || type == TrackType.HORZ) {
      verticalTrackImage.gameObject.SetActive(true);
      cornerTrackImage.gameObject.SetActive(false);
      stopImage.gameObject.SetActive(false);
      verticalTrackImage.gameObject.transform.rotation = Quaternion.Euler(0, 0, rotates * 90);
      cornerTrackImage.gameObject.transform.rotation = Quaternion.Euler(0, 0, rotates * 90);

    } else {
      verticalTrackImage.gameObject.SetActive(false);
      cornerTrackImage.gameObject.SetActive(true);
      stopImage.gameObject.SetActive(false);
      verticalTrackImage.gameObject.transform.rotation = Quaternion.Euler(0, 0, rotates * 90);
      cornerTrackImage.gameObject.transform.rotation = Quaternion.Euler(0, 0, rotates * 90);
    }

    // Update opacity if ran out of tracks
    if (controller.rail.availableTracks == 0) {
      backgroundImage.color = new Color(0.7f, 0.7f, 0.7f, 0.45f);
      verticalTrackImage.color = new Color(0.7f, 0.7f, 0.7f, 0.45f);
      cornerTrackImage.color = new Color(0.7f, 0.7f, 0.7f, 0.45f);

    } else {
      backgroundImage.color = new Color(1.0f, 1.0f, 1.0f, 0.7f);
      verticalTrackImage.color = new Color(1.0f, 1.0f, 1.0f, 0.7f);
      cornerTrackImage.color = new Color(1.0f, 1.0f, 1.0f, 0.7f);
    }
  }


  public void click() {
    if (controller.gamePlaying) {

      // Progress rail in direction
      TrackType type = controller.progressRail(dir);
      if (type != TrackType.NOTRACKS) clickVFX();
    }
  }


  // #region - VFX

  private Vector3 currentScaleBefore;
  private Coroutine currentClickVFX;
  private void clickVFX(float duration=0.15f, float strength=0.15f) {
    // Stop current click vfx
    if (currentClickVFX != null) {
      StopCoroutine(currentClickVFX);
      transform.localScale = currentScaleBefore;
    }

    // Start new vfx
    currentScaleBefore = transform.localScale;
    currentClickVFX = StartCoroutine(IEClickVFX(duration, strength));
  }

  private IEnumerator IEClickVFX(float duration, float strength) {
    // Grow button
    float t = 0;
    while (t < 1.0f) {
      float scale = Easing.easeBounceCubic(t, 0.3f) * strength + (1 - strength);
      transform.localScale = currentScaleBefore * scale;
      t += Time.deltaTime * 1.0f / duration;
      yield return null;
    }

    // Ensure scale afterwards
    transform.localScale = currentScaleBefore;
  }

  // #endregion
}