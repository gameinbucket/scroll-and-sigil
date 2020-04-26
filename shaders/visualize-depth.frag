#version 330
// #define PERSPECTIVE
uniform sampler2D u_texture0;
#ifdef PERSPECTIVE
const float near = 0.01;
const float far = 100.0;
#endif
in vec2 v_texture;
layout (location = 0) out vec4 color;
void main() {
#ifdef PERSPECTIVE
  float depth = texture(u_texture0, v_texture).x;
  float eye = near * far / (depth * (far - near) - far);
  float value = (eye + near) / (-far  + near);
  color = vec4(value, value, value, 1);
#else
  float depth = texture(u_texture0, v_texture).x;
  color = vec4(depth, depth, depth, 1);
#endif
}
