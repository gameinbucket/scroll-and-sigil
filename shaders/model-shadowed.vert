#version 330
uniform mat4 u_mvp;
layout (location = 0) in vec3 a_position;
layout (location = 1) in vec2 a_texture;
layout (location = 2) in vec3 a_normal;
out vec2 v_texture;
out vec3 v_normal;
void main() {
  v_texture = a_texture;
  v_normal = a_normal;
  gl_Position = u_mvp * vec4(a_position, 1.0);
}
