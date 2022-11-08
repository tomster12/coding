
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h*h*h*k * (1.0 / 6.0);
}


float rectDist(vec2 st, vec2 start, vec2 end) {
	vec2 bl = step(start, st);
	vec2 tr = 1.0 - step(end, st);
	return (1.0 - bl.x * bl.y * tr.x * tr.y);
}


float rectangle(vec2 st, vec2 start, vec2 end) {
  st = st - (start + end) * 0.5;
  vec2 radius = (end - start) * 0.5;
  vec2 edgeDst = abs(st) - radius;
  float outDst = length(max(edgeDst, 0));
  float inDst = min(max(edgeDst.x, edgeDst.y), 0);
  return outDst + inDst;
}


float circleDist(vec2 st, vec2 pos, float r) {
	return distance(st, pos) / r - 1;
}


vec3 draw(vec3 col0, vec3 col1, float pct, bool add) {
  if (pct == 0.0) return col0;
  if (add) return col0 + col1 * pct;
  else return col1 * pct;
}


void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy;
  vec2 mp = u_mouse.xy / u_resolution.xy;
  vec3 color = vec3(0.0, 0.0, 0.0);

  // Circle 1
  float circle1 = circleDist(st, mp, 0.1);
  color = draw(color, vec3(0.93, 0.25, 0.43), step(0, -circle1), false);

  // Rect 1
	float rect1 = rectangle(st, vec2(0.2, 0.5), vec2(0.6, 0.85));
  color = draw(color, vec3(0.25, 0.41, 1.0), step(0, -rect1), false);

  // Rect 2
	float rect2 = rectDist(st, vec2(0.35, 0.42), vec2(0.88, 0.62));
	color = draw(color, vec3(0.64, 0.17, 0.92), step(0, -rect2), false);

  // Circles 2,1 and 2,2
	float circle21 = circleDist(st, vec2(0.72, 0.24), 0.22 + sin(u_time) * 0.02);
	float circle22 = circleDist(st, vec2(0.37, 0.19), 0.15);
  color = draw(color, vec3(0.72, 0.88, 0.33), step(0, -smin(circle21, circle22, 0.3)), false);

  // Circles 3,1 and 3,2
	float circle31 = circleDist(st, vec2(0.78 + sin(u_time * 1.4) * 0.04, 0.85), 0.08);
  float circle32 = circleDist(st, vec2(0.87, 0.76), 0.12);
  color = draw(color, vec3(0.13, 0.29, 0.82), step(0, -circle31), false);
	color = draw(color, vec3(0.13, 0.29, 0.82), step(0, -circle32), false);
	color = draw(color, vec3(0.21, 0.73, 0.34), step(0, -max(circle31, circle32)), false);

	gl_FragColor = vec4(color, 1.0);
}
