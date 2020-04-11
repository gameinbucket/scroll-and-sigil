#ifndef WORLD_H
#define WORLD_H

#include "core/mem.h"
#include "graphics/renderbuffer.h"
#include "things/thing.h"

struct world {
    char *map_name;
    int thing_count;
    thing **things;
    int width;
    int height;
    int length;
    int *blocks;
};

typedef struct world world;

world *world_init();
void world_load_map(world *self);
void world_update(world *self);

#endif
