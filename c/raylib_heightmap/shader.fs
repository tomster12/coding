#version 330

in vec4 fragColor;

uniform vec2 resolution;
uniform float time;

out vec4 finalColor;

void main() {
    vec4 screenCol = vec4(gl_FragCoord.xy / resolution, 0, 1);
    finalColor = screenCol;
}
