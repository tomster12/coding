
using UnityEngine;


public class WibblyText : MonoBehaviour
{
    // Declare config, variables
    [Header("Config")]
    [SerializeField] private float rotMagnitude;
    [SerializeField] private float rotFrequency;
    [SerializeField] private float sizeMagnitude;
    [SerializeField] private float sizeFrequency;

    private Vector3 initialSize;
    private float time;


    private void Awake()
    {
        // Initialize variables
        initialSize = transform.localScale;
    }


    private void Update()
    {
        // Rotate and scale
        time += Time.deltaTime;
        transform.localScale = initialSize + Vector3.one * sizeMagnitude * (-0.5f + Mathf.Sin(time * sizeFrequency));
        Vector3 angles = transform.eulerAngles;
        angles.z = rotMagnitude * (-0.5f + Mathf.Sin(time * rotFrequency));
        transform.eulerAngles = angles;
    }
}
