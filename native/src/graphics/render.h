#ifndef RENDER_H
#define RENDER_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "renderbuffer.h"
#include "sprite.h"

void render_index3(renderbuffer *b);
void render_index4(renderbuffer *b);

void render_screen(renderbuffer *b, float x, float y, float width, float height);
void render_image(renderbuffer *b, float x, float y, float width, float height, float left, float top, float right, float bottom);
void render_rectangle(renderbuffer *b, float x, float y, float width, float height, float red, float green, float blue);

void render_sprite3d(renderbuffer *b, float x, float y, float z, float sine, float cosine, sprite *s);

void render_cube_positive_x(renderbuffer *b, float x, float y, float z, float *color, float *texture);

#endif
