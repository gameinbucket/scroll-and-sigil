#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 1, binding = 0) uniform sampler2D texture_sampler;

layout(location = 0) in vec3 in_position;
layout(location = 1) in vec2 in_texture;
layout(location = 2) in vec3 in_normal;

layout(location = 0) out vec4 out_color;
layout(location = 1) out vec4 out_normal;
layout(location = 2) out vec4 out_position;

void main() {
  vec4 pixel = texture(texture_sampler, in_texture);
  if (pixel.a == 0.0) {
    discard;
  }
  out_color = pixel;
  out_position = vec4(in_position, 0.0);
  out_normal = vec4(in_normal, 0.0);
}


