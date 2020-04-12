#ifndef WORLD_H
#define WORLD_H

#include "core/mem.h"
#include "graphics/renderbuffer.h"
#include "things/hero.h"
#include "things/thing.h"

typedef struct world world;

struct world {
    char *name;
    int width;
    int height;
    int length;
    int *blocks;
    int thing_cap;
    int thing_count;
    thing **things;
};

world *world_init();

void world_add_thing(world *self, thing *t);
void world_remove_thing(world *self, thing *t);
void world_load_map(world *self);
void world_update(world *self);

#endif
