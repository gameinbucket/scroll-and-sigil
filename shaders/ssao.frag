#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 1, binding = 0) uniform sampler2D texture_normal; 
layout(set = 1, binding = 1) uniform sampler2D texture_position;
layout(set = 1, binding = 2) uniform sampler2D texture_noise;

layout(set = 2, binding = 0) uniform UniformBufferOcclusion {
  vec3 samples[64];
  mat4 projection;
  vec2 texel;
  vec2 noise_scale;
} ssao;

const float radius = 0.5;
const float bias = 0.025;
const int kernel_size = 64;

layout(location = 0) in vec2 in_texture;

layout(location = 0) out float out_color;

vec3 decode_normal(vec2 normal) {
  return vec3(normal.xy, sqrt(1 - dot(normal.xy, normal.xy)));
}

void main() {

  vec3 position = texture(texture_position, in_texture).rgb;
  vec3 normal = normalize(decode_normal(texture(texture_normal, in_texture).rg));
  vec3 random_vec = normalize(texture(texture_noise, in_texture * ssao.noise_scale).rgb);
  vec3 tangent = normalize(random_vec - normal * dot(random_vec, normal));
  vec3 bitangent = cross(normal, tangent);
  mat3 tbn = mat3(tangent, bitangent, normal);
  float occlusion = 0.0;
  for (int i = 0; i < kernel_size; i++) {
    vec3 value = position + (tbn * ssao.samples[i]) * radius;
    vec4 offset = ssao.projection * vec4(value, 1.0);
    offset.xyz /= offset.w; 
    offset.xyz = offset.xyz * 0.5 + 0.5;
    float sample_depth = texture(texture_position, offset.xy).z;
    float range_check = smoothstep(0.0, 1.0, radius / abs(position.z - sample_depth));
    occlusion += (sample_depth >= value.z + bias ? 1.0 : 0.0) * range_check;           
  }
  out_color = 1.0 - (occlusion / kernel_size);
}
