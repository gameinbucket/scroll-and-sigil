#version 300 es
uniform mat4 u_mvp;
layout(location = 0) in vec2 a_position;
layout(location = 1) in vec3 a_color;
layout(location = 2) in vec2 a_texture;
out vec3 v_color;
out vec2 v_texture;
void main() {
  v_color = a_color;
  v_texture = a_texture;
  gl_Position = u_mvp * vec4(a_position, 0.0, 1.0);
}