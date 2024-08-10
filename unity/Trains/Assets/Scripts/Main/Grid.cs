
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class Grid : MonoBehaviour {

  // Declare variables
  public float gridSize;
  private Dictionary<string, GameObject> cells = new Dictionary<string, GameObject>();


  public GameObject getObject(Vector3 gridPos) {
    // Get gameObject at grid coord
    string key = getUniqueKey(gridPos);
    if (!cells.ContainsKey(key)) return null;
    return cells[key];
  }


  public GameObject createObject(GameObject gameObject, Vector3 gridPos, float z, float scale=1.0f) {
    // Delete and put new gameObject at grid coord
    string key = getUniqueKey(gridPos);
    if (cells.ContainsKey(key)) Destroy(cells[key]);
    GameObject newObject = Instantiate(gameObject);
    Vector3 worldPos = gridToWorld(gridPos);
    Vector3 pos = new Vector3(worldPos.x, worldPos.y, z);
    newObject.transform.position = pos;
    newObject.transform.localScale = Vector3.one * gridSize * scale;
    cells[key] = newObject;
    return newObject;
  }


  private string getUniqueKey(Vector3 gridPos) {
    // Return a unique string for each grid coordinate
    return (int)gridPos.x + ", " + (int)gridPos.y;
  }


  public Vector3 gridToWorld(Vector3 gridPos) {
    // Return world space version of grid position
    Vector3 gridSizeScale = new Vector3(gridSize, gridSize, 1.0f);
    return transform.position + Vector3.Scale(gridPos, gridSizeScale);
  }


  public Vector3 worldToGrid(Vector3 worldPos) {
    // Return grid space version of world position
    Vector3 gridSizeScale = new Vector3(1.0f / gridSize, 1.0f / gridSize, 1.0f);
    return Vector3.Scale(worldPos - transform.position, gridSizeScale);
  }
}