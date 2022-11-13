
// https://github.com/genekogan/Processing-Shader-Examples/blob/master/TextureShaders/data/pixelate.glsl

#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec4 vertTexCoord;
uniform sampler2D texture;

uniform float u_pixelsize;
uniform vec4 u_outline_color;
uniform bool u_include_corners;

float pixelSizePct = 1.0 / u_pixelsize;

void main(void)
{
  	vec2 p = vertTexCoord.st;
	vec4 c = texture2D(texture, p);

    bool hasEdge = false;
    hasEdge = hasEdge || (texture2D(texture, vec2(p.x + pixelSizePct, p.y              )).a != 0.0);
    hasEdge = hasEdge || (texture2D(texture, vec2(p.x,               p.y - pixelSizePct)).a != 0.0);
    hasEdge = hasEdge || (texture2D(texture, vec2(p.x - pixelSizePct, p.y              )).a != 0.0);
    hasEdge = hasEdge || (texture2D(texture, vec2(p.x,               p.y + pixelSizePct)).a != 0.0);
    if(u_include_corners)
    {
        hasEdge = hasEdge || texture2D(texture, vec2(p.x + pixelSizePct, p.y - pixelSizePct)).a != 0.0;
        hasEdge = hasEdge || texture2D(texture, vec2(p.x + pixelSizePct, p.y + pixelSizePct)).a != 0.0;
        hasEdge = hasEdge || texture2D(texture, vec2(p.x - pixelSizePct, p.y - pixelSizePct)).a != 0.0;
        hasEdge = hasEdge || texture2D(texture, vec2(p.x - pixelSizePct, p.y + pixelSizePct)).a != 0.0;
    }
    
    if (hasEdge) gl_FragColor = u_outline_color;
    else gl_FragColor = c;
}
