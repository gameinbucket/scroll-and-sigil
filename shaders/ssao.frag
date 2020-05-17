#version 330

uniform sampler2D u_texture0; // normal
uniform sampler2D u_texture1; // position
uniform sampler2D u_texture2; // noise
uniform vec3 samples[64];
uniform mat4 projection;
uniform vec2 texel;
uniform vec2 noise_scale;

const float radius = 0.5;
const float bias = 0.025;
const int kernel_size = 64;

in vec2 v_texture;

layout (location = 0) out float color;

vec3 decode_normal(vec2 normal) {
  return vec3(normal.xy, sqrt(1 - dot(normal.xy, normal.xy)));
}

void main() {

  vec3 position = texture(u_texture1, v_texture).rgb;
  vec3 normal = normalize(decode_normal(texture(u_texture0, v_texture).rg));
  vec3 random_vec = normalize(texture(u_texture2, v_texture * noise_scale).rgb);
  vec3 tangent = normalize(random_vec - normal * dot(random_vec, normal));
  vec3 bitangent = cross(normal, tangent);
  mat3 tbn = mat3(tangent, bitangent, normal);
  float occlusion = 0.0;
  for (int i = 0; i < kernel_size; i++) {
    vec3 sample = position + (tbn * samples[i]) * radius;
    vec4 offset = projection * vec4(sample, 1.0);
    offset.xyz /= offset.w; 
    offset.xyz = offset.xyz * 0.5 + 0.5;
    float sample_depth = texture(u_texture1, offset.xy).z;
    float range_check = smoothstep(0.0, 1.0, radius / abs(position.z - sample_depth));
    occlusion += (sample_depth >= sample.z + bias ? 1.0 : 0.0) * range_check;           
  }
  color = 1.0 - (occlusion / kernel_size);
}
