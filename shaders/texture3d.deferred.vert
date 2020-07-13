#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 0, binding = 0) uniform UniformBufferObject {
    mat4 mvp;
} ubo;

layout(location = 0) in vec3 in_position;
layout(location = 1) in vec2 in_texture;
layout(location = 2) in vec3 in_normal;

layout(location = 0) out vec3 out_position;
layout(location = 1) out vec2 out_texture;
layout(location = 2) out vec3 out_normal;

void main() {
    vec4 vertex = ubo.mvp * vec4(in_position, 1.0);
    gl_Position = vertex;
    out_position = vertex.xyz;
    out_texture = in_texture;
    out_normal = in_normal;
}
