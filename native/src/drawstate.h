#ifndef DRAW_STATE_H
#define DRAW_STATE_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "graphics/framebuffer.h"
#include "graphics/renderbuffer.h"

struct drawstate {
    renderbuffer *screen;
    framebuffer *frame;
};

typedef struct drawstate drawstate;

#endif
