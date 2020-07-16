#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 1, binding = 0) uniform sampler2D texture_sampler;

layout(location = 0) in vec3 in_color;
layout(location = 1) in vec2 in_texture;

layout(location = 0) out vec4 out_color;
layout(location = 1) out vec4 out_normal;
layout(location = 2) out vec4 out_position;

void main() {
   vec4 texel = texture(texture_sampler, in_texture);
   out_color = vec4(in_color * texel.rgb, 1.0);
}


