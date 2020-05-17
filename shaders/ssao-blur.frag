#version 330

uniform sampler2D u_texture0;
uniform float texel;

in vec2 v_texture;

layout (location = 0) out float color;

void main() {
  float sum = 0.0;
  for (int x = -2; x < 2; x++) {
    for (int y = -2; y < 2; y++) {
      sum += texture(u_texture0, v_texture + vec2(x, y) * texel).r;
    }
  }
  color = sum / 16.0;
}
