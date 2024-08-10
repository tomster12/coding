
using System.Collections.Generic;
using UnityEngine;


public class PickupSystem : MonoBehaviour
{
    // Declare prefabs, config, variabless
    [Header("Prefabs")]
    [SerializeField] private GameObject[] pickupPrefabs;

    [Header("Config")]
    [SerializeField] private float spawnInterval;
    [SerializeField] private float spawnRadius;

    private List<GameObject> pickups = new List<GameObject>();
    private float time;
    private bool isReset;
    private bool isPlaying;


    public void StartGame()
    {
        if (!isReset) ResetGame();

        isReset = false;
        isPlaying = true;
    }

    public void StopGame()
    {
        isPlaying = false;
    }

    public void ResetGame()
    {
        foreach (GameObject go in pickups)
        {
            if (go != null) GameObject.Destroy(go);
        }
        time = 0.0f;
        isReset = true;
        isPlaying = false;
    }


    private void Update()
    {
        if (!isPlaying) return;

        // Update time and check spawning
        time += Time.deltaTime;
        if (time > spawnInterval)
        {
            time = 0.0f;
            SpawnPickup();
        }
    }


    private void SpawnPickup()
    {
        // Create pickup at random locatio
        Vector3 pos = new Vector3(Random.Range(-spawnRadius, spawnRadius), 0.0f, Random.Range(-spawnRadius, spawnRadius));
        GameObject pickup = Instantiate(pickupPrefabs[(int)Random.Range(0.0f, pickupPrefabs.Length)], pos, Quaternion.identity);
        pickups.Add(pickup);
    }
}
