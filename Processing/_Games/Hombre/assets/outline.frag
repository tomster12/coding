
// https://github.com/genekogan/Processing-Shader-Examples/blob/master/TextureShaders/data/pixelate.glsl

#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec4 vertTexCoord;
uniform sampler2D texture;

uniform vec2 u_grid_size;
uniform vec4 u_outline_color;
uniform bool u_include_corners;

void main(void)
{
  	vec2 p = vertTexCoord.st;
	vec4 c = texture2D(texture, p);

    if (c.a > 0.0)
    {
        gl_FragColor = c;
        return;
    }

    bool hasEdge = false;
    hasEdge = hasEdge || (texture2D(texture, vec2(p.x + u_grid_size.x, p.y                )).a != 0.0);
    hasEdge = hasEdge || (texture2D(texture, vec2(p.x,                 p.y - u_grid_size.y)).a != 0.0);
    hasEdge = hasEdge || (texture2D(texture, vec2(p.x - u_grid_size.x, p.y                )).a != 0.0);
    hasEdge = hasEdge || (texture2D(texture, vec2(p.x,                 p.y + u_grid_size.y)).a != 0.0);
    if(u_include_corners)
    {
        hasEdge = hasEdge || texture2D(texture, vec2(p.x + u_grid_size.x, p.y - u_grid_size.y)).a != 0.0;
        hasEdge = hasEdge || texture2D(texture, vec2(p.x + u_grid_size.x, p.y + u_grid_size.y)).a != 0.0;
        hasEdge = hasEdge || texture2D(texture, vec2(p.x - u_grid_size.x, p.y - u_grid_size.y)).a != 0.0;
        hasEdge = hasEdge || texture2D(texture, vec2(p.x - u_grid_size.x, p.y + u_grid_size.y)).a != 0.0;
    }
    
    if (hasEdge) gl_FragColor = u_outline_color;
    else gl_FragColor = c;
}
