#include "world.h"

world *world_init() {
    return safe_calloc(1, sizeof(world));
}

void world_load_map(world *self) {

    int width = 8;
    int height = 8;
    int length = 8;

    self->width = width;
    self->height = height;
    self->length = length;

    int slice = width * height;
    int all = slice * length;

    int bx = 0;
    int by = 0;
    int bz = 0;

    int *blocks = self->blocks;

    for (int i = 0; i < all; i++) {
        if (by == 0) {
            blocks[i] = 1;
        } else {
            blocks[i] = 0;
        }
        bx++;
        if (bx == width) {
            bx = 0;
            by++;
            if (by == height) {
                by = 0;
                bz++;
            }
        }
    }
}

void world_update(world *self) {
    int size = self->thing_count;
    for (int i = 0; i < size; i++) {
        thing_update(self->things[i]);
    }
}
