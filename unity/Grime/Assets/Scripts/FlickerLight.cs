
using UnityEngine;


public class FlickerLight : MonoBehaviour
{
    [SerializeField] private Light target;
    [SerializeField] private float[] range = new float[] { 1.0f, 1.4f };
    [SerializeField] private float noiseFreq = 0.1f;


    void Update()
    {
        target.intensity = range[0] + (range[1] - range[0]) * Mathf.PerlinNoise(Time.time * noiseFreq, 0.0f);
    }
}
