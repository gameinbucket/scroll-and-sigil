#version 300 es
precision mediump float;
uniform sampler2D u_texture0;
in vec3 v_color;
in vec2 v_texture;
out vec4 pixel;
void main() {
  vec4 color = texture(u_texture0, v_texture);
  if (color.a == 0.0)
    discard;
  pixel = vec4(v_color, 1.0) * color;
}