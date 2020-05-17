#version 330
uniform mat4 u_mvp;
uniform mat4 u_view;
uniform mat4 u_normal;
uniform mat4 u_depth_bias_mvp;
layout (location = 0) in vec3 a_position;
layout (location = 1) in vec2 a_texture;
layout (location = 2) in vec3 a_normal;
out vec3 v_shadow;
out vec3 v_position;
out vec3 v_fragment_position;
out vec2 v_texture;
out vec3 v_normal;
void main() {
  vec4 position = vec4(a_position, 1.0);
  v_position = a_position;
  v_shadow = (u_depth_bias_mvp * position).xyz;
  v_fragment_position = (u_view * position).xyz;
  v_texture = a_texture;
  v_normal = (u_normal * vec4(a_normal, 0.0)).xyz;
  gl_Position = u_mvp * position;
}
