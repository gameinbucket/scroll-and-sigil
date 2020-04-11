#ifndef WORLD_H
#define WORLD_H

#include "core/mem.h"

#include "things/thing.h"

struct world {
    char *map_name;
    int thing_count;
    thing **things;
};

typedef struct world world;

world *world_init();
void world_update(world *self);

#endif
