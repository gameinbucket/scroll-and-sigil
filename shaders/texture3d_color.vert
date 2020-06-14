#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 0, binding = 0) uniform UniformBufferObject {
    mat4 mvp;
} ubo;

layout(location = 0) in vec3 in_position;
layout(location = 1) in vec3 in_color;
layout(location = 2) in vec2 in_texture;

layout(location = 0) out vec3 out_color;
layout(location = 1) out vec2 out_texture;

void main() {
    gl_Position = ubo.mvp * vec4(in_position, 1.0);
    out_color = in_color;
    out_texture = in_texture;
}
