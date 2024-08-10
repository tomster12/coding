
using UnityEngine;


public class WarningAoE : MonoBehaviour
{
    // Declare config, variables
    [Header("References")]
    [SerializeField] private float heightInitial;
    [SerializeField] private float heightMagnitude;
    [SerializeField] private float heightFrequency;

    private float initialHeight;
    private float time;


    public void Update()
    {
        // Update height
        Vector3 scl = transform.localScale;
        scl.y = heightInitial + heightMagnitude * Mathf.Sin(time * heightFrequency);
        transform.localScale = scl;
        time += Time.deltaTime;
    }
}
