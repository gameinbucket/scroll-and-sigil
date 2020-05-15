#version 330
uniform sampler2D u_texture0;
uniform sampler2D u_texture1;
uniform vec3 u_camera_position;
uniform vec3 u_light_direction;
const float bias = 0.005;
const vec3 light_color = vec3(1.0, 1.0, 1.0);
const vec3 light_ambient = vec3(1.2, 1.2, 1.2);
const float specular_strength = 0.5;
const float shine = 32.0;
in vec4 v_shadow;
in vec3 v_position;
in vec2 v_texture;
in vec3 v_normal;
layout (location = 0) out vec4 color;
void main() {
  vec4 pixel = texture(u_texture0, v_texture);
  if (pixel.a == 0.0) {
    discard;
  }

  // float shadow;
  // if (v_shadow.z > 1.0) {
  //   shadow = 0.0;
  // } else  if (texture(u_texture1, v_shadow.xy).r < v_shadow.z - bias) {
  //   shadow = 0.1;
  // } else {
  //   shadow = 1.0;
  // }

  float shadow = 0.0;
  float current_depth = v_shadow.z;
  
  if (current_depth <= 1.0) {
    vec2 texel_size = 1.0 / textureSize(u_texture1, 0);
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        float pcf = texture(u_texture1, v_shadow.xy + vec2(x, y) * texel_size).r; 
        shadow += current_depth - bias > pcf ? 1.0 : 0.0;        
      }    
    }
    shadow = 1.0 - (shadow / 9.0);
  }

  vec3 normal = normalize(v_normal);
  // vec3 view_direction = normalize(u_camera_position - v_position);
  // vec3 halfway_direction = normalize(u_light_direction + view_direction);
  // vec3 specular = specular_strength * pow(max(dot(normal, halfway_direction), 0.0), shine) * light_color;  
  vec3 diffuse = max(dot(normal, u_light_direction), 0.0) * light_color;
  // pixel.rgb *= (light_ambient + (diffuse + specular) * shadow);

  color = vec4(pixel.rgb * (light_ambient + diffuse * shadow), 1.0);
}
