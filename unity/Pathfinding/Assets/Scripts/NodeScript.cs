using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class NodeScript : MonoBehaviour {

	public GridController gc;
	public List<GameObject> Neighbours;
	public int[] GridPosition;
	public bool Active;

	public float F_cost;
	public float G_cost;
	public float H_cost;
	public GameObject Parent;




	void FixedUpdate () {
		if (gc.Show) {
			ColourChange();
		}
	}


	void ColourChange() {
		Material col = GetComponent<Renderer>().material;
		if (!Active) {
			col.color = new Color (1f, 0.4f, 0.4f, 0.2f);
		} else {
			col.color = new Color (1f, 1f, 1f, 0.2f);
		}
		Active = true;
	}


	void OnTriggerStay(Collider other) {
		Active = false;
	}


	public void GetNeighbours() {
		Neighbours.Clear();
		// if (GridPosition[1]+1<gc.GridSize && GridPosition[0]-1>=0) {Neighbours.Add(gc.Nodes[GridPosition[0]-1,GridPosition[1]+1]);}
		if (GridPosition[1]+1<gc.GridSize) {Neighbours.Add(gc.Nodes[GridPosition[0],GridPosition[1]+1]);}
		// if (GridPosition[1]+1<gc.GridSize && GridPosition[0]+1<gc.GridSize) {Neighbours.Add(gc.Nodes[GridPosition[0]+1,GridPosition[1]+1]);}
		if (GridPosition[0]-1>=0) {Neighbours.Add(gc.Nodes[GridPosition[0]-1,GridPosition[1]]);}
		if (GridPosition[0]+1<gc.GridSize) {Neighbours.Add(gc.Nodes[GridPosition[0]+1,GridPosition[1]]);}
		// if (GridPosition[1]-1>=0 && GridPosition[0]-1>=0) {Neighbours.Add(gc.Nodes[GridPosition[0]-1,GridPosition[1]-1]);}
		if (GridPosition[1]-1>=0) {Neighbours.Add(gc.Nodes[GridPosition[0],GridPosition[1]-1]);}
		// if (GridPosition[1]-1>=0 && GridPosition[0]+1<gc.GridSize) {Neighbours.Add(gc.Nodes[GridPosition[0]+1,GridPosition[1]-1]);}
	}
}
