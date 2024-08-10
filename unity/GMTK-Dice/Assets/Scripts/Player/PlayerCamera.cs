
using UnityEngine;


public class PlayerCamera : MonoBehaviour
{
    // Declare variables
    [Header("References")]
    [SerializeField] private Transform centre;
    [SerializeField] private PlayerController pcr;

    [Header("Config")]
    [SerializeField] private float followSpeed;


    private void Start()
    {
        if (pcr == null) return;

        // Initialize position to player and rotate towards
        centre.position = pcr.transform.position;
        transform.LookAt(pcr.transform.position);
    }


    private void Update()
    {
        if (pcr == null) return;

        // Lerp position to player and rotate towards
        centre.position = Vector3.Lerp(centre.position, pcr.transform.position, Time.deltaTime * followSpeed);
        transform.LookAt(pcr.transform.position);
    }
}
