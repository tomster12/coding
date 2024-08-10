using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class planetController : MonoBehaviour {

	void Update() {
		float rotateX = Input.GetAxis("Vertical");
		float rotateY = -Input.GetAxis("Horizontal");
		transform.Rotate(new Vector3(rotateX, rotateY, 0), Space.World);
	}
}
