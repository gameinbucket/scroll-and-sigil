#ifndef GRAPHICS_H
#define GRAPHICS_H

#include <GL/glew.h>

#include <GL/gl.h>
#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "framebuffer.h"
#include "matrix.h"
#include "renderbuffer.h"

void graphics_make_fbo(framebuffer *f);
void graphics_make_vao(renderbuffer *b);

void graphics_set_orthographic(float *orthographic, float x, float y, float *mvp, float *mv);
void graphics_set_perspective(float *perspective, float x, float y, float z, float rx, float ry, float *mvp, float *mv);

void graphics_bind_fbo(GLint fbo);
void graphics_bind_vao(GLint vao);

void graphics_set_view(GLint x, GLint y, GLint width, GLint height);
void graphics_set_mvp(GLint program, float *mvp);

void graphics_draw_range(void *start, GLsizei count);
void graphics_update_and_draw(renderbuffer *b);

#endif
