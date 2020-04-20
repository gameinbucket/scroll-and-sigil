#version 330
uniform sampler2D u_texture0;         
in vec2 v_texture;
layout (location = 0) out vec4 color;
void main() {
  color = texture(u_texture0, v_texture);
}
