#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 1, binding = 0) uniform sampler2D texture_color;
layout(set = 1, binding = 1) uniform sampler2D texture_normal;
layout(set = 1, binding = 2) uniform sampler2D texture_position;
layout(set = 1, binding = 3) uniform sampler2D texture_ssao;

layout(set = 2, binding = 0) uniform UniformBufferLight {
  vec3 value;
} light_direction;

const vec3 light_color = vec3(1.0, 1.0, 1.0);
const vec3 light_ambient = vec3(1.2, 1.2, 1.2);

layout(location = 0) in vec2 in_texture;

layout(location = 0) out vec3 out_color;

vec3 decode_normal(vec2 normal) {
  return vec3(normal.xy, sqrt(1 - dot(normal.xy, normal.xy)));
}

void main() {
  // vec3 albedo = texture(texture_color, in_texture).rgb;
  // vec3 normal = normalize(decode_normal(texture(texture_normal, in_texture).rg));
  // vec3 position = texture(texture_position, in_texture).rgb;
  // float ssao = texture(texture_ssao, in_texture).r;
  // vec3 diffuse = max(dot(normal, light_direction.value), 0.0) * albedo * light_color;
  // color = vec3(0.3 * albedo * ssao) + diffuse;

  vec3 albedo = texture(texture_color, in_texture).rgb;
  float ssao = texture(texture_ssao, in_texture).r;
  
  out_color = vec3(albedo * ssao);
}
