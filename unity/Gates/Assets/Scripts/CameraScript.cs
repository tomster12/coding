using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class CameraScript : MonoBehaviour {

	public Vector3 MouseOnPlane;
	GameControllerScript gcs;
	GameObject gc;


	void Start () {
		gcs = GameObject.Find("GameController").GetComponent<GameControllerScript>();
		gc = GameObject.Find("GameController");
	}


	void Update () {
		KeysPressed();
		MousePressed();
		MousePositionFind();
	}


	void MousePressed() {
		if (Input.GetMouseButtonDown (0)) { // LMB

			Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
			RaycastHit hit;
			if(Physics.Raycast (ray, out hit)) {

				if (gcs.gateSelected == null) { // No gate selected

					if (hit.transform.GetComponent<Node>() != null) { // Hit node
						gc.SendMessage("ClickNode", hit.transform.gameObject);

					} else { // Didnt hit node
						if (hit.transform.name == "Main" && gcs.nodeSelected == null) { // Hit gate
							gcs.gateSelected = hit.transform.parent.gameObject;
							gcs.gateSelectedOffset = MouseOnPlane - gcs.gateSelected.transform.position;
						}

						gc.SendMessage("DeselectNode");
					}

				} else { // Gate selected
					if (gcs.gatePlaceable) {
						gcs.gateSelected = null;
					}
				}
			}


		} else if (Input.GetMouseButtonDown (1)) { //RMB
			gc.SendMessage("DeselectNode");

			if (gcs.gateSelected != null) {
				gc.SendMessage("DisconnectNode", gcs.gateSelected.GetComponent<ParentGateScript>().OutLight);
				foreach (GameObject node in gcs.gateSelected.GetComponent<ParentGateScript>().InputNodes) {
					gc.SendMessage("DisconnectNode", node);
				}

			} else {
				Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
				RaycastHit hit;
				if(Physics.Raycast (ray, out hit)) {
					if (hit.transform.GetComponent<Node>() != null) { // Hit node
						gc.SendMessage("DisconnectNode", hit.transform.gameObject);
					}
				}
			}
		}
	}


	void KeysPressed() {
		if (Input.GetAxis("Mouse ScrollWheel") != 0f ) { // Movement + Scroll Scrollwheel
			transform.position += new Vector3(0f, -6 * Input.GetAxis("Mouse ScrollWheel"), 0f);
		}
		if (Input.GetKey("a")) {
			transform.position += new Vector3(-0.2f, 0f, 0f);
		}
		if (Input.GetKey("d")) {
			transform.position += new Vector3(0.2f, 0f, 0f);
		}
		if (Input.GetKey("w")) {
			transform.position += new Vector3(0f, 0f, 0.2f);
		}
		if (Input.GetKey("s")) {
			transform.position += new Vector3(0f, 0f, -0.2f);
		}
		transform.position = new Vector3(Mathf.Clamp(transform.position.x, -50f, 50f), Mathf.Clamp(transform.position.y, 5f, 45f), Mathf.Clamp(transform.position.z, -50f, 50f));
		if ((Input.GetKey("x") || Input.GetKey("backspace")) && gcs.gateSelected != null) { // Disconnect then delete selected gate
			gc.SendMessage("DisconnectNode", gcs.gateSelected.GetComponent<ParentGateScript>().OutLight);
			foreach (GameObject node in gcs.gateSelected.GetComponent<ParentGateScript>().InputNodes) {
				gc.SendMessage("DisconnectNode", node);
			}
			Destroy(gcs.gateSelected);
			gcs.gateSelected = null;
		}
		if (Input.GetKeyDown("r")) {
			if (gcs.gateSelected != null) {
				gcs.gateSelected.transform.Rotate(0f, 90f, 0f);
			}
		}
		if (Input.GetKeyDown("space")) {
			Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
			RaycastHit hit;
			if(Physics.Raycast (ray, out hit)) {
				if (hit.transform.parent.gameObject.GetComponent<Button>() != null) {
					hit.transform.parent.gameObject.GetComponent<Button>().Input = !hit.transform.parent.gameObject.GetComponent<Button>().Input;
				}
			}
		}
	}


	void MousePositionFind() {
    Plane plane = new Plane(Vector3.up, new Vector3(0f, 0f, 0f));
    Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);

    float distance;
    if (plane.Raycast(ray, out distance)) {
      MouseOnPlane = ray.GetPoint(distance);
    }
	}


	void OnPostRender () {
		GameObject[] gates = GameObject.FindGameObjectsWithTag("Gate");
		foreach (GameObject gate in gates) {
			ParentGateScript gs = gate.GetComponent<ParentGateScript>();  // Node to node wire
			foreach (GameObject input in gs.Outputs) {
				GL.Begin(GL.LINES);
				GL.Color(gs.Out ? gs.LOn : gs.LOff);
				Vector3 Vertex1 = gate.GetComponent<ParentGateScript>().OutLight.transform.position;
				Vector3 Vertex2 = input.transform.position;
				GL.Vertex(new Vector3(Vertex1.x, Vertex1.y - 0.05f, Vertex1.z));
				GL.Vertex(new Vector3(Vertex2.x, Vertex2.y - 0.05f, Vertex2.z));
				GL.End();
			}
		}

		if (gcs.nodeSelected != null) { // Node to mouse wire
			ParentGateScript ns = gcs.nodeSelected.transform.parent.GetComponent<ParentGateScript>();
			GL.Begin(GL.LINES);
			GL.Color(ns.LSel);
			GL.Vertex(gcs.nodeSelected.transform.position);
			GL.Vertex(new Vector3(MouseOnPlane.x, MouseOnPlane.y, MouseOnPlane.z));
			GL.End();
		}
	}
}
