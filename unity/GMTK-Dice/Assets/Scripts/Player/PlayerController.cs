
using UnityEngine;
using UnityEngine.UI;


public class PlayerController : MonoBehaviour
{
    // Declare references, prefabs, config, variables
    [Header("References")]
    [SerializeField] private GameManager gm;
    [SerializeField] private MeshFilter mf;
    [SerializeField] private Rigidbody rb;
    [SerializeField] private HealthIndicator health;
    [SerializeField] RectTransform dashIndicatorMask;
    [SerializeField] Image dashIndicatorFill;
    [SerializeField] private AudioSource rollSrc;
    [SerializeField] private AudioSource audioSrc;
    [SerializeField] private AudioClip wooshSfx;
    [SerializeField] private AudioClip dieSfx;
    [SerializeField] private AudioClip powerupLeaveSfx;
    [SerializeField] private GameObject shieldShell;
    [SerializeField] private GameObject speedupShell;

    [Header("Prefabs")]
    [SerializeField] private GameObject brokenPfb;
    [SerializeField] private GameObject sliceParticlesPfb;
    [SerializeField] private GameObject dashParticlesPfb;
    [SerializeField] private GameObject oneShotPfb;
    [SerializeField] private Mesh[] meshStages;

    [Header("Config")]
    [SerializeField] private float speedupDuration;
    [SerializeField] private float speedupAmount;
    [SerializeField] private Vector3 startPos;
    [SerializeField] private float movementForce;
    [SerializeField] private float dashCooldown;
    [SerializeField] private float dashForce;
    [SerializeField] private Color dashReadyColor;
    [SerializeField] private Color dashCooldownColor;

    private bool isReset = false;
    private bool isPlaying = false;
    private bool hasShield = false;
    private Vector3 inputDir;
    private int hits;
    private float dashTimer;
    private float speedupTimer;
    private GameObject brokenObject;


    public void StartGame()
    {
        if (!isReset) ResetGame();
        rb.isKinematic = false;
        isPlaying = true;
        isReset = false;
    }

    public void StopGame()
    {
        isPlaying = false;
    }

    public void ResetGame()
    {
        if (brokenObject != null) Destroy(brokenObject);
        transform.position = startPos;
        shieldShell.SetActive(false);
        speedupShell.SetActive(false);
        speedupTimer = 0.0f;
        mf.mesh = meshStages[0];
        health.ResetCount();
        hits = 0;
        dashTimer = 0.0f;
        dashIndicatorMask.sizeDelta = new Vector2(dashIndicatorMask.sizeDelta.x, 30.0f * (1.0f - dashTimer / dashCooldown));
        if (dashTimer == 0.0f) dashIndicatorFill.color = dashReadyColor;
        else dashIndicatorFill.color = dashCooldownColor;
        gameObject.SetActive(true);
        hasShield = false;
        rb.isKinematic = true;
        isReset = true;
        isPlaying = false;
    }


    private void Update()
    {
        if (!isPlaying) return;

        // Detect player input
        inputDir = Vector2.zero;
        inputDir += Vector3.right * Input.GetAxisRaw("Horizontal");
        inputDir += Vector3.forward * Input.GetAxisRaw("Vertical");

        // Update dash visuals
        dashIndicatorMask.sizeDelta = new Vector2(dashIndicatorMask.sizeDelta.x, 30.0f * (1.0f - dashTimer / dashCooldown));
        if (dashTimer == 0.0f) dashIndicatorFill.color = dashReadyColor;
        else dashIndicatorFill.color = dashCooldownColor;

        // Update rolling sfx volume
        rollSrc.volume = 0.5f * Mathf.Min(rb.velocity.magnitude / 10.0f, 1.0f);

        // Detect dash so add force and create particles
        dashTimer = Mathf.Max(0.0f, dashTimer - Time.deltaTime);
        if (Input.GetKeyDown("space") && dashTimer == 0.0f)
        {
            dashTimer = dashCooldown;
            Vector3 dir = inputDir == Vector3.zero ? rb.velocity.normalized : inputDir;
            rb.AddForce(dir * dashForce);
            GameObject dashParticles = Instantiate(dashParticlesPfb, transform.position, Quaternion.identity);
            Vector3 euler = new Vector3(0.0f, Quaternion.LookRotation(-inputDir, Vector3.up).eulerAngles.y, 0.0f);
            dashParticles.transform.eulerAngles = euler;
            audioSrc.PlayOneShot(wooshSfx);
        }
    }


    private void FixedUpdate()
    {
        if (!isPlaying) return;

        // Update player position
        speedupTimer = Mathf.Max(0.0f, speedupTimer - Time.deltaTime);
        float force = movementForce;
        if (speedupTimer > 0.0f) force *= speedupAmount;
        else if (speedupShell.activeSelf)
        {
            speedupShell.SetActive(false);
            audioSrc.PlayOneShot(powerupLeaveSfx);
        }
        rb.AddForce(inputDir * force * Time.fixedDeltaTime);
    }


    public void GetPickup(string type)
    {
        // Acquire shild pickup
        if (type == "shield")
        {
            hasShield = true;
            shieldShell.SetActive(true);
            gm.AddScore(3);
        }

        // Acquire speedup pickup
        if (type == "speedup")
        {
            speedupTimer = speedupDuration;
            speedupShell.SetActive(true);
            gm.AddScore(3);
        }
    }

    public void GetHit(Vector3 knockback)
    {
        if (!isPlaying) return;

        // Blocked by the shield
        if (hasShield)
        {
            hasShield = false;
            shieldShell.SetActive(false);
            audioSrc.PlayOneShot(powerupLeaveSfx);
            return;
        }

        // Gets hit by knife so update health and create particles
        hits++;
        health.Increment();
        GameObject sliceParticles = Instantiate(sliceParticlesPfb, transform.position, Quaternion.identity);
        Vector3 euler = new Vector3(-45.0f, Quaternion.LookRotation(knockback, Vector3.up).eulerAngles.y, 0.0f);
        sliceParticles.transform.eulerAngles = euler;
        rb.AddForce(knockback);

        // Update mesh with new mesh on hit
        if (hits < 3) mf.mesh = meshStages[hits];

        // Lost the game
        else
        {
            // Update other scripts and play suond
            gm.LoseGame();
            BreakApart(knockback);
        }
    }

    private void BreakApart(Vector3 knockback)
    {
        // Play sound
        Instantiate(oneShotPfb).GetComponent<OneShot>().Play(dieSfx);

        // Replace with broken onion and apply force
        brokenObject = Instantiate(brokenPfb, transform.position, Quaternion.identity);
        foreach (Rigidbody rb in brokenObject.GetComponentsInChildren<Rigidbody>())
        {
            Vector3 force = knockback * 0.1f;
            force += Random.insideUnitSphere * 100.0f;
            rb.AddForce(force);
        }

        // Deactivate
        gameObject.SetActive(false);
    }
}
