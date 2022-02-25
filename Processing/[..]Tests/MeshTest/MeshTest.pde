



ArrayList<mesh> meshes;
PVector draggedVertex;
PVector movement;




void setup() {
  size(900, 900);

  meshes = new ArrayList<mesh>();
  meshes.add(makeMesh(10, 10, 800, 800));

  movement = new PVector(0, 0);
}




void draw() {
  background(0);

  translate(movement.x, movement.y);

  if (keyPressed) {
    if (keyCode == 37) {
      movement.x+=3;
    }
    if (keyCode == 38) {
      movement.y+=3;
    }
    if (keyCode == 39) {
      movement.x-=3;
    }
    if (keyCode == 40) {
      movement.y-=3;
    }
  }

  for (int i = 0; i < meshes.size(); i++) {
    meshes.get(i).show();
  }

  if (mousePressed) {
    for (int i = 0; i < meshes.size(); i++) {
      meshes.get(i).destroy(mouseX - movement.x, mouseY - movement.y, 50);
    }
  }

  //if (draggedVertex != null) {
  //  draggedVertex.x = mouseX;
  //  draggedVertex.y = mouseY;
  //}
}




void mousePressed() {
  //for (int i = 0; i < meshes.size(); i++) {
  //  for (int o = 0; o < meshes.get(i).vertices.size(); o++) {
  //    PVector cV = meshes.get(i).vertices.get(o);
  //    if (dist(mouseX, mouseY, cV.x, cV.y) < 5) {
  //      draggedVertex = cV;
  //    }
  //  }
  //}
}


void mouseReleased() {
  draggedVertex = null;
}




mesh makeMesh(int w, int h, int tW, int tH) {
  w+=1;
  h+=1;
  ArrayList<PVector> tvertices = new ArrayList<PVector>();
  IntList tTriangles = new IntList();
  for (int y = 0; y < h; y++) {
    for (int x = 0; x < w; x++) {
      tvertices.add(new PVector(50+x*(tW/(w-1)), 50+y*(tH/(h-1))));
    }
  }
  for (int x = 0; x < w-1; x++) {
    for (int y = 0; y < h-1; y++) {
      tTriangles.append(y*w + x);
      tTriangles.append(y*w + x+1);
      tTriangles.append((y+1)*w + x+1);
      tTriangles.append(y*w + x);
      tTriangles.append((y+1)*w + x+1);
      tTriangles.append((y+1)*w + x);
    }
  }
  mesh m = new mesh(tvertices, tTriangles);
  return m;
}
