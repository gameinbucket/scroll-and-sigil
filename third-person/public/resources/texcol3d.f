#version 300 es
precision mediump float;
uniform sampler2D u_texture0;
in vec3 v_color;
in vec2 v_texture;
out vec4 color;
void main()
{
    vec4 pixel = texture(u_texture0, v_texture);
    if (pixel.a == 0.0)
    {
        discard;
    }
    color = vec4(pixel.rgb * v_color, 1.0);
}
