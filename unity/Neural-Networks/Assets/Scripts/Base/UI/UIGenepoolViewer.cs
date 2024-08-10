
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;


public class UIGenepoolViewer : MonoBehaviour {

  // Declare variables
  [Header("Config")]
  public GameObject handlerGO;
  public GenepoolHandler handler;
  public TMPro.TextMeshProUGUI generationText;
  public TMPro.TextMeshProUGUI agentCountText;
  public TMPro.TextMeshProUGUI mutationRateText;
  public TMPro.TextMeshProUGUI bestFitnessText;
  public TMPro.TextMeshProUGUI runningText;
  public UIToggle autoFinishToggle;
  public UIToggle autoStartToggle;
  public UIToggle instantRunToggle;


  public void Start() {
    // Set handler
    handler = handlerGO.GetComponent<GenepoolHandler>();
    if (handler == null) Debug.LogError("No handler on given GameObject");

    // Set initial auto finish / start
    autoFinishToggle.setToggle(handler.getAutoFinish());
    autoStartToggle.setToggle(handler.getAutoStart());
    instantRunToggle.setToggle(handler.getInstantRun());
  }


  public void Update() {
    // Update text
    generationText.text = "" + handler.getGeneration();
    agentCountText.text = "" + handler.getAgentCount();
    mutationRateText.text = "" + handler.getMutationRate();
    bestFitnessText.text = "" + handler.getBestFitness();
    runningText.text = "" + handler.getRunning();

    // Keep auto finish / start updated
    handler.setAutoFinish(autoFinishToggle.toggled);
    handler.setAutoStart(autoStartToggle.toggled);
    handler.setInstantRun(instantRunToggle.toggled);
  }


  // Pass through button functionality
  public void clickFinish() { handler.finishGeneration(); }
  public void clickStart() { handler.startGeneration(); }
  public void clickStop() { handler.stopGeneration(); }
}