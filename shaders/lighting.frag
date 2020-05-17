#version 330

uniform sampler2D u_texture0; // albedo
uniform sampler2D u_texture1; // normal
uniform sampler2D u_texture2; // position
uniform sampler2D u_texture3; // ssao
uniform vec3 u_light_direction;

const vec3 light_color = vec3(1.0, 1.0, 1.0);
const vec3 light_ambient = vec3(1.2, 1.2, 1.2);

in vec2 v_texture;

layout (location = 0) out vec3 color;

vec3 decode_normal(vec2 normal) {
  return vec3(normal.xy, sqrt(1 - dot(normal.xy, normal.xy)));
}

void main() {
  // vec3 albedo = texture(u_texture0, v_texture).rgb;
  // vec3 normal = normalize(decode_normal(texture(u_texture1, v_texture).rg));
  // vec3 position = texture(u_texture2, v_texture).rgb;
  // float ssao = texture(u_texture3, v_texture).r;
  // vec3 diffuse = max(dot(normal, u_light_direction), 0.0) * albedo * light_color;
  // color = vec3(0.3 * albedo * ssao) + diffuse;

  vec3 albedo = texture(u_texture0, v_texture).rgb;
  float ssao = texture(u_texture3, v_texture).r;
  color = vec3(albedo * ssao);
}
