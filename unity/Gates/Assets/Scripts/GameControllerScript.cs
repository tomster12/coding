using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class GameControllerScript : MonoBehaviour {

	public GameObject nodeSelected;
	public GameObject gateSelected;
	public GameObject prefabTest;
	public bool gatePlaceable;
	public Vector3 gateSelectedOffset;

	public Color GP = new Color(0.8f, 0.8f, 0.8f);
	public Color GNP = new Color(0.8f, 0.5f, 0.5f);

	GameObject[] gates;


	void Update () {
		gates = GameObject.FindGameObjectsWithTag("Gate");
		UpdateGates();
		UpdateSelectedGate();
	}


	void UpdateGates () {
		foreach (GameObject gate in gates) { // Update every gate
			gate.SendMessage("UpdateGate");
		}
	}


	void UpdateSelectedGate () {
		if (gateSelected != null) { // Snap selected to grid
			Vector3 MOP = GameObject.Find("Main Camera").GetComponent<CameraScript>().MouseOnPlane;
			gateSelected.transform.position = new Vector3(Mathf.Round(MOP.x - gateSelectedOffset.x), Mathf.Round(MOP.y - gateSelectedOffset.y), Mathf.Round(MOP.z - gateSelectedOffset.z));

			gatePlaceable = true;
			foreach (GameObject gate in gates) { // Check if placeable
				if (gate != gateSelected && Vector3.Distance(gateSelected.transform.position, gate.transform.position) < 1.5) {
					gatePlaceable = false;
				}
			}

			if (!gatePlaceable) {
				gateSelected.transform.Find("Main").gameObject.GetComponent<Renderer>().material.color = GNP;
			} else {
				gateSelected.transform.Find("Main").gameObject.GetComponent<Renderer>().material.color = GP;
			}
		}
	}


	public void ClickNode(GameObject node) {
		if (nodeSelected == null) { // No node selected
			if ((string)node.transform.gameObject.tag != "Input") {
				nodeSelected = node;
				node.GetComponent<Node>().selected = true;
			}

			// Not on the same gate + Is an input + Is not connected to
		} else if ((nodeSelected.gameObject.transform.parent != node.transform.parent) && ((string)node.transform.gameObject.tag == "Input") && (node.GetComponent<Node>().ConnectedFrom == null)) {
			nodeSelected.transform.parent.SendMessage("ConnectToGate", node);
			node.GetComponent<Node>().ConnectedFrom = nodeSelected;
			nodeSelected.GetComponent<Node>().selected = false;
			nodeSelected = null;
		}
	}


	public void DeselectNode() {
		if (nodeSelected != null) {
			nodeSelected.GetComponent<Node>().selected = false;
			nodeSelected = null;
		}
	}


	public void DisconnectNode(GameObject node) {
		if ((string)node.transform.gameObject.tag == "Input") { // Is input
			Node ns = node.GetComponent<Node>();
			if (ns.ConnectedFrom != null) {
				ns.ConnectedFrom.transform.parent.SendMessage("RemoveFromOutputs", node);
				ns.ConnectedFrom = null;
			}

		} else { // Is output
			ParentGateScript ns = node.transform.parent.GetComponent<ParentGateScript>();
			if (ns.Outputs.Count > 0) {
				foreach (GameObject input in ns.Outputs) {
					input.GetComponent<Node>().ConnectedFrom = null;
				}
				ns.Outputs = new List<GameObject>();
			}
		}
	}


	public void createGate (GameObject prefab) { // UI Buttons
		gateSelected = Instantiate(prefab, GameObject.Find("Main Camera").GetComponent<CameraScript>().MouseOnPlane, new Quaternion(0, 180, 0, 1));
	}
}
