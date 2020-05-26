#ifndef RENDER_H
#define RENDER_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "graphics/cube.h"
#include "graphics/model.h"
#include "graphics/sprite.h"

#include "renderbuffer.h"

void render_index3(renderbuffer *b);
void render_index4(renderbuffer *b);

void render_screen(renderbuffer *b, float x, float y, float width, float height);
void render_image(renderbuffer *b, float x, float y, float width, float height, float left, float top, float right, float bottom);
void render_colored_image(renderbuffer *b, float x, float y, float width, float height, float left, float top, float right, float bottom, float red, float green, float blue);
void render_rectangle(renderbuffer *b, float x, float y, float width, float height, float red, float green, float blue, float alpha);

void render_text(renderbuffer *b, int x, int y, string *text, int scale, float red, float green, float blue);

void render_sprite(renderbuffer *b, float x, float y, float z, sprite *s, float sine, float cosine);
void render_aligned_sprite(renderbuffer *b, float x, float y, float z, sprite *s, float *view);

void translate_vertices(float *vertices, unsigned int count, unsigned int stride, float x, float y, float z);
void rotate_vertices_x(float *vertices, unsigned int count, unsigned int stride, float sine, float cosine);
void rotate_vertices_y(float *vertices, unsigned int count, unsigned int stride, float sine, float cosine);

#endif
