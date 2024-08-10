using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

public class PlayerScript : MonoBehaviour {

	PathfindingController pc;
	public Transform target;
	List<GameObject> Path;


	void Start () {
		pc = GameObject.Find("Grid").GetComponent<PathfindingController>();
	}


	void Update () {
		Move();
	}


	public void FindPath () {
		DateTime before = DateTime.Now;
		Path = pc.Pathfind(transform.position, target.position);
		DateTime after = DateTime.Now;
		Debug.Log("Duration: " + after.Subtract(before).Ticks);
	}


	void Move () {
		if (Path != null) {
			if (Path.Count == 0) {
				Path = null;
			} else {
				transform.position += Vector3.Normalize(Path[0].transform.position - transform.position) * 0.1f;
				if (Vector3.Distance(transform.position, Path[0].transform.position) < 0.15f) {
					Path.RemoveAt(0);
				}
			}
		}
	}
}
