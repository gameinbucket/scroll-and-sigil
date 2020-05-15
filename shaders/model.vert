#version 330
uniform mat4 u_mvp;
uniform mat4 u_normal;
uniform mat4 u_bones[11];
layout (location = 0) in vec3 a_position;
layout (location = 1) in vec2 a_texture;
layout (location = 2) in vec3 a_normal;
layout (location = 3) in float a_bone;
out vec3 v_position;
out vec2 v_texture;
out vec3 v_normal;
void main() {
  int index = int(a_bone);
  vec4 vertex = u_bones[index] * vec4(a_position, 1.0);
  vec4 normal = u_bones[index] * vec4(a_normal, 0.0);
  v_position = vertex.xyz;
  v_texture = a_texture;
  v_normal = (u_normal * normal).xyz;
  gl_Position = u_mvp * vertex;
}
