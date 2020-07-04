#ifndef IMAGE_READ_H
#define IMAGE_READ_H

#include <inttypes.h>
#include <png.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <zip.h>

#include "common/mem.h"
#include "graphics/image.h"
#include "io/archive.h"
#include "io/fileio.h"

simple_image *read_png_file(struct zip *z, char *path);

#endif
