
using System;
using System.Collections.Generic;
using UnityEngine;


[Serializable]
public abstract class EnemySpawner : ScriptableObject
{
    // Declare config, variables
    [SerializeField] private float startTime;
    [SerializeField] private float attackIntervalInitial;
    [SerializeField] private float attackIntervalChange;
    [SerializeField] private float attackIntervalMinimum;

    public PlayerController pcr;
    protected List<GameObject> attacks = new List<GameObject>();
    protected int lastAttackNumber = -1;
    protected float time = 0.0f;
    protected bool isReset = false;
    protected bool isPlaying = false;


    public void StartGame()
    {
        isReset = false;
        isPlaying = true;
    }

    public void StopGame()
    {
        isPlaying = false;
    }

    public void ResetGame()
    {
        foreach (GameObject go in attacks)
        {
            if (go != null) GameObject.Destroy(go);
        }
        lastAttackNumber = -1;
        time = 0.0f;
        attacks.Clear();
        isReset = true;
        isPlaying = false;
    }


    public void Update()
    {
        if (!isPlaying) return;

        // Update timer
        time += Time.deltaTime;
        if (time < startTime) return;

        // Spawn enemy if needed
        float interval = Mathf.Max(attackIntervalMinimum, attackIntervalInitial + attackIntervalChange * (time - startTime));
        int attackNumber = Mathf.FloorToInt((time - startTime) / interval);
        if (attackNumber != lastAttackNumber)
        {
            Attack();
            lastAttackNumber = attackNumber;
        }
    }


    protected abstract void Attack();
}


public class EnemyManager : MonoBehaviour
{
    // Declare variables
    [Header("References")]
    [SerializeField] private PlayerController pcr;

    [Header("Config")]
    [SerializeReference] private EnemySpawner[] spawners;


    private void Awake() { foreach (EnemySpawner spwn in spawners) spwn.pcr = pcr; }


    public void StartGame() { foreach (EnemySpawner spwn in spawners) spwn.StartGame(); }
    public void StopGame() { foreach (EnemySpawner spwn in spawners) spwn.StopGame(); }
    public void ResetGame() { foreach (EnemySpawner spwn in spawners) spwn.ResetGame(); }


    private void Update() { foreach (EnemySpawner spwn in spawners) spwn.Update(); }
}
