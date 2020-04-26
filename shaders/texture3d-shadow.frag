#version 330
uniform sampler2D u_texture0;
uniform sampler2D u_texture1;
const float bias = 0.005;
in vec2 v_texture;
in vec4 v_shadow;
layout (location = 0) out vec4 color;
void main() {
  // vec4 pixel = texture(u_texture0, v_texture);
  // if (pixel.a == 0.0) {
  //   discard;
  // }
  // if (texture(u_texture1, v_shadow.xy).r < v_shadow.z - bias) {
  //   pixel.rgb *= 0.5;
  // }
  // color = pixel;

  // vec4 pixel = texture(u_texture0, v_texture);
  // if (pixel.a == 0.0) {
  //   discard;
  // }
  // color = pixel;

  // float depth = texture(u_texture1, v_shadow.xy).r;
  // color = vec4(depth, depth, depth, 1.0);
  
  // color = vec4(v_shadow.xyz, 1.0);

  float value = 0.0;
  if (texture(u_texture1, v_shadow.xy).r < v_shadow.z - bias) {
    value = 1.0;
  }
  color = vec4(value, value, value, 1.0);
}
