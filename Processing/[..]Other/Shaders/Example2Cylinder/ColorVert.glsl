
// Set by processing
uniform mat4 transform;

// Set by the user
attribute vec4 position;
attribute vec4 color;

// Sent through to frag shader
varying vec4 vertColor;


void main() {
  gl_Position = transform * position;
  vertColor = color;
}
