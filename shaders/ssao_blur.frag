#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 1, binding = 0) uniform sampler2D texture_ssao;

layout(set = 2, binding = 0) uniform UniformBuffer {
  float value;
} texel;

layout(location = 0) in vec2 in_texture;

layout(location = 0) out float out_color;

void main() {
  float sum = 0.0;

  sum += texture(texture_ssao, in_texture + vec2(-2, -2) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(-2, -1) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(-2, 0) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(-2, 1) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(-2, 2) * texel.value).r;

  sum += texture(texture_ssao, in_texture + vec2(-1, -2) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(-1, -1) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(-1, 0) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(-1, 1) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(-1, 2) * texel.value).r;

  sum += texture(texture_ssao, in_texture + vec2(0, -2) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(0, -1) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(0, 0) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(0, 1) * texel.value).r;
  sum += texture(texture_ssao, in_texture + vec2(0, 2) * texel.value).r;
  
  out_color = sum / 16.0;
}
