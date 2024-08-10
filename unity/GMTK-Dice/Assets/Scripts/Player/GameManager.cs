
using UnityEngine;
using UnityEngine.UI;
using TMPro;


public class GameManager : MonoBehaviour
{
    // Declare references
    [Header("References")]
    [SerializeField] private EnemyManager enemymgr;
    [SerializeField] private PlayerController pcr;
    [SerializeField] private PickupSystem pcksys;
    [SerializeField] private TextMeshProUGUI introText;
    [SerializeField] private TextMeshProUGUI scoreText;
    [SerializeField] private GameObject lostText;

    private bool isReset = false;
    private bool isPlaying = false;
    private float introTimer;
    private float score = 0.0f;


    private void Start() => ResetGame();


    public void StartGame()
    {
        if (!isReset) ResetGame();
        enemymgr.StartGame();
        pcr.StartGame();
        pcksys.StartGame();
        introText.gameObject.SetActive(false);
        isReset = false;
        isPlaying = true;
    }

    public void StopGame()
    {
        enemymgr.StopGame();
        pcr.StopGame();
        pcksys.StopGame();
        isPlaying = false;
    }

    public void ResetGame()
    {
        enemymgr.ResetGame();
        pcr.ResetGame();
        pcksys.ResetGame();
        introText.gameObject.SetActive(true);
        lostText.gameObject.SetActive(false);
        introTimer = 3.0f;
        score = 0.0f;
        scoreText.text = "Score: 0";
        isReset = true;
    }

    public void LoseGame()
    {
        // Player has died
        StopGame();
        lostText.gameObject.SetActive(true);
    }


    private void Update()
    {
        // Check for intro timer
        if (isReset && !isPlaying)
        {
            introTimer -= Time.deltaTime;
            if (introTimer <= 0.0f) StartGame();
            else introText.text = "" + Mathf.Ceil(introTimer);
        }

        // Check for reset game
        else if (!isReset && !isPlaying && Input.GetKeyDown("space")) ResetGame();

        // Update score
        else if (isPlaying)
        {
            score += Time.deltaTime;
            scoreText.text = "Score: " + Mathf.Floor(score);
        }
    }


    public void AddScore(float extra) => score += extra;
}
