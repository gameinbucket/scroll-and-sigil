#version 330

uniform sampler2D u_texture0;
uniform float texel;

const float weight[5] = float[] (
    0.2270270270, 0.1945945946, 0.1216216216, 0.0540540541, 0.0162162162
);

in vec2 v_texture;

layout (location = 0) out vec3 color;

void main() {
  vec3 pixel = texture(u_texture0, v_texture).rgb * weight[0]; 
  for (int i = 1; i < 5; i++) {
    pixel += texture(u_texture0, v_texture + vec2(texel * i, 0.0)).rgb * weight[i];
    pixel += texture(u_texture0, v_texture - vec2(texel * i, 0.0)).rgb * weight[i];
  }
  color = pixel;
}
