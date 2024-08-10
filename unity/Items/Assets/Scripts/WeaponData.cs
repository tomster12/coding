
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;


[CreateAssetMenu(fileName = "New Weapon Data", menuName = "Weapon Data")]
public class WeaponData : ScriptableObject {

  public string rarity;
  public Sprite image;
  public float rate;
  public float blunt;
  public float slash;


  public float calculateDPS() {
    // Calculate the DPS of the weapon
    return (blunt + slash) * rate;
  }
}
