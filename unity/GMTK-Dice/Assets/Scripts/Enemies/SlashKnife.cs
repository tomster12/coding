
using System;
using UnityEngine;


[Serializable]
public struct SlashKnifeSettings
{
    public float pauseDuration;
    public float attackDuration;
    public float stayDuration;
    public float hitSize;
}


public class SlashKnife : MonoBehaviour
{
    // Declare references, config, variables
    [Header("References")]
    [SerializeField] private MeshRenderer mr;
    [SerializeField] private AudioSource audioSrc;
    [SerializeField] private AudioClip sharpenSfx;
    [SerializeField] private AudioClip hitSfx;
    [SerializeField] private AudioClip slashSfx;

    [Header("Prefabs")]
    [SerializeField] private GameObject oneShotPfb;

    [Header("Config")]
    [SerializeField] private AnimationCurve pauseCurve;
    [SerializeField] private AnimationCurve attackCurve;

    private PlayerController pcr;
    private SlashKnifeSettings settings;
    private bool isAttacking;
    private bool hasAttacked;
    private float attackTimer;
    private GameObject warningLine;


    public void Initialize(PlayerController pcr_, SlashKnifeSettings settings_)
    {
        // Initialize variables
        pcr = pcr_;
        settings = settings_;
        isAttacking = false;

        // Create warnings
        warningLine = WarningMaker.instance.CreateWarningLine(transform.position.z, settings.hitSize);
    }


    private void Update()
    {
        // Handle pause
        if (!isAttacking)
        {
            attackTimer += Time.deltaTime;
            float pct = attackTimer / settings.pauseDuration;
            transform.eulerAngles = new Vector3(0.0f, 0.0f, 80.0f + pauseCurve.Evaluate(pct) * 90.0f);

            // Start attacking
            if (attackTimer > settings.pauseDuration)
            {
                attackTimer = 0.0f;
                audioSrc.PlayOneShot(sharpenSfx);
                isAttacking = true;
            }
        }

        // Handle attacking
        else if (!hasAttacked)
        {
            attackTimer += Time.deltaTime;
            float pct = attackTimer / settings.attackDuration;
            transform.eulerAngles = new Vector3(0.0f, 0.0f, 80.0f + attackCurve.Evaluate(pct) * -85.0f);

            // Has attacked
            if (attackTimer > settings.attackDuration)
            {
                HitGround();
                attackTimer = 0.0f;
                hasAttacked = true;
            }
        }

        // Handle has attacked
        else
        {
            attackTimer += Time.deltaTime;
            float pct = attackTimer / settings.stayDuration;
            SetAlphaPct(1.0f - pct);

            // Destroy knife
            if (attackTimer > settings.stayDuration)
            {
                Destroy(warningLine);
                Destroy(gameObject);
            }
        }
    }


    private void HitGround()
    {
        // Play hit sound and check for player
        Instantiate(oneShotPfb).GetComponent<OneShot>().Play(hitSfx);
        float diff = Mathf.Abs(pcr.transform.position.z - transform.position.z);
        Vector3 dir = pcr.transform.position - transform.position;
        dir.x = 0.0f;
        dir.y = 0.0f;
        Vector3 knockback = dir * 230.0f + Vector3.up * 180.0f;
        if (diff < settings.hitSize) pcr.GetHit(knockback);
    }


    private void SetAlphaPct(float pct)
    {
        // Set all material alphas to pct
        foreach (Material mat in mr.materials)
        {
            mat.color = new Color(mat.color.r, mat.color.g, mat.color.b, pct);
        }
    }
}
