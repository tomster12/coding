
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


float rand(in float x) {
  float y = fract(sin(x)*100000.0);
	return y;
}


float rand(in vec2 st) {
  return fract(
    sin(dot(st.xy, vec2(12.9898,78.233)))
  	* 43758.5453123
  );
}


float noise(in float x) {
  float i = floor(x);
	float f = fract(x);
  float u = f * f * (3.0 - 2.0 * f);
	return mix(rand(i), rand(i + 1.0), u);
}


float noise(in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = rand(i);
  float b = rand(i + vec2(1.0, 0.0));
  float c = rand(i + vec2(0.0, 1.0));
  float d = rand(i + vec2(1.0, 1.0));

  // Smooth Interpolation
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x)
    + (c - a) * u.y * (1.0 - u.x)
    + (d - b) * u.x * u.y;
}


void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  vec3 color = vec3(0.0);

  // Zoom out 20x
  st *= 20.0;

  // Use noise
  float y = noise(st.x);
	// float y = rand(st);
  color = vec3(y);

  gl_FragColor = vec4(color, 1.0);
}
