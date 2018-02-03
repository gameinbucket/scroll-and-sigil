#version 300 es
precision mediump float;
uniform mediump sampler2DArray u_texture0;       
in vec3 v_texture;
out vec4 pixel;
void main()
{
  pixel = texture(u_texture0, v_texture);
}