
using UnityEngine;


public static class Easing
{
    public static float easeOutCubic(float x) => 1.0f - Mathf.Pow(1.0f - x, 3.0f);

    public static float easeInOutCubic(float x) => x < 0.5 ? 4 * x * x * x : 1 - Mathf.Pow(-2 * x + 2, 3) / 2;
}
