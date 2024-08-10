
﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;


public class UINeuralAgentViewer : MonoBehaviour {

  // Declare variables
  public TMPro.TextMeshProUGUI fitnessText;
  private NeuralAgent currentAgent;
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
        NeuralAgent agent = hit.transform.GetComponent<NeuralAgent>();
        if (agent != null) setAgent(agent);
      }

    // Unset current agent on right click
    } else if (Input.GetMouseButtonDown(1)) unsetAgent();

    // Update set agent
    if (agentSet) {
      fitnessText.text = "" + currentAgent.getFitness().ToString("F2");
    }
  }


  private void setAgent(NeuralAgent agent) {
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