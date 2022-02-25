
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
	float pct = bl.x * bl.y * tr.x * tr.y;
	return pct;
}


float circleDist(vec2 st, vec2 pos) {
  float pct = distance(st, pos);
	return pct;
}


void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  vec2 mp = u_mouse.xy/u_resolution.xy;
  vec3 color = vec3(0.0);


	float r0d = rectDist(st, vec2(0.2, 0.5), vec2(0.6, 0.85));
	if (r0d == 1.0) color = vec3(0.25, 0.41, 1.0);

	float r1d = rectDist(st, vec2(0.35, 0.42), vec2(0.88, 0.62));
	if (r1d == 1.0) color = vec3(0.64, 0.17, 0.92);


	float c00r = 0.22 + sin(u_time) * 0.02;
	float c00d = circleDist(st, vec2(0.72, 0.24));

	float c01r = 0.15;
	float c01d = circleDist(st, vec2(0.37, 0.19));

	float c0mn = smin((c00d / c00r), (c01d / c01r), 0.3);
	if (c0mn < 1.0) color = vec3(0.72, 0.88, 0.33);


	float c10d = circleDist(st, vec2(0.78, 0.85));
	if ((c10d / 0.08) < 1.00) color = vec3(0.13, 0.29, 0.82);

	float c11d = circleDist(st, vec2(0.87, 0.76));
	if ((c11d / 0.12) < 1.00) color = vec3(0.13, 0.29, 0.82);

	float c1mx = max((c10d / 0.08), (c11d / 0.12));
	if (c1mx < 1.00) color = vec3(0.13, 0.29, 0.82) * 0.7;


	gl_FragColor = vec4(color, 1.0);
}
