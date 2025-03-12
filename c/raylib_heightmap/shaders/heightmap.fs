#version 330

in vec2 posScreen;
uniform vec2 screenResolution;
uniform float worldScale;
out vec4 finalColor;

#define HEIGHT_NOISE_SCALE 1.1
#define HEIGHT_NOISE_POWER 1.5
#define HEIGHT_NOISE_POWER 1.5
#define HEIGHT_NOISE_GRADIENT 1.3

#define FBM_OCTAVE_COUNT 5
#define FBM_INITIAL_AMPLITUDE 0.5
#define FBM_INITIAL_AMPLITUDE_SCALE 0.5
#define FBM_OCTAVE_SCALE 2.0
#define FBM_OCTAVE_SHIFT 100.0

float hash(vec2 p) {
  // 2D hash from: https://www.shadertoy.com/view/4dS3Wd
  vec3 p3 = fract(vec3(p.xyx) * 0.13);
  p3 += dot(p3, p3.yzx + 3.333);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 x) {
  // 2D noise from: https://www.shadertoy.com/view/4dS3Wd
  // Lerp between 4 corners using smoothstep
  // Returns value between 0 - 1
  vec2 i = floor(x);
  vec2 f = fract(x);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 x) {
  // Fractal Brownian Motion
  float value = 0.0;
  float amplitude = FBM_INITIAL_AMPLITUDE;

  // For each octave: grab noise, scale/rotate/shift sample position, then reduce amplitude
  mat2 octaveRot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  vec2 octaveShift = vec2(FBM_OCTAVE_SHIFT);
  for(int i = 0; i < FBM_OCTAVE_COUNT; ++i) {
    value += amplitude * noise(x);
    x = octaveRot * x * FBM_OCTAVE_SCALE + octaveShift;
    amplitude *= FBM_INITIAL_AMPLITUDE_SCALE;
  }

  return value;
}

float getHeight(vec2 p) {
  // Sample FBM noise with scaled position
  float n = fbm(p * worldScale);

  // Scale the noise to be more mountainous
  n = pow(n * HEIGHT_NOISE_SCALE, HEIGHT_NOISE_POWER);

  // Gradient magnitude from centre
  float d = length(p - vec2(0.5)) * 2.0;
  return n * (HEIGHT_NOISE_GRADIENT - d);
}

vec4 packHeight(float h) {
  // Packs the height value (0-1) across 4 bytes of a vec4
  vec4 packedHeight = vec4(0.0);
  h *= 4.0;
  packedHeight.r = clamp(h - 3.0, 0.0, 1.0);
  packedHeight.g = clamp(h - 2.0, 0.0, 1.0);
  packedHeight.b = clamp(h - 1.0, 0.0, 1.0);
  packedHeight.a = clamp(h, 0.0, 1.0);
  return packedHeight;
}

vec2 ratioCorrectScreenSpace(vec2 pos, vec2 res) {
  // Convert a (0,0) -> (1,1) screen space to a ratio-corrected space
  // E.g. if (width = height * 1.2) then (0,0) -> (1,0.833)
  if (res.x > res.y) {
    return vec2(pos.x, pos.y * res.y / res.x);
  } else {
    return vec2(pos.x * res.x / res.y, pos.y);
  }
}

void main() {
  vec2 pos = ratioCorrectScreenSpace(posScreen, screenResolution);
  float h = getHeight(pos);
  // finalColor = packHeight(h);
  finalColor = vec4(h, h, h, 1.0);
}
