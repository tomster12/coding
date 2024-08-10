
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class CarriageData {

  public float position;
  public GameObject gameObject;
  public bool crashed = false;
}


public class Train : MonoBehaviour {

  // Declare variables
  [Header("Config")]
  public float trainAcceleration = 0.1f;
  public float pickupSpeed = 0.4f;

  [Header("References")]
  public GameObject enginePF;
  public GameObject carriagePF;
  private ParticleSystem smokeFX;

  [Header("Scripts")]
  public Controller controller;
  public Rail rail;
  public Grid grid;

  private List<CarriageData> carriages = new List<CarriageData>();
  public bool driving { get; private set; } = false;
  public float trainSpeed { get; private set; } = 1.0f;
  public bool trainCrashed { get; private set; } = false;


  // #region - Main Updates

  public void Update() {
    // Update train
    updateMovement();
    updateCarriagePositions();
  }


  private void updateMovement() {
    // Initialize variables
    if (carriages.Count > 0) {
      if (driving) trainSpeed += trainAcceleration * Time.deltaTime;
      float velocity = trainSpeed * Time.deltaTime;

      // Update position of all carriages
      for (int i = 0; i < carriages.Count; i++) {
        if (!carriages[i].crashed && (driving || trainCrashed)) {
          carriages[i].position += velocity;

          // Check if ran off end of track
          if (rail.getTrackCount() <= ((int)carriages[i].position + 1)) { crashCarriage(i); return; }
          Track check = rail.getTrack((int)carriages[i].position + 1);
          if (check.placed == false) { crashCarriage(i); return; }
        }
      }
    }
  }


  private void updateCarriagePositions() {
    // Update position of all carriage gameObject
    for (int i = 0; i < carriages.Count; i++) {
      if (!carriages[i].crashed) {

        // Move to position / rotation along first / second rail based on position
        Vector3 railPos;
        Quaternion railRot;
        float progress = carriages[i].position - (int)carriages[i].position;
        if (progress <= 0.5f) {
          railPos = rail.getPosOnTrack((int)carriages[i].position, progress + 0.5f);
          railRot = rail.getRotOnTrack((int)carriages[i].position, progress + 0.5f);
        } else {
          railPos = rail.getPosOnTrack((int)carriages[i].position + 1, progress - 0.5f);
          railRot = rail.getRotOnTrack((int)carriages[i].position + 1, progress - 0.5f);
        }
        railPos.z = transform.position.z;
        carriages[i].gameObject.transform.position = railPos;
        carriages[i].gameObject.transform.rotation = railRot;
      }
    }
  }


  private void OnTriggerEnter2D(Collider2D other) {
    // Check if it is track pickup
    if (other.gameObject.tag == "Track Pickup") {

      // Update amount of tracks
      Pickup pickup = other.GetComponent<Pickup>();
      rail.addAvailableTracks(pickup.amount);
      trainSpeed += pickupSpeed;
      pickup.pickup();

    // Check if it is score pickup
    } else if (other.gameObject.tag == "Score Pickup") {

      // Update score
      Pickup pickup = other.GetComponent<Pickup>();
      controller.addScore(pickup.amount);
      pickup.pickup();
    }
  }

  // #endregion


  // #region - Train Management

  public void startTrain() {
    // Start the train moving
    driving = true;
    trainCrashed = false;
    if (smokeFX != null) smokeFX.Play();
  }


  public void crashTrain() {
    // Add rigidbodies
    GetComponent<Rigidbody2D>().simulated = false;
    for (int i = 0; i < carriages.Count; i++) {
      Rigidbody2D rb = carriages[i].gameObject.AddComponent<Rigidbody2D>();
      rb.bodyType = RigidbodyType2D.Kinematic;
    }

    // Stop the train from moving
    driving = false;
    trainCrashed = true;
    if (smokeFX != null) smokeFX.Stop();
  }


  private void crashCarriage(int index) {
    // Crash train and carriage
    if (!trainCrashed) crashTrain();
    carriages[index].crashed = true;

    // Enable rigidbodies on carriage
    Rigidbody2D rb = carriages[index].gameObject.GetComponent<Rigidbody2D>();
    rb.bodyType = RigidbodyType2D.Dynamic;
    rb.drag = 0.8f;
    rb.angularDrag = 0.8f;
    rb.gravityScale = 0.0f;

    // Apply a random velocity
    Quaternion rotation = carriages[index].gameObject.transform.rotation;
    rotation *= Quaternion.Euler(0, 0, UnityEngine.Random.Range(-20, 20));
    float velocity = trainSpeed * grid.gridSize * UnityEngine.Random.Range(0.8f, 1.2f);
    Vector2 posAcceleration = rotation * Vector2.right * velocity;
    float rotAcceleration = UnityEngine.Random.Range(-90f, 90f);
    rb.velocity += posAcceleration;
    rb.angularVelocity += rotAcceleration;
  }


  public CarriageData addHead(int start) {
    // Create a head carriage
    CarriageData carriage = addCarriage(true);
    carriage.position = start;
    return carriage;
  }


  public CarriageData addCarriage(bool engine=false) {
    CarriageData carriage = new CarriageData();

    // Instantiate carriage gameObject
    if (engine) {
      carriage.gameObject = Instantiate(enginePF);
      smokeFX = carriage.gameObject.transform.GetChild(1).GetComponent<ParticleSystem>();
    } else carriage.gameObject = Instantiate(carriagePF);
    carriage.gameObject.transform.parent = transform;
    carriage.gameObject.transform.localScale = Vector3.one * grid.gridSize;

    // Set position to end
    if (carriages.Count > 0)
      carriage.position = carriages[carriages.Count - 1].position - 1;
    else carriage.position = 0;

    // Add carriage to end
    carriages.Add(carriage);
    return carriage;
  }

  // #endregion


  // #region - Accessors

  public void setHeadPosition(int pos) {
    // Update position of all carriages
    for (int i = 0; i < carriages.Count; i++) {
      carriages[i].position = pos - i;
    }
  }


  public int getCarriageCount() {
    // Return number of carriages
    return carriages.Count;
  }


  public CarriageData getCarriage(int index) {
    // Check index is within bounds
    if (index < 0 || index >= carriages.Count) throw new Exception("Index out of range");

    // Return carriage
    return carriages[index];
  }


  public Vector3 getCarriageCentre(int index) {
    // Return the centre of a carriage
    CarriageData carriage = getCarriage(index);
    return carriage.gameObject.transform.position + carriage.gameObject.transform.localScale * 0.5f;
  }


  public Vector3 getCarriageGridPos(int index) {
    // Return the grid pos of a carriage
    CarriageData carriage = getCarriage(index);
    Track track = rail.getTrack((int)carriage.position);
    return track.gridPos;
  }

  // #endregion
}