#version 450
#extension GL_ARB_separate_shader_objects : enable

layout(set = 1, binding = 0) uniform sampler2D texture_sampler;

layout(location = 0) in vec2 in_texture;

layout(location = 0) out vec4 out_color;

#define PERSPECTIVE
#ifdef PERSPECTIVE
const float near = 0.01;
const float far = 100.0;
#endif

void main() {
   #ifdef PERSPECTIVE
   float depth = texture(texture_sampler, in_texture).x;
   float eye = near * far / (depth * (far - near) - far);
   float value = (eye + near) / (-far  + near);
   out_color = vec4(value, value, value, 1);
   #else
   float depth = texture(texture_sampler, in_texture).x;
   out_color = vec4(depth, depth, depth, 1);
   #endif
}
