#version 330
uniform sampler2D u_texture0;
uniform vec3 u_camera_position;
uniform vec3 u_light_direction;
const vec3 light_color = vec3(1.0, 1.0, 1.0);
const vec3 light_ambient = vec3(1.2, 1.2, 1.2);
const float specular_strength = 0.5;
const float shine = 32.0;
in vec3 v_position;
in vec2 v_texture;
in vec3 v_normal;
layout (location = 0) out vec4 color;
void main() {
  vec4 pixel = texture(u_texture0, v_texture);
  if (pixel.a == 0.0) {
    discard;
  }
  vec3 normal = normalize(v_normal);
  // vec3 view_direction = normalize(u_camera_position - v_position);
  // vec3 halfway_direction = normalize(u_light_direction + view_direction);
  // vec3 specular = specular_strength * pow(max(dot(normal, halfway_direction), 0.0), shine) * light_color;  
  vec3 diffuse = max(dot(normal, u_light_direction), 0.0) * light_color;
  // pixel.rgb *= (light_ambient + diffuse + specular);
  pixel.rgb *= (light_ambient + diffuse);
  color = pixel;
}
