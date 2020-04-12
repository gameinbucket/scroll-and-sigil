#ifndef CAMERA_H
#define CAMERA_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"

struct camera {
    float x;
    float y;
    float z;
    float rx;
    float ry;
    float radius;
};

typedef struct camera camera;

camera *camera_init();
void camera_update();

#endif
