
using System;
using UnityEngine;


[Serializable]
public struct JabKnifeSettings
{
    public bool canAim;
    public float pauseDuration;
    public float windupDuration;
    public float windupDistance;
    public float attackDuration;
    public float attackDistance;
}


public class JabKnife : MonoBehaviour
{
    // Declare references, config, variables
    [Header("References")]
    [SerializeField] private MeshRenderer mr;
    [SerializeField] private AudioSource audioSrc;
    [SerializeField] private AudioClip wooshSfx;
    [SerializeField] private AudioClip sharpenSfx;
    [SerializeField] private AudioClip slashSfx;

    [Header("Config")]
    [SerializeField] private float pauseOpacity;

    private PlayerController pcr;
    private JabKnifeSettings settings;
    private bool isStarted;
    private bool isAttacking;
    private bool hasHit;
    private Vector3 initialPosition;
    private Vector3 attackPosition;
    private float attackTimer;


    public void Initialize(PlayerController pcr_, JabKnifeSettings settings_)
    {
        // Initialize variables
        pcr = pcr_;
        settings = settings_;
        isStarted = false;
        isAttacking = false;
        hasHit = false;
        initialPosition = transform.position;
        attackPosition = initialPosition;
        attackTimer = 0.0f;

        // Initialize game objects
        if (settings.canAim) transform.LookAt(pcr.transform, Vector3.up);
        SetAlphaPct(0.0f);
    }


    private void Update()
    {
        // Handle pause
        if (!isStarted)
        {
            attackTimer += Time.deltaTime;

            // Look towards player and alpha in
            float pausePct = attackTimer / settings.pauseDuration;
            if (pcr != null && settings.canAim) transform.LookAt(pcr.transform, Vector3.up);
            SetAlphaPct(pauseOpacity * Mathf.Min(pausePct / 0.3f, 1.0f));

            // Start windup
            if (attackTimer > settings.pauseDuration)
            {
                attackTimer = 0.0f;
                WarningMaker.instance.CreateWarning(transform.position);
                SetAlphaPct(1.0f);
                audioSrc.PlayOneShot(sharpenSfx);
                isStarted = true;
            }
            return;
        }

        // Handle windup
        else if (!isAttacking)
        {
            attackTimer += Time.deltaTime;
            float windupPct = attackTimer / settings.windupDuration;

            // Look towards player and move backwards
            transform.position = initialPosition - transform.forward * settings.windupDistance * Easing.easeInOutCubic(windupPct);

            // Start attacking
            if (attackTimer >= settings.windupDuration)
            {
                attackTimer = 0.0f;
                attackPosition = transform.position;
                audioSrc.PlayOneShot(wooshSfx);
                isAttacking = true;
            }
            return;
        }

        // Handle attacking
        else
        {
            attackTimer += Time.deltaTime;

            // Move forwards and change opacity
            float attackPct = attackTimer / settings.attackDuration;
            transform.position = attackPosition + transform.forward * settings.attackDistance * Easing.easeOutCubic(attackPct);
            SetAlphaPct(1.0f - attackPct);

            // Finish attacking
            if (attackTimer >= settings.attackDuration) Destroy(gameObject);
        }
    }


    private void SetAlphaPct(float pct)
    {
        // Set all material alphas to pct
        foreach (Material mat in mr.materials)
        {
            mat.color = new Color(mat.color.r, mat.color.g, mat.color.b, pct);
        }
    }


    private void OnTriggerEnter(Collider other)
    {
        if (hasHit || pcr == null) return;
        if (!isStarted || !isAttacking || attackTimer > settings.attackDuration * 0.8f) return;

        // Hit player
        Vector3 dir = other.transform.position - transform.position;
        Vector3 knockback = dir * 230.0f + Vector3.up * 180.0f;
        if (other.gameObject == pcr.gameObject)
        {
            audioSrc.PlayOneShot(slashSfx);
            pcr.GetHit(knockback);
            hasHit = true;
        }
    }
}
