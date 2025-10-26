#version 330 core

in vec3 fragNormal;

uniform vec4 colDiffuse;

out vec4 color;

void main()
{
    vec3 lightDir = normalize(vec3(0.5, 0.5, 1.0));
    float lightIntensity = max(0, dot(fragNormal, lightDir));
    vec4 finalColor = colDiffuse * (0.5 + 0.5 * lightIntensity);
    finalColor.a = 1.0;

    color = finalColor;
}
