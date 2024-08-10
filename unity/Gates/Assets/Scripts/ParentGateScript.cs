using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class ParentGateScript : MonoBehaviour {

	public Color LOff = new Color(1f, 0f, 0f, 1f);
	public Color LOn = new Color(0f, 1f, 0f, 1f);
	public Color LSel = new Color(1f, 0.65f, 0f, 1f);

	public bool[] Inputs = new bool[2];
	public GameObject[] InputNodes = new GameObject[2];

	public bool Out;
	public GameObject OutLight;
	public List<GameObject> Outputs = new List<GameObject>();

	public bool overlapping;


	public void UpdateGate () {
		SendOutput();
		CalculateOutput();
		UpdateLights();
	}


	void SendOutput () {
		foreach (GameObject input in Outputs) {
			input.transform.parent.SendMessage("ReceiveOutput", new List<object> {Out, input});
		}
	}


	public virtual void CalculateOutput () {
		Debug.Log("Set a CalculateOutput ()");
		Out = false;
	}


	void UpdateLights () {
		for (int i = 0; i < InputNodes.Length; i++) {
			if (InputNodes[i].GetComponent<Node>().ConnectedFrom == false) {
				Inputs[i] = false;
			}
		}

		for (int i = 0; i < InputNodes.Length; i++) {
			if (!InputNodes[i].GetComponent<Node>().selected) {
				if (Inputs[i]) {
					InputNodes[i].GetComponent<Renderer>().material.color = LOn;
				} else {
					InputNodes[i].GetComponent<Renderer>().material.color = LOff;
				}
			} else {
				InputNodes[i].GetComponent<Renderer>().material.color = LSel;
			}
		}

		if (!OutLight.GetComponent<Node>().selected) {
			if (Out) {
				OutLight.GetComponent<Renderer>().material.color = LOn;
			} else {
				OutLight.GetComponent<Renderer>().material.color = LOff;
			}
		} else {
			OutLight.GetComponent<Renderer>().material.color = LSel;
		}
	}


	void ConnectToGate (GameObject node) {
		Outputs.Add(node);
	}


	public void ReceiveOutput (List<object> data) {
		foreach (GameObject InputNode in InputNodes) {
			if (InputNode == (GameObject)data[1]) {
				Inputs[System.Array.IndexOf(InputNodes, InputNode)] = (bool)data[0];
			}
		}
	}


	public void RemoveFromOutputs(GameObject node) {
		Outputs.Remove(node);
	}
}
