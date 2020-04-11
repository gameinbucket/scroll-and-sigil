#ifndef SPRITE_H
#define SPRITE_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

struct sprite {
    int *atlas;
    float width;
    float half_width;
    float height;
    float left;
    float top;
    float right;
    float bottom;
    float offset_x;
    float offset_y;
};

typedef struct sprite sprite;

void simple_sprite(float *sprite, float left, float top, float width, float height, float atlas_width, float atlas_height);
sprite *sprite_init(int *atlas, int atlas_width, int atlas_height, bool offset);

#endif
