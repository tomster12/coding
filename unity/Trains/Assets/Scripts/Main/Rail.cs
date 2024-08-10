
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;


public enum TrackType {
  VERT = 1010, HORZ = 0101,
  TR = 1100, BR = 0110, BL = 0011, TL = 1001,
  BLOCKED = 1111, NOTRACKS = 0000
};


public class Track {

  // Declare variables
  public TrackType type;
  public int dir;
  public Vector3 gridPos;
  public bool placed;
  public GameObject gameObject;


  public Vector3 getPos(float progress) {
    Transform tfm = gameObject.transform;

    // Handle straight track
    if (type == TrackType.VERT || type == TrackType.HORZ) {
      Vector3 start = tfm.position + tfm.rotation * Vector3.Scale(new Vector3(0.0f, -0.5f, 0.0f), tfm.localScale);
      Vector3 end = tfm.position + tfm.rotation * Vector3.Scale(new Vector3(0.0f, 0.5f, 0.0f), tfm.localScale);
      if (dir == 0 || dir == 1)
        return Vector3.Lerp(start, end, progress);
      else return Vector3.Lerp(end, start, progress);

    // Handle corner track
    } else {
      if (type == TrackType.BR || type == TrackType.TR) progress = 1 - progress;
      float angle = progress * Mathf.PI * 0.5f;
      Vector3 corner = tfm.position + tfm.rotation * Vector3.Scale(new Vector3(-0.5f, -0.5f, 0.0f), tfm.localScale);
      Vector3 circle = new Vector3(Mathf.Cos(angle), Mathf.Sin(angle), tfm.position.z);
      return corner + tfm.rotation * Vector3.Scale(circle, tfm.localScale) * 0.5f;
    }
  }


  public Quaternion getRot(float progress) {
    // Handle straight track
    if (type == TrackType.VERT || type == TrackType.HORZ) {
      return Quaternion.Euler(0, 0, (2 - dir) * 90);

    // Handle corner track
    } else {
      float start = 0, end = 0;
      if (type == TrackType.TL) { start = 0; end = 90;
      } else if (type == TrackType.TR) { start = 180; end = 90;
      } else if (type == TrackType.BL) { start = 90; end = 180;
      } else if (type == TrackType.BR) { start = 90; end = 0; }
      float current = Mathf.Lerp(start, end, progress);
      return Quaternion.Euler(0, 0, current);
    }
  }
}


public class Rail : MonoBehaviour {

  // Declare variables
  [Header("Config")]
  public bool showGhosts = false;

  [Header("References")]
  public GameObject verticalTrackPF;
  public GameObject cornerTrackPF;
  public ParticleSystem buildFX;
  public GameObject ghostVerticalTrack;
  public GameObject ghostCornerTrack;
  public SpriteRenderer ghostVerticalTrackSprite;
  public SpriteRenderer ghostCornerTrackSprite;

  [Header("Scripts")]
  public Grid grid;

  private List<Track> tracks = new List<Track>();
  public int maxWidth {get; private set; } = 10;
  public Vector3 currentEnd { get; private set; } = new Vector3(0, 0, 0);
  public int currentDir { get; private set; } = 1;
  public int availableTracks { get; private set; } = 0;


  public void Update() {
    updateGhostTrack();
  }


  private void updateGhostTrack() {
    if (!showGhosts) return;

    // Update ghost tracks
    int rotates = 0;
    Vector3 end = grid.gridToWorld(currentEnd);
    end = new Vector3(end.x, end.y, transform.position.z);
    TrackType currentType = checkTrackType(currentDir);

    // Blocked ghost track
    if (currentType == TrackType.BLOCKED) currentType = checkTrackType(1);
    if (currentType == TrackType.BLOCKED) {
      ghostVerticalTrack.SetActive(false);
      ghostCornerTrack.SetActive(false);

    // Stop ghost track
    } else if (currentType == TrackType.VERT || currentType == TrackType.HORZ) {
      ghostVerticalTrack.SetActive(true);
      ghostCornerTrack.SetActive(false);
      if (currentType == TrackType.HORZ) rotates = 1;
      ghostVerticalTrack.transform.localScale = Vector3.one * grid.gridSize;
      ghostVerticalTrack.transform.position = end;
      ghostVerticalTrack.transform.rotation = Quaternion.Euler(0, 0, rotates * 90);
      ghostVerticalTrackSprite.color = new Color(1.0f, 1.0f, 1.0f, 0.25f + 0.05f * Mathf.Sin(Time.time * (2.0f * Mathf.PI)));

    // Invalid track
    } else {
      ghostVerticalTrack.SetActive(false);
      ghostCornerTrack.SetActive(true);
      if (currentType == TrackType.TL) rotates = 3;
      else if (currentType == TrackType.TR) rotates = 2;
      else if (currentType == TrackType.BR) rotates = 1;
      ghostCornerTrack.transform.localScale = Vector3.one * grid.gridSize;
      ghostCornerTrack.transform.position = end;
      ghostCornerTrack.transform.rotation = Quaternion.Euler(0, 0, rotates * 90);
      ghostCornerTrackSprite.color = new Color(1.0f, 1.0f, 1.0f, 0.25f + 0.05f * Mathf.Sin(Time.time * (2.0f * Mathf.PI)));
    }
  }



  // #region - Track Maagement

  public TrackType progressRail(int headingDir, bool ingame) {
    // Ensure has rails
    if (ingame && availableTracks == 0) return TrackType.NOTRACKS;

    // Get and check next track type
    TrackType type = checkTrackType(headingDir);
    if (type == TrackType.BLOCKED) return type;
    Track track = placeTrack(type, headingDir, ingame);

    // Face new direction and move
    currentDir = headingDir;
    float newEndX = currentEnd.x;
    float newEndY = currentEnd.y;
    if (headingDir == 0) newEndX--;
    if (headingDir == 1) newEndY++;
    if (headingDir == 2) newEndX++;
    currentEnd = new Vector3(newEndX, newEndY);

    // Update tracks available and return track
    if (ingame) availableTracks--;
    return type;
  }


  public Track placeTrack(TrackType type, int headingDir, bool ingame) {
    // Create and setup track
    Track newTrack = new Track();
    newTrack.type = type;
    newTrack.dir = headingDir;
    newTrack.gridPos = currentEnd;
    newTrack.placed = true;

    // Instantiate track gameObject
    if (type == TrackType.VERT || type == TrackType.HORZ)
      newTrack.gameObject = grid.createObject(verticalTrackPF, currentEnd, transform.position.z);
    else newTrack.gameObject = grid.createObject(cornerTrackPF, currentEnd, transform.position.z);
    newTrack.gameObject.transform.parent = transform;

    // Rotate track sprite
    int rotates = 0;
    if (type == TrackType.HORZ) rotates = 1;
    else if (type == TrackType.TL) rotates = 3;
    else if (type == TrackType.TR) rotates = 2;
    else if (type == TrackType.BR) rotates = 1;
    newTrack.gameObject.transform.rotation *= Quaternion.Euler(0, 0, rotates * 90);

    // Play FX
    if (ingame) StartCoroutine(IEIntroTrack(newTrack));

    // Add track to end and return
    tracks.Add(newTrack);
    return newTrack;
  }


  private IEnumerator IEIntroTrack(Track newTrack) {
    // Create track shadow
    GameObject trackShadow = Instantiate(newTrack.gameObject);
    trackShadow.transform.position = newTrack.gameObject.transform.position;
    SpriteRenderer trackShadowSprite = trackShadow.transform.GetChild(0).GetComponent<SpriteRenderer>();

    // Drop rail in from above
    newTrack.placed = false;
    Vector3 before = newTrack.gameObject.transform.position;
    Transform objects = GameObject.Find("Objects").transform;
    Vector3 target = new Vector3(before.x, before.y, objects.transform.position.z - 1.0f);
    for (float t = 0; t < 1.0f;) {
      float scale = Easing.easeInCubic(t);
      newTrack.gameObject.transform.position = target + Vector3.up * grid.gridSize * (1 - scale);
      trackShadowSprite.color = new Color(1.0f, 1.0f, 1.0f, scale * 0.5f);
      trackShadow.transform.localScale = Vector3.one * grid.gridSize * (2 - scale);
      t += Time.deltaTime * 1 / 0.3f;
      yield return null;
    }

    // Ensure position after loop and play build vfx
    newTrack.placed = true;
    Destroy(trackShadow);
    buildFX.transform.position = newTrack.gameObject.transform.position;
    buildFX.Emit(8);
    newTrack.gameObject.transform.position = before;
  }


  public TrackType checkTrackType(int headingDir) {
    // Check nothing at endpos
    TrackType type = TrackType.BLOCKED;
    if (!canTraverse(grid.getObject(currentEnd))) type = TrackType.BLOCKED;

    else if (headingDir == 0) {
      if (currentEnd.x <= -(int)(maxWidth * 0.5)) type = TrackType.BLOCKED;
      else if (!canTraverse(grid.getObject(currentEnd + Vector3.left))) type = TrackType.BLOCKED;
      else if (currentDir == 0) type = TrackType.HORZ;
      else if (currentDir == 1) type = TrackType.BL;
      else if (currentDir == 2) type = TrackType.BLOCKED;

    } else if (headingDir == 1) {
      if (!canTraverse(grid.getObject(currentEnd + Vector3.up))) type = TrackType.BLOCKED;
      else if (currentDir == 0) type = TrackType.TR;
      else if (currentDir == 1) type = TrackType.VERT;
      else if (currentDir == 2) type = TrackType.TL;

    } else if (headingDir == 2) {
      if (currentEnd.x >= (int)(maxWidth * 0.5)) type = TrackType.BLOCKED;
      else if (!canTraverse(grid.getObject(currentEnd + Vector3.right))) type = TrackType.BLOCKED;
      else if (currentDir == 0) type = TrackType.BLOCKED;
      else if (currentDir == 1) type = TrackType.BR;
      else if (currentDir == 2) type = TrackType.HORZ;
    }

    return type;
  }


  public bool canTraverse(GameObject obj) {
    // BLocked by all objects
    return (obj == null);
  }

  // #endregion


  // #region - Accessors

  public Track getTrack(int index) {
    // Check index is within bounds
    if (index < 0 || index >= tracks.Count) throw new Exception("Index out of range");

    // Return track
    return tracks[index];
  }


  public int getTrackCount() {
    // Return number of tracks
    return tracks.Count;
  }


  // Return position along a track
  public Vector3 getPosOnTrack(int index, float progress) { return getTrack(index).getPos(progress); }

  // Return rotation along a track
  public Quaternion getRotOnTrack(int index, float progress) { return getTrack(index).getRot(progress); }

  // Return the centre of a track
  public Vector3 getTrackCentre(int index) { return getPosOnTrack(index, 0.5f); }


  public void setTrackStart(Vector3 newEnd) {
    // Update starting position
    if (tracks.Count == 0) currentEnd = newEnd;
  }


  public void setMaxWidth(int width) {
    // Update max width
    maxWidth = width;
  }


  public void setAvailableTracks(int newAvailableTracks) {
    // Update tracks available
    if (tracks.Count == 0) availableTracks = newAvailableTracks;
  }


  public void addAvailableTracks(int newAvailableTracks) {
    availableTracks += newAvailableTracks;
  }

  // #endregion
}