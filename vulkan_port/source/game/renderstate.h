#ifndef RENDER_STATE_H
#define RENDER_STATE_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"
#include "rendering/shader.h"

typedef struct renderstate renderstate;

struct renderstate {
    int canvas_width;
    int canvas_height;
    shader **shaders;
};

renderstate *create_renderstate();

void delete_renderstate(renderstate *self);

#endif
