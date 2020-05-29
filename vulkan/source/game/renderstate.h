#ifndef RENDER_STATE_H
#define RENDER_STATE_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

typedef struct renderstate renderstate;

struct renderstate {
    int canvas_width;
    int canvas_height;
};

renderstate *create_renderstate();

void delete_renderstate(renderstate *self);

#endif
