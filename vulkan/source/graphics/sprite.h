#ifndef SPRITE_H
#define SPRITE_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

typedef struct sprite sprite;

struct sprite {
    float width;
    float height;
    float half_width;
    float left;
    float top;
    float right;
    float bottom;
    float offset_x;
    float offset_y;
};

void simple_sprite(float *out, float left, float top, float width, float height, float atlas_inverse_width, float atlas_inverse_height);
sprite *create_sprite(int left, int top, int width, int height, int offset_x, int offset_y, float atlas_inverse_width, float atlas_inverse_height, float scale);

#endif
