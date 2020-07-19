#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 1, binding = 0) uniform sampler2D texture_ssao;

layout(push_constant) uniform PushConstants {
  float value;
} texel;

layout(location = 0) in vec2 in_texture;

layout(location = 0) out float out_color;

void main() {
  float sum = 0.0;
  for (int x = -2; x < 2; x++) {
    for (int y = -2; y < 2; y++) {
      sum += texture(texture_ssao, in_texture + vec2(x, y) * texel.value).r;
    }
  }
  out_color = sum / 16.0;
}
