class mesh {
  ArrayList<PVector> vertices;
  IntList triangles;


  mesh(ArrayList<PVector> vertices_, IntList triangles_) {
    vertices = vertices_;
    triangles = triangles_;

    shuffleVertices();
  }


  void show() {
    noStroke();
    fill(0);
    for (int i = 0; i < vertices.size(); i++) {
      ellipse(vertices.get(i).x, vertices.get(i).y, 10, 10);
    }

    stroke(0);
    strokeWeight(2);
    for (int i = 0; i < triangles.size(); i+=3) {
      fill(map(i, 0, triangles.size()-1, 50, 150));
      triangle(
        vertices.get(triangles.get(i)).x, vertices.get(triangles.get(i)).y,
        vertices.get(triangles.get(i+1)).x, vertices.get(triangles.get(i+1)).y,
        vertices.get(triangles.get(i+2)).x, vertices.get(triangles.get(i+2)).y
        );
    }
  }


  void destroy(float x, float y, float d) {
    for (int i = 0; i < vertices.size(); i++) {
      if (dist(vertices.get(i).x, vertices.get(i).y, x, y) < d) {

        for (int o = 0; o < triangles.size(); o+=3) { // Delete triangles that include vertex
          boolean found = false;
          for (int p = 0; p < 3; p++) {
            if (triangles.get(o+p) == i) {
              found = true;
            }
          }
          if (found) {
            triangles.remove(o);
            triangles.remove(o);
            triangles.remove(o);
            o-=3;
          }
        }

        vertices.remove(i);
        correctTriangles(i);
        i--;
      }
    }

    cleanVertices();
  }


  void cleanVertices() {
    for (int i = 0; i < vertices.size(); i++) {
      boolean found = false;

      for (int o = 0; o < triangles.size(); o++) {
        if (triangles.get(o) == i) {
          found = true;
        }
      }

      if (!found) {
        vertices.remove(i);
        correctTriangles(i);
        i--;
      }
    }
  }


  void correctTriangles(int i) {
    for (int o = 0; o < triangles.size(); o++) { // Correct triangles after vertex
      if (triangles.get(o) > i) {
        triangles.set(o, triangles.get(o)-1);
      }
    }
  }


  void shuffleVertices() {
    for (int i = 0; i < vertices.size(); i++) {
      vertices.get(i).add(new PVector(random(-10,10), random(-10,10)));
    }
  }
}
