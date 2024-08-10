
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class PlayerWarrior : PlayerDefault
{

    // Declare references
    private ComboHandler combo;


    protected override void Awake()
    {
        base.Awake();

        // Initialize references
        combo = GetComponent<ComboHandler>();
    }


    protected override void Update()
    {
        base.Update();

        // Attack on left mouse button
        if (Input.GetMouseButtonDown(0)) combo.Attack();
    }
}
