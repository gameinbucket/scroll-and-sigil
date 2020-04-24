#version 330
uniform sampler2D u_texture0;
uniform sampler2D u_texture1;
in vec2 v_texture;
in vec4 v_shadow;
layout (location = 0) out vec4 color;
void main() {
  vec4 pixel = texture(u_texture0, v_texture);
  if (pixel.a == 0.0) {
    discard;
  }
  if (texture(u_texture1, v_shadow.xy).z < v_shadow.z) {
    pixel.rgb *= 0.5;
  }
  color = pixel;
}
