#ifndef IMAGE_H
#define IMAGE_H

#include <inttypes.h>
#include <png.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <zip.h>

#include "core/archive.h"
#include "core/fileio.h"
#include "core/mem.h"

typedef struct simple_image simple_image;

struct simple_image {
    int width;
    int height;
    void *pixels;
};

simple_image *read_png_file(struct zip *z, char *path);
void simple_image_free(simple_image *self);

#endif
