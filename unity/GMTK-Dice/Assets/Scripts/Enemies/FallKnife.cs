
using System;
using UnityEngine;


[Serializable]
public struct FallKnifeSettings
{
    public float height;
    public float fallAcceleration;
    public float fallRadius;
}


public class FallKnife : MonoBehaviour
{
    // Declare references, config, variables
    [Header("References")]
    [SerializeField] private AudioSource audioSrc;
    [SerializeField] private AudioClip beepSfx;
    [SerializeField] private AudioClip hitSfx;
    [SerializeField] private AudioClip slashSfx;

    [Header("Prefabs")]
    [SerializeField] private GameObject oneShotPfb;
    [SerializeField] private GameObject crashParticlesPfb;

    private PlayerController pcr;
    private FallKnifeSettings settings;
    private Vector3 groundPosition;
    private GameObject warningAoE;
    private bool hasHit;
    private float speed;


    public void Initialize(PlayerController pcr_, FallKnifeSettings settings_)
    {
        // Initialize variables
        pcr = pcr_;
        settings = settings_;
        groundPosition = transform.position;
        transform.position = transform.position + Vector3.up * settings.height;
        warningAoE = WarningMaker.instance.CreateWarningAoE(groundPosition, settings.fallRadius);
        audioSrc.PlayOneShot(beepSfx);
    }


    private void Update()
    {
        // Accelerate downwards
        speed += settings.fallAcceleration * Time.deltaTime;
        transform.position += Vector3.up * -speed;
    }


    private void OnTriggerEnter(Collider other)
    {
        // Detect hitting ground
        if (other.gameObject.tag == "Ground") HitGround();
    }


    private void HitGround()
    {
        if (hasHit) return;
        hasHit = true;

        // Detect player in the area and hit if near
        Vector3 dir = pcr.transform.position - transform.position;
        float dist = dir.magnitude;
        if (dist < settings.fallRadius)
        {
            pcr.GetHit(dir * 120.0f + Vector3.up * 80.0f);
            Instantiate(oneShotPfb).GetComponent<OneShot>().Play(slashSfx);
        }

        // Update game objects
        Instantiate(crashParticlesPfb, groundPosition, Quaternion.identity);
        Instantiate(oneShotPfb).GetComponent<OneShot>().Play(hitSfx);
        Destroy(warningAoE);
        Destroy(gameObject);
    }
}
