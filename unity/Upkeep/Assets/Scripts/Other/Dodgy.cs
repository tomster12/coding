
using UnityEngine;


public class Dodgy : MonoBehaviour
{
    // Declare config, variables
    [Header("Config")]
    [SerializeField] private float frequency = 1.0f;
    [SerializeField] private float magnitude = 4.0f;
    [SerializeField] private Vector3 dir = Vector3.right;

    private Vector3 startPos;


    private void Start() => startPos = transform.position;
    private void Update() => transform.position = startPos + dir * Mathf.Sin(Time.time * frequency) * magnitude;
}
