
#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

varying vec4 vertTexCoord;
uniform sampler2D texture;

uniform vec2 u_sprite_size;
uniform vec4 u_outline_color;
uniform bool u_include_corners;

float texelSizeX = 1.0 / u_sprite_size.x;
float texelSizeY = 1.0 / u_sprite_size.y;


void main(void)
{
  	vec2 p = vertTexCoord.st;
	vec4 c = texture2D(texture, p);

    float weight = 
        texture2D(texture, vec2(p.x + texelSizeX, p.y)).a *
        texture2D(texture, vec2(p.x,              p.y - texelSizeY)).a *
        texture2D(texture, vec2(p.x - texelSizeX, p.y)).a *
        texture2D(texture, vec2(p.x,              p.y + texelSizeY)).a;

    if(u_include_corners) {
        weight *=
            texture2D(texture, vec2(p.x + texelSizeX, p.y - texelSizeY)).a *
            texture2D(texture, vec2(p.x + texelSizeX, p.y + texelSizeY)).a *
            texture2D(texture, vec2(p.x - texelSizeX, p.y - texelSizeY)).a *
            texture2D(texture, vec2(p.x - texelSizeX, p.y + texelSizeY)).a;
    }

	// if (c.a < 0.02) discard;
    gl_FragColor = vec4(c.a, c.a, c.a, 1.0);
    // gl_FragColor = c;
}
