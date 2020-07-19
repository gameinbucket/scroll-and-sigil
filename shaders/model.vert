#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 0, binding = 0) uniform UniformBufferNormal {
    mat4 mvp;
    mat4 normal;
} ubo;

layout(set = 2, binding = 0) uniform UniformBufferBones {
    mat4 matrix[11];
} bones;

layout(location = 0) in vec3 in_position;
layout(location = 1) in vec2 in_texture;
layout(location = 2) in vec3 in_normal;
layout(location = 3) in float in_bone;

layout(location = 0) out vec3 out_position;
layout(location = 1) out vec2 out_texture;
layout(location = 2) out vec3 out_normal;

void main() {
    int index = int(in_bone);
    vec4 vertex = bones.matrix[index] * vec4(in_position, 1.0);
    vec4 normal = bones.matrix[index] * vec4(in_normal, 0.0);
    out_position = vertex.xyz;
    out_texture = in_texture;
    out_normal = (ubo.normal * normal).xyz;
    gl_Position = ubo.mvp * vertex;
}
