#version 330
uniform mat4 u_mvp;
uniform mat4 u_bones[11];
layout (location = 0) in vec3 a_position;
layout (location = 3) in float a_bone;
void main() {
  int index = int(a_bone);
  vec4 vertex = u_bones[index] * vec4(a_position, 1.0);
  gl_Position = u_mvp * vertex;
}
