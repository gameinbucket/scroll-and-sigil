#ifndef CAMERA_H
#define CAMERA_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

struct camera {
    float radius;
    float x;
    float y;
    float z;
    float rx;
    float ry;
};

typedef struct camera camera;

void camera_init();
void camera_update();

#endif
