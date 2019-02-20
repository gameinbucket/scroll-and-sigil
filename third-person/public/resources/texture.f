#version 300 es
precision mediump float;
uniform sampler2D u_texture0;         
in vec2 v_texture;
out vec4 pixel;
void main()
{
  pixel = texture(u_texture0, v_texture);
}