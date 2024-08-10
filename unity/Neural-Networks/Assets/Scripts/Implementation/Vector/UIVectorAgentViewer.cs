
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;


public class UIVectorAgentViewer : MonoBehaviour {

  // Declare variables
  public TMPro.TextMeshProUGUI fitnessText;
  private VectorAgent currentAgent;
  private bool agentSet;


  public void Awake() {
    // Default to no agent
    unsetAgent();
  }


  public void Update() {
    // Handle clicking on an object
    if (Input.GetMouseButtonDown(0)) {
      RaycastHit hit;
      Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
      if (Physics.Raycast(ray, out hit)) {

        // If object is a vector agent then set
        VectorAgent agent = hit.transform.GetComponent<VectorAgent>();
        if (agent != null) setAgent(agent);
      }

    // Unset current agent on right click
    } else if (Input.GetMouseButtonDown(1)) unsetAgent();


    // Update text for current agent
    if (agentSet) {
      fitnessText.text = "" + currentAgent.getFitness().ToString("F2");
    }
  }


  private void setAgent(VectorAgent agent) {
    unsetAgent();
    transform.localScale = Vector3.one;
    currentAgent = agent;
    agentSet = true;
  }


  private void unsetAgent() {
    transform.localScale = Vector3.zero;
    currentAgent = null;
    agentSet = false;
  }
}