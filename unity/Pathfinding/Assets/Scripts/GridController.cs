using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GridController : MonoBehaviour {

	public GameObject NodePrefab;
  public GameObject[,] Nodes;

	public float NodeSize;
  public int TransformSize;
  public int GridSize;
  public bool Show;


  void Start () {
    GridSize = (int)Mathf.Floor(TransformSize / NodeSize);
    Nodes = new GameObject[GridSize, GridSize];

    CreateGrid();
    GetNeighbours();
  }


  void CreateGrid () {
    int i, o;
    float x, y;
    for (i = 0, x = NodeSize / 2; i < GridSize; i++, x += NodeSize) {
      for (o = 0, y = NodeSize / 2; o < GridSize; o++, y += NodeSize) {
        GameObject NewNode = Instantiate(NodePrefab, new Vector3(transform.position.x + x, transform.position.y, transform.position.z + y), transform.rotation);
        NewNode.GetComponent<Renderer>().enabled = Show;
        NewNode.GetComponent<NodeScript>().gc = GetComponent<GridController>();
        NewNode.GetComponent<NodeScript>().GridPosition = new int[2] {i, o};
        NewNode.GetComponent<NodeScript>().Active = true;
        NewNode.transform.parent = transform;
        NewNode.transform.localScale = new Vector3(NodeSize, 0.5f, NodeSize);
        Nodes[i,o] = NewNode;
      }
    }
  }


  void GetNeighbours () {
    for (int i = 0; i < Nodes.GetLength(0); i++) {
      for (int o = 0; o < Nodes.GetLength(1); o++) {
        Nodes[i,o].GetComponent<NodeScript>().GetNeighbours();
      }
    }
  }


  public GameObject FindNode (Vector3 Point) {
    for (int i = 0; i < Nodes.GetLength(0); i++) {
      for (int o = 0; o < Nodes.GetLength(1); o++) {
        if (Nodes[i,o].GetComponent<Collider>().bounds.Contains(Point)) {
          return Nodes[i,o];
        }
      }
    }
    return null;
  }
}
