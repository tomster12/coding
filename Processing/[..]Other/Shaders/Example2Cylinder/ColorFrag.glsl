
#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec4 vertColor;

void main() {
  gl_FragColor = vec4(vec3(1) - vertColor.xyz, 1);
  // gl_FragColor = vertColor;
}
