#version 330

in vec3 vertexPosition;
in vec3 vertexNormal;
in mat4 instanceMatrix;

uniform mat4 projectionMatrix;

out vec3 fragNormal;

void main()
{
    fragNormal = vertexNormal;

    mat4 mvpi = projectionMatrix * instanceMatrix;
    vec4 pos = mvpi * vec4(vertexPosition, 1.0);
    gl_Position = pos;
}
