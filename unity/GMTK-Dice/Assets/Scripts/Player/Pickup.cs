
using UnityEngine;

public class Pickup : MonoBehaviour
{
    // Declare variables
    [Header("References")]
    [SerializeField] private AudioSource audioSrc;
    [SerializeField] private AudioClip pickupSfx;
    [SerializeField] private AudioClip spawnSfx;

    [Header("Prefabs")]
    [SerializeField] private GameObject pickupParticlesPfb;
    [SerializeField] private GameObject oneShotPfb;

    [Header("Config")]
    [SerializeField] private string powerupName;
    [SerializeField] private float heightSinBase;
    [SerializeField] private float heightSinFrequency;
    [SerializeField] private float heightSinMagnitude;
    [SerializeField] private float rotationSpeed;

    private float time;
    private bool hasHit = false;


    private void Awake()
    {
        // Play spawn sound
        audioSrc.PlayOneShot(spawnSfx);
    }


    private void Update()
    {
        // Update time
        time += Time.deltaTime;

        // Update height and rotation
        float height = heightSinBase + heightSinMagnitude * Mathf.Sin(time * heightSinFrequency);
        transform.position = new Vector3(transform.position.x, height, transform.position.z);
        transform.Rotate(Vector3.up, Time.deltaTime * rotationSpeed);
    }


    private void OnTriggerEnter(Collider other)
    {
        if (hasHit) return;

        // Detect when collcted
        PlayerController pcr = other.gameObject.GetComponent<PlayerController>();
        if (pcr != null)
        {
            hasHit = true;
            pcr.GetPickup(powerupName);
            Instantiate(oneShotPfb).GetComponent<OneShot>().Play(pickupSfx);
            Instantiate(pickupParticlesPfb, transform.position, Quaternion.identity);
            Destroy(gameObject);
        }
    }
}
