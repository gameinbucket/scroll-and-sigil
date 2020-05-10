#version 330
uniform sampler2D u_texture0;
uniform vec3 u_camera_position;
const vec3 light_direction = vec3(0.5, 0.5, 0.0);
const vec3 light_color = vec3(1.0, 1.0, 1.0);
const vec3 light_ambient = vec3(0.5, 0.5, 0.5);
const float specular_strength = 0.5;
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
  vec3 view_direction = normalize(u_camera_position - v_position);
  vec3 reflect_direction = reflect(-light_direction, normal);  
  vec3 specular = specular_strength * pow(max(dot(view_direction, reflect_direction), 0.0), 32) * light_color;  
  vec3 diffuse = max(dot(normal, light_direction), 0.0) * light_color;
  pixel.rgb *= (light_ambient + diffuse + specular);
  color = pixel;
}
