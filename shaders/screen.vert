#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 0, binding = 0) uniform UniformBuffer {
    mat4 mvp;
} ubo;

layout(location = 0) in vec2 in_position;

layout(location = 0) out vec2 out_texture;

void main() {
  vec4 position = ubo.mvp * vec4(in_position, 0.0, 1.0);
  out_texture = position.xy * 0.5 + 0.5;
  gl_Position = position;
}
