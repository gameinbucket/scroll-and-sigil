#ifndef CAMERA_H
#define CAMERA_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "core/mem.h"
#include "world/world.h"

typedef struct camera camera;

struct camera {
    float x;
    float y;
    float z;
    float rx;
    float ry;
    float radius;
    thing *target;
};

camera *create_camera(float radius);
void camera_update(camera *self);

#endif
