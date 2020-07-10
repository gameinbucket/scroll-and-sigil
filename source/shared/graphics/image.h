#ifndef IMAGE_H
#define IMAGE_H

#include <inttypes.h>
#include <png.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "common/mem.h"

typedef struct simple_image simple_image;
typedef struct image_details image_details;

struct simple_image {
    int width;
    int height;
    void *pixels;
};

struct image_details {
    int width;
    int height;
};

void simple_image_free(simple_image *self);

#endif
