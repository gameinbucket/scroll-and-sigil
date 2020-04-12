#ifndef SPRITE_H
#define SPRITE_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

extern const float sprite_scale;

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

void simple_sprite(float *sprite, float left, float top, float width, float height, float atlas_width, float atlas_height);
sprite *sprite_init(int *atlas, int atlas_width, int atlas_height, bool offset, float scale);

#endif
