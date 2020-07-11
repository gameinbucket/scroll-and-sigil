#ifndef IMAGE_H
#define IMAGE_H

#include <inttypes.h>
#include <png.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "common/mem.h"

typedef struct image_pixels image_pixels;
typedef struct image_details image_details;

struct image_pixels {
    int width;
    int height;
    void *pixels;
};

struct image_details {
    int width;
    int height;
};

void delete_image_pixels(image_pixels *self);

#endif
