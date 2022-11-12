
#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec4 vertTexCoord;
uniform sampler2D texture;

uniform vec2 u_offset;
uniform vec2 u_pixels;

void main(void)
{
  	vec2 p = vertTexCoord.st;

	p.x -= mod(1 + p.x - u_offset.x, 1.0 / u_pixels.x);
	p.y -= mod(1 + p.y + u_offset.y, 1.0 / u_pixels.y);

	vec4 col = texture2D(texture, p).rgba;
	
	if (col.a < 1.0) discard;
	gl_FragColor = col;
}


// float pct_x = p.x - u_offset.x;
// float pct_y = p.y - u_offset.y;
// float pct_mod_x = mod(pct_x, 1.0 / u_pixels.x);
// float pct_mod_y = mod(pct_y, 1.0 / u_pixels.y);
// float pct_mod_x_tmp = pct_mod_x / (1.0 / u_pixels.x);
// float pct_mod_y_tmp = pct_mod_y / (1.0 / u_pixels.y);
// gl_FragColor = vec4(pct_mod_x_tmp);
// gl_FragColor = vec4(pct_mod_y_tmp);
