#ifndef IMAGE_SYSTEM_H
#define IMAGE_SYSTEM_H

#include <inttypes.h>
#include <math.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>

#include "common/mem.h"
#include "data/table.h"

#include "image.h"

typedef struct image_system image_system;

struct image_system {
    table *images;
};

image_system *create_image_system();
void image_system_add_image(image_system *self, char *name, image_details *info);
image_details *image_system_get_image(image_system *self, char *name);
void delete_image_system(image_system *self);

#endif
