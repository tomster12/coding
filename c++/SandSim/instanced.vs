#version 330 core

in vec3 vertexPosition;
in vec3 vertexNormal;
in mat4 matInstance;

uniform mat4 mvp;

out vec3 fragNormal;

void main()
{
    fragNormal = vertexNormal;
    gl_Position = mvp * matInstance * vec4(vertexPosition, 1.0);
}
