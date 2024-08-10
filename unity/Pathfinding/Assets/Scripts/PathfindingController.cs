using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public class PathfindingController : MonoBehaviour {


  public List<GameObject> Pathfind (Vector3 _Start, Vector3 _Target) {
    GameObject Start = GetComponent<GridController>().FindNode(_Start);
    GameObject Target = GetComponent<GridController>().FindNode(_Target);
    if (
      Start == null
      || Target == null
      || !Start.GetComponent<NodeScript>().Active
      || !Target.GetComponent<NodeScript>().Active
    ) {return null;}

    NodeScript ss = Start.GetComponent<NodeScript>();
    ss.H_cost = Vector3.Distance(Start.transform.position, Target.transform.position);
    ss.F_cost = ss.H_cost;

    List<GameObject> Open = new List<GameObject>();
    List<GameObject> Closed = new List<GameObject>();

    GameObject Current;
    Open.Add(Start);


    int Loops = 0;
    while (true) {
      Loops++;
      if (Loops > 1000) {
        return null;
      }

      Current = Open[0];
      foreach (GameObject Node in Open) {
        NodeScript ns = Node.GetComponent<NodeScript>();
        NodeScript cs = Current.GetComponent<NodeScript>();
        bool req1 = (ns.F_cost < cs.F_cost);
        bool req21 = (ns.F_cost == cs.F_cost);
        bool req22 = (ns.H_cost < cs.H_cost);
        if (req1 || (req21 && req22)) {
          Current = Node;
        }
      }
      Open.Remove(Current);
      Closed.Add(Current);

      if (Current == Target) {
        List<GameObject> Path = new List<GameObject>();
        while (Current != Start) {
          Path.Add(Current);
          Current = Current.GetComponent<NodeScript>().Parent;
        }
        Path.Reverse();
        return Path;
      }

      foreach (GameObject Neighbour in Current.GetComponent<NodeScript>().Neighbours) {
        NodeScript ns = Neighbour.GetComponent<NodeScript>();
        if (!(!ns.Active || Closed.Contains(Neighbour))) {
          float nG_cost = Current.GetComponent<NodeScript>().G_cost + Vector3.Distance(Current.transform.position, Neighbour.transform.position);
          if (nG_cost < ns.G_cost || !Open.Contains(Neighbour)) {
            ns.H_cost = Vector3.Distance(Neighbour.transform.position, Target.transform.position);
            ns.G_cost = nG_cost;
            ns.F_cost = ns.H_cost + ns.G_cost;
            ns.Parent = Current;
            if (!Open.Contains(Neighbour)) {
              Open.Add(Neighbour);
            }
          }
        }
      }
    }
  }
}
