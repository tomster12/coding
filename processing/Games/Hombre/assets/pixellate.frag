
// https://gist.github.com/Leland-Kwong/40edb57c87c0755eb7f5ba6f65d9c484
// https://github.com/cukiakimani/shaders-yo/blob/master/Assets/Sprite%20Outline/Shaders/SpriteOutline.shader
// https://www.shadertoy.com/view/4dVGzW

#ifdef GL_ES
precision highp float;
precision highp int;
#endif

varying vec4 vertTexCoord;
uniform sampler2D texture;

uniform vec2 u_uv_offset;
uniform vec2 u_grid_size;

vec2 one = vec2(1);

void main(void)
{
	vec2 uv = vertTexCoord.st;

	vec2 l_uv = uv - u_uv_offset + one;
	vec2 lr_uv = floor(l_uv * u_grid_size) / u_grid_size;
	vec2 r_uv = lr_uv + u_uv_offset - one;

	// vec4 c = texture2D(texture, r_uv).rgba;
	// vec4 c = texture2D(texture, r_uv, -100.).rgba;
	// vec4 c = texture2DLodEXT(texture, r_uv, 0.0).rgba;
	vec4 c = textureGrad(texture, r_uv, dFdx(uv), dFdy(uv)).rgba;

	if (c.a == 0.0) discard;
	gl_FragColor = vec4(c.r, c.g, c.b, 1.0);
	// gl_FragColor = texture2D(texture, uv);
}
