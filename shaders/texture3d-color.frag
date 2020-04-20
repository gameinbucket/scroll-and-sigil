#version 330
uniform sampler2D u_texture0;
in vec3 v_color;
in vec2 v_texture;
layout (location = 0) out vec3 color;
void main() {
  vec4 pixel = texture(u_texture0, v_texture);
  if (pixel.a == 0.0) {
    discard;
  }
  color = pixel.rgb * v_color;
}
