#ifndef RASTER_H
#define RASTER_H

#include <inttypes.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

struct raster {
    unsigned int width;
    unsigned int height;
    uint32_t *pixels;
};

size_t raster_pixel_size_t(struct raster *raster);

void raster_clear(struct raster *raster);
void raster_set(struct raster *raster, unsigned int index, uint32_t rgba);

struct raster *new_raster(unsigned int width, unsigned int height);
void delete_raster(struct raster *raster);

#endif
