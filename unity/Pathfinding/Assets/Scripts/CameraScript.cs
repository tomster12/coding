using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraScript : MonoBehaviour {

	public Transform Target;


	void Update () {
		if (Input.GetMouseButtonDown(0)) {
			Plane plane = new Plane(Vector3.up, new Vector3(0f, 0.5f, 0f));
	    Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
	    float distance;
	    if (plane.Raycast(ray, out distance)) {
	      Target.position = ray.GetPoint(distance);
				GameObject.Find("Player").GetComponent<PlayerScript>().FindPath();
	    }
		}
		if (Input.GetKey("a")) {
			transform.position += new Vector3(-0.1f, 0f, 0f);
		}
		if (Input.GetKey("d")) {
			transform.position += new Vector3(0.1f, 0f, 0f);
		}
		if (Input.GetKey("s")) {
			transform.position += new Vector3(0f, 0f, -0.1f);
		}
		if (Input.GetKey("w")) {
			transform.position += new Vector3(0f, 0f, 0.1f);
		}
	}
}
