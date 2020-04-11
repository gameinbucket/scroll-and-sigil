#ifndef GRAPHICS_H
#define GRAPHICS_H

#include <GL/glew.h>

#include <GL/gl.h>
#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "framebuffer.h"
#include "matrix.h"
#include "renderbuffer.h"

void graphics_make_fbo(framebuffer *f);
void graphics_make_vao(renderbuffer *b);

void graphics_update_vao(renderbuffer *b, GLuint draw_type);

void graphics_bind_fbo(GLint fbo);
void graphics_bind_vao(GLint vao);

void graphics_set_view(GLint x, GLint y, GLint width, GLint height);

void graphics_draw_range(void *start, GLsizei count);
void graphics_bind_and_draw(renderbuffer *b);
void graphics_update_and_draw(renderbuffer *b);

void graphics_enable_depth();
void graphics_disable_depth();

void graphics_enable_cull();
void graphics_disable_cull();

void graphics_clear_color();
void graphics_clear_color_and_depth();

#endif
