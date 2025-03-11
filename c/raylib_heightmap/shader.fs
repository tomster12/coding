#version 330

uniform vec4 colDiffuse;
uniform float time;

out vec4 finalColor;

void main() {
    finalColor = colDiffuse;
}
