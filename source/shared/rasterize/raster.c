#include "raster.h"

size_t raster_pixel_size_t(struct raster *raster) {
    return raster->width * raster->height * sizeof(uint32_t);
}

void raster_clear(struct raster *raster) {
    memset(raster->pixels, 0, raster_pixel_size_t(raster));
}

void raster_set(struct raster *raster, unsigned int index, uint32_t rgba) {
    raster->pixels[index] = rgba;
}

struct raster *new_raster(unsigned int width, unsigned int height) {
    struct raster *raster = safe_calloc(1, sizeof(struct raster));
    raster->width = width;
    raster->height = height;
    raster->pixels = safe_calloc(1, raster_pixel_size_t(raster));
    return raster;
}

void delete_raster(struct raster *raster) {
    free(raster->pixels);
    free(raster);
}
