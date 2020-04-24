#version 330
uniform mat4 u_mvp;
uniform mat4 u_depth_bias_mvp;
layout (location = 0) in vec3 a_position;
layout (location = 1) in vec2 a_texture;
out vec2 v_texture;
out vec4 v_shadow;
void main() {
  v_texture = a_texture;
  v_shadow = u_depth_bias_mvp * vec4(a_position, 1.0);
  gl_Position = u_mvp * vec4(a_position, 1.0);
}
