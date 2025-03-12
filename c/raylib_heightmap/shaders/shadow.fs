#version 300 es
precision mediump float;

in vec2 posTex;
out vec4 finalColor;

uniform sampler2D heightMap;
uniform sampler2D voronoiTex;
uniform float heightMod;
uniform float millis;
uniform float ambientStrength;
uniform vec3 ambientColour;
uniform vec3 lightColour;
uniform vec3 sunPos;
uniform vec3 pix;
uniform float waterLevel;
uniform vec2 res;

const int maxSteps = 200;
const float rayIntensity = 0.8;
const float normalIntensity = 0.6;
const float specularStrength = 0.4;
const vec3 viewPos = vec3(0.5, 0.5, 2.);
const float slopeCutoff = 0.3;
const float heightCutoff = 0.5;
const float terrainVariation = 0.03;
const vec3 colourDeepWater = vec3(0.,0.431,0.694);
const vec3 colourWater = vec3(0.384,0.651,0.663);
const vec3 colourSand = vec3(0.839,0.714,0.62);
const vec3 colourGrass = vec3(0.596,0.678,0.353);
const vec3 colourBush = vec3(0.396,0.522,0.255);
const vec3 colourForest = vec3(0.278,0.463,0.271);
const vec3 colourStone = vec3(0.427,0.463,0.529);
const vec3 colourSlate = vec3(0.518,0.553,0.604);
const vec3 colourSnow = vec3(0.824,0.878,0.871);

// Hash function from: https://www.shadertoy.com/view/4dVBzz
#define M1 1597334677U     //1719413*929
#define M2 3812015801U     //140473*2467*11
float hash(vec2 p) {
	uvec2 q = uvec2(p);
	q *= uvec2(M1, M2);
	uint n = q.x ^ q.y;
	n = n * (n ^ (n >> 15));
	return float(n) * (1.0/float(0xffffffffU));
}

float unpackHeight(vec4 h) {
  return (h.r + h.g + h.b + h.a)/4.;
}

float getHeightRaw(vec2 pos) {
  vec2 res = 1./pix.xy;
  
  vec2 p = pos * res;
  
  vec2 lerpP = fract(p);
  
  p = floor(p);
  
  p *= pix.xy;
  
  float tl = unpackHeight(texture(heightMap, p));
  float bl = unpackHeight(texture(heightMap, p + pix.zy));
  
  float tr = unpackHeight(texture(heightMap, p + pix.xz));
  float br = unpackHeight(texture(heightMap, p + pix.xy));
  
  float t = mix(tl, tr, lerpP.x);
  float b = mix(bl, br, lerpP.x);
  
  return mix(t, b, lerpP.y) * heightMod;
}

float getWaterNoise(vec2 pos) {
  return 0.002 * (texture(voronoiTex, fract(pos * res * 8.)).r * 2. - 1.);
}

float getWaterLevel(vec2 pos) {
  float t = millis/200000.;
  
  float waveHeight = getWaterNoise(pos + t);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
  waveHeight += getWaterNoise(pos * rot - vec2(t, 0.));
  
  return waterLevel + waveHeight;
}

float getHeight(vec2 pos) {
  return max(getHeightRaw(pos), getWaterLevel(pos));
}

vec3 getTerrainColour(float h, vec3 normal) {
  // add some random variation around the bands;
  h += (hash(posTex/pix.xy) * 2. - 1.) * terrainVariation;
  
  float flatness = dot(normal, vec3(0., 0., 1.));
  float isSteep = 1. - step(slopeCutoff, flatness);
  float isHigh = step(heightCutoff, h);
  
  float forceStone = isSteep * isHigh; //must be steep and high

  vec3 col = colourSnow;

  if(h < 0.4) {
    col = colourSand;
  } else if(h < 0.5) {
    col = colourGrass;
  } else if(h < 0.6) {
    col = colourBush;
  } else if(h < 0.7) {
    col = colourForest;
  } else if(h < 0.8) {
    col = colourStone;
  } else if(h < 0.9) {
    col = colourSlate;
  }

  return col * (1. - forceStone) + colourStone * forceStone;
}

vec3 getNormal(vec2 pos) {
  float h = 200.;
  float l = h * getHeight(pos - pix.xz);
  float r = h * getHeight(pos + pix.xz);
  
  float d = h * getHeight(pos - pix.zy);
  float u = h * getHeight(pos + pix.zy);
  
  return normalize(vec3(l-r, d-u, 1.));
}

float easeOut(float x, float factor) {
  return clamp(1. - pow(1. - x, factor), 0., 1.);
}

vec3 getSceneColour(float terrainHeight, float waterDepth, float waterHeight, vec3 normal) {
  vec3 col = getTerrainColour(terrainHeight, normal);
  
  // Add water if the terrain is below water level
  float isWater = step(0., waterDepth);
  // Add waves if the water depth is really shallow
  float isWave = isWater * (1. - smoothstep(0., 0.01, waterDepth));
  // isWave *= (sin(cos(millis/500.)*2. + waterDepth * 500.) + 1.)/2.;
  
  float waterLerp = easeOut(waterDepth/waterHeight, 6.);
  
  vec3 waterColour = mix(colourWater, colourDeepWater, easeOut(waterDepth/waterHeight, 2.));
  
  waterColour = mix(waterColour, vec3(1.), isWave);
  
  // Simulate see-through water by mixing between the terrain and water
  // colour based on depth
  col = mix(col, waterColour, waterLerp);
  
  // Add the waves into the colour
  // col += isWave/6.;
  
  return col;
}

void main() {
  // Starting point for ray cast is surface of terrain
  vec3 op = vec3(posTex, getHeight(posTex));
  vec3 p = op;
  
  float minStepSize = min(pix.x, pix.y);
  
  // Direction of raycast is towards the sun from centre of screen
  vec3 sunDir = sunPos - vec3(0.5, 0.5, 0.);
  vec3 stepDir = normalize(sunDir);
    
  float inShadow = 0.;
  int n = 0;
  for(int i = 1; i <= maxSteps; i ++) {    
    n++;
    // Check height at new location
    float h = getHeight(p.xy);
    if(h > p.z) {
      // ray is inside the terrain
      // therefore must be in shadow
      inShadow = 1.;
      break;
    }
    if(p.z > 1.) {
      // above the heighest terrain level
      // will not be in shadow
      break;
    }
    
    // Step towards the sun by dist to heightmap
    p += stepDir * max(minStepSize, (p.z - h) * 0.05);
  }
  if(n == maxSteps) {
    inShadow = 1.;
  }

  float rayDist = length(op - p);
  
  float shadowIntensity = inShadow * 0.5 * (1. - smoothstep(0., 0.7, rayDist));
  
  // calculate normal based on surrounding tiles
  vec3 normal = getNormal(posTex);
  float normalShadow = 1. - (dot(normal, stepDir) + 1.)/2.;
  
  // Add normal shadows into shadow variable
  shadowIntensity = clamp(shadowIntensity * rayIntensity + normalShadow * normalIntensity, 0., 1.);
  float lightStrength = 1. - shadowIntensity;
  
  vec3 ambient = clamp(ambientColour * ambientStrength, 0., 1.);
  vec3 directional = clamp(lightColour * lightStrength, 0., 1.);

  float terrainHeight = getHeightRaw(posTex);
  float waterHeight = getWaterLevel(posTex);
  float waterDepth =  waterHeight - terrainHeight;
  vec3 sceneColour = getSceneColour(terrainHeight, waterDepth, waterHeight, normal);
  
  float isWater = step(0., waterDepth);
  
  vec3 viewDir = normalize(viewPos - op);
  vec3 halfwayDir = normalize(sunDir + viewDir);
  
  float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.);
  vec3 specular = (1. - inShadow) * isWater * specularStrength * spec * lightColour;
  
    
  vec3 light = ambient + directional + specular;
  
  finalColor = vec4(light * sceneColour, 1.);
}


