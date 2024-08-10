
using UnityEngine;


public static class Easing {

  static public float easeBounceCubic(float x, float ratio=0.5f) {
    if (x <= ratio) return easeOutCubic(x / ratio);
    else return 1 - easeInCubic((x - ratio) / (1 - ratio));
  }


  static public float easeInCubic(float x) {
    return x * x * x;
  }


  static public float easeOutCubic(float x) {
    return 1 - Mathf.Pow(1.0f - x, 3.0f);
  }


  static public float easeInSine(float x) {
    return 1 - Mathf.Cos((x * Mathf.PI) / 2.0f);
  }
}