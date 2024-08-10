
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;


public class ActionOutBool { public bool on; }
public class Controller : MonoBehaviour {

  // TODO UX:
  //      v1.0
  // - Sound effects
  // - Indicator being near end
  // - Font / art for all counters
  // DONE - Indicator for running out track
  // DONE - Art for pickup
  // DONE - Ragdoll train when crashing
  // DONE - Interactive buttons
  // DONE - Shadows for falling tracks
  // DONE - Update visuals for train / track to final
  // DONE - Particles for building new track
  // DONE - Particles for smoke from train
  // DONE - Add long shadows / lights / bloom
  // DONE - Update visuals for train / track to reasonable

  // TODO Gameplay:
  //      v1.1
  // - Rivers / Bridges generated
  // - Different biomes

  //      v1.0
  // - Pickups for score
  // DONE - Menu screen
  // DONE - End screen menu
  // DONE - Update Game controller
  //   DONE - Fail on reaching end
  //   DONE - Score based on distance
  //   DONE - Speed train up slowly
  //   DONE - Pickups for more track
  //   DONE - Limited track
  //   DONE - Countdown
  // DONE - Trees spawned UnityEngine.Randomly
  // ODNE - Dynamic onscreen movement buttons
  // DONE - Limit train on each side
  // DONE - Add grid underneath rail


  // #region - Setup

  // Declare variables
  public enum CamMode { FOLLOW, OVERVIEW };

  [Header("Config")]
  public int railWidth = 9;
  public int initialTrainLength = 5;
  private int tracksOnscreen = 5;
  public int initialAvailableTracks = 15;
  public float camMoveSpeed = 1.0f;
  public float camZoomSpeed = 1.0f;

  [Header("References")]
  public GameObject treePF;
  public GameObject trackPickupPF;
  public GameObject scorePickupPF;
  public GameObject playArea;
  public GameObject objects;
  public GameObject stopSymbol;
  public UICountdown uiCountdown;
  public GameObject endScreen;
  public Text uiScoreText;
  public Text uiRailCountText;
  public Text uiTrainSpeedText;

  [Header("Scripts")]
  public Camera cam;
  public Train train;
  public Rail rail;
  public Grid grid;

  public bool gamePlaying { get; private set; } = false;
  private CamMode camMode;
  private float lastPlacementTime;
  private Vector3 trackStart;
  private Vector3 trainStart;
  public int furthestTrainEnd;
  public int score { get; private set; } = 0;


  public void Start() {
    // Run initialization
    initSettings();
    initTrain();
    initWorld(0, 200,
      0.4f, 2,
      8, 12,
      15, 15);

    // Start Countdown
    startCountdown();
  }


  private void initSettings() {
    // Pass down references
    rail.grid = grid;
    train.grid = grid;
    train.rail = rail;

    // Start track with 5 carriages of train onscreen
    int offset = -(int)(cam.orthographicSize / grid.gridSize) - Math.Max(0, initialTrainLength - tracksOnscreen);
    trackStart = new Vector3(0, (int)offset, 0);

    // Initialize variables
    score = 0;

    // Initialize camera
    float railWorldWidth = (railWidth + 2) * grid.gridSize;
    cam.orthographicSize = (railWorldWidth / cam.aspect) * 0.5f;

    // Update play area
    playArea.transform.localScale = new Vector3(
      railWidth * grid.gridSize,
      playArea.transform.localScale.y,
      playArea.transform.localScale.z
    );
  }


  private void initTrain() {
    // Setup rail position / width
    rail.setTrackStart(trackStart);
    rail.setAvailableTracks(initialAvailableTracks);
    rail.setMaxWidth(railWidth);

    // Generate rail with 3 in front of train
    int trackAmount = Math.Max(0, tracksOnscreen - initialTrainLength) + (initialTrainLength + 3);
    for (int i = 0; i < trackAmount; i++) progressRail(1, false);

    // Add train and carriages
    train.addHead(tracksOnscreen - 1);
    for (int i = 0; i < initialTrainLength - 1; i++) train.addCarriage();

    // Get train start
    trainStart = train.getCarriageGridPos(0);
  }


  private void initWorld(int start, int range,
    float treeChance, int treeMax,
    int trackPickupDiff, int trackPickupSize,
    int scorePickupDiff, int scorePickupSize) {

    // Place trees based on chance
    for (int y = 0; y < range; y++) {
      float r = UnityEngine.Random.Range(0.0f, 1.0f);

      // Keep trying umtil placed
      if (r < treeChance) {
        int placed = 0;
        while (placed < treeMax) {

          // Find random empty spot
          int x = UnityEngine.Random.Range(-(int)(railWidth / 2), (int)(railWidth / 2));
          if (grid.getObject(new Vector3(x, y)) == null) {

            // Create and place tree
            int angle = 90 * (int)(UnityEngine.Random.Range(0, 4));
            GameObject tree = grid.createObject(
              treePF, new Vector3(x, y),
              objects.transform.position.z,
              UnityEngine.Random.Range(0.6f, 1.0f));
            tree.transform.parent = objects.transform;
            tree.transform.rotation = Quaternion.Euler(0, 0, angle);
            placed++;
          }
        }
      }
    }


    // Place track pickups
    for (int y = 0; y < range; y += trackPickupDiff) {

      // Keep trying random until placed
      bool placed = false;
      while (!placed) {

        // Find random empty spot
        int x = UnityEngine.Random.Range(-(int)(railWidth / 2), (int)(railWidth / 2));
        if (grid.getObject(new Vector3(x, y)) == null) {

          // Create and set pickup
          GameObject trackPickup = Instantiate(trackPickupPF);
          Pickup trackPickupS = trackPickup.GetComponent<Pickup>();
          trackPickupS.setAmount(trackPickupSize);

          // Move and scale to correct position / size
          Vector3 world = grid.gridToWorld(new Vector3(x, y));
          trackPickup.transform.position = new Vector3(world.x, world.y, objects.transform.position.z - 2.0f);
          trackPickup.transform.localScale = Vector3.one * grid.gridSize;
          trackPickup.transform.parent = objects.transform;
          placed = true;
        }
      }
    }


    // Place score pickups
    for (int y = scorePickupDiff; y < range; y += scorePickupDiff) {

      // Keep trying random until placed
      bool placed = false;
      while (!placed) {

        // Find random empty spot
        int x = UnityEngine.Random.Range(-(int)(railWidth / 2), (int)(railWidth / 2));
        if (grid.getObject(new Vector3(x, y)) == null) {

          // Create and set pickup
          GameObject scorePickup = Instantiate(scorePickupPF);
          Pickup scorePickupS = scorePickup.GetComponent<Pickup>();
          scorePickupS.setAmount(scorePickupSize);

          // Move and scale to correct position / size
          Vector3 world = grid.gridToWorld(new Vector3(x, y));
          scorePickup.transform.position = new Vector3(world.x, world.y, objects.transform.position.z - 2.0f);
          scorePickup.transform.localScale = Vector3.one * grid.gridSize;
          scorePickup.transform.parent = objects.transform;
          placed = true;
        }
      }
    }
  }


  public void startCountdown() {
    // Call start Countdown
    Action callback = new Action(startGame);
    uiCountdown.startCountdown(3, true, callback);
  }


  public void startGame() {
    // Start game
    train.startTrain();
    gamePlaying = true;
  }


  public void stopGame() { StartCoroutine(IEStopGame()); }

  private IEnumerator IEStopGame() {
    // Stop game from being controllable
    gamePlaying = false;

    // Show game over after a timer
    yield return new WaitForSeconds(2.0f);
    endScreen.SetActive(true);
  }

  // #endregion


  // #region - Main

  public void Update() {
    handleInput();
    updateCamera();
    updateGame();
  }


  private void handleInput() {
    // Ensure game playing
    if (!gamePlaying) return;

    // Progress track with a / w / d
    if (Input.GetKeyDown("a")) progressRail(0);
    else if (Input.GetKeyDown("w")) progressRail(1);
    else if (Input.GetKeyDown("d")) progressRail(2);
  }


  private void updateCamera() {
    Vector3 targetPos = cam.transform.position;
    float targetZoom = cam.orthographicSize;

    // Calculate target position
    if (camMode == CamMode.FOLLOW) {
      Vector3 railPos = rail.getTrackCentre(rail.getTrackCount() - 1) + (Vector3.up * grid.gridSize * 6);
      Vector3 trainBackPos = train.getCarriageCentre(train.getCarriageCount() - 1);
      float middle = (railPos.y + trainBackPos.y) / 2;
      targetPos = new Vector3(0, Mathf.Max(0, middle), cam.transform.position.z);
    }

    // Lerp camera towards target position
    Vector3 nextPos = Vector3.Lerp(cam.transform.position, targetPos, camMoveSpeed * Time.deltaTime);
    float nextZoom = Mathf.Lerp(cam.orthographicSize, targetZoom, camZoomSpeed * Time.deltaTime);
    cam.transform.position = nextPos;
    cam.orthographicSize = nextZoom;
  }


  private void updateGame() {
    // Ensure game playing
    if (gamePlaying) {

      // Check if train crashed
      if (train.trainCrashed) { stopGame(); return; }

      // Update score
      Vector3 current = train.getCarriageGridPos(0);
      int currentTrainEnd = (int)(current.y - trainStart.y);
      if (furthestTrainEnd == null) score += currentTrainEnd;
      else score += Math.Max(0, currentTrainEnd - furthestTrainEnd);
      furthestTrainEnd = currentTrainEnd;
    }

    // Update score / rail count text
    uiTrainSpeedText.text = "Speed: " + train.trainSpeed.ToString("F1") + "m/s";
  }


  public TrackType progressRail(int dir, bool ingame=true) {
    // Progress track in direction
    TrackType placedType = rail.progressRail(dir, ingame);

    // Could not progress so VFX
    if (placedType == TrackType.BLOCKED) {
      invalidVFX(0.1f, 0.05f, 0.05f);

    // Ran out of tiles so VFX
    } else if (placedType == TrackType.NOTRACKS) {

    // Managed to place so update variables
    } else lastPlacementTime = Time.time;

    // Return placed type
    return placedType;
  }


  public void addScore(int scoreDiff) {
    // Add score
    score += scoreDiff;
  }

  // #endregion


  // #region - VFX

  private void invalidVFX(float stopDuration, float shakeDuration, float shakeStrength) {
    // Play VFX for invalid movement
    stopVFX(stopDuration);
    cameraShakeVFX(shakeDuration, shakeStrength);
  }


  private Coroutine currentStopVFX;
  private void stopVFX(float duration=1.0f) {
    // Stop current shake and start new
    if (currentStopVFX != null) StopCoroutine(currentStopVFX);
    currentStopVFX = StartCoroutine(IEStopVFX(duration));
  }

  private IEnumerator IEStopVFX(float duration) {
    // Shake camera with strength for duration
    stopSymbol.SetActive(true);
    stopSymbol.transform.position = grid.gridToWorld(rail.currentEnd) + Vector3.back * 5.0f;
    stopSymbol.transform.localScale = Vector3.one * grid.gridSize * 0.5f;
    SpriteRenderer stopSprite = stopSymbol.GetComponent<SpriteRenderer>();
    float t = 0;
    while (t < duration) {
      stopSprite.color = new Color(1.0f, 1.0f, 1.0f, 1.0f - t / duration);
      t += Time.deltaTime;
      yield return null;
    }
    stopSymbol.SetActive(false);
  }


  private Coroutine currentCameraShakeVFX;
  private void cameraShakeVFX(float duration=0.3f, float strength=0.2f) {
    // Stop current shake and start new
    if (currentCameraShakeVFX != null) StopCoroutine(currentCameraShakeVFX);
    currentCameraShakeVFX = StartCoroutine(IEcameraShakeVFX(duration, strength));
  }

  private IEnumerator IEcameraShakeVFX(float duration, float strength) {
    // Shake camera with strength for duration
    float t = 0;
    while (t < duration) {
      Vector3 pos = UnityEngine.Random.insideUnitCircle.normalized * strength * (1 - t / duration);
      cam.transform.parent.position = pos;
      t += Time.deltaTime;
      yield return null;
    }
  }

  // #endregion
}
