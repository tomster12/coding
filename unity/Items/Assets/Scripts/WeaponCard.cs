
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;


public class WeaponCard : MonoBehaviour {

  // #region - Setup

  // Declare variables
  public WeaponData data;

  public GameObject glow;
  public GameObject shadow;
  public Text rarityText;
  public Image weaponImage;
  public Text DPSText;
  public Text rateText;
  public Text bluntText;
  public Text slashText;

  private bool hovered;
  private float hoverStart;
  private bool dragging;
  private Vector3 dragOffset;


  public void Start() {
    initFront();
  }


  private void initFront() {
    // Initialize the UI of the card
    rarityText.text = data.rarity.ToString();
    weaponImage.sprite = data.image;
    DPSText.text = data.calculateDPS().ToString() + " dps";
    rateText.text = data.rate.ToString() + "/s";
    bluntText.text = data.blunt.ToString();
    slashText.text = data.slash.ToString();
  }

  // #endregion


  // #region - Main

  public void Update() {
    // Set target transform
    Vector3 targetScl = Vector3.one;
    Quaternion targetRot = Quaternion.identity;

    // Grow if hovered
    if (hovered) {
      float circleTime = (Time.time - hoverStart) * Mathf.PI * 2.0f;
      targetScl = Vector3.one * (1.05f + Mathf.Sin(circleTime / 1.5f) * 0.01f);
      targetRot = Quaternion.AngleAxis(Mathf.Sin(circleTime / 2.0f) * -1.8f, Vector3.forward);
    }

    // Lerp towards target
    transform.localScale = Vector3.Lerp(transform.localScale, targetScl, 0.05f);
    transform.localRotation = Quaternion.Lerp(transform.localRotation, targetRot, 0.05f);

    // Handle dragging
    if (dragging) {
      Vector3 worldPosition = Camera.main.ScreenToWorldPoint(Input.mousePosition);
      transform.position = worldPosition - dragOffset;
    }
  }


  public void OnMouseDown() {
    // Move above other weapon cards
    WeaponCard[] weaponCards = (WeaponCard[])FindObjectsOfType(typeof(WeaponCard));
    float top = transform.position.z;
    foreach (WeaponCard card in weaponCards) {
      if (card != this) top = Mathf.Min(top, card.transform.position.z - 1);
    } transform.position = new Vector3(transform.position.x, transform.position.y, top);

    // Drag on left mouse button
    dragging = true;
    Vector3 worldPosition = Camera.main.ScreenToWorldPoint(Input.mousePosition);
    dragOffset = worldPosition - transform.position;
    Debug.Log(dragOffset);
  }


  public void OnMouseUp() {
    // Undrag on release
    dragging = false;
  }


  public void OnMouseOver() {
    if (!hovered) {

      // Toggle glow / shadow
      glow.SetActive(true);
      shadow.SetActive(false);

      // Update variables
      hovered = true;
      hoverStart = Time.time;
    }
  }


  public void OnMouseExit() {
    if (hovered) {

      // Toggle glow / shadow
      glow.SetActive(false);
      shadow.SetActive(true);

      // Update variables
      hovered = false;
    }
  }

  // #endregion
}
