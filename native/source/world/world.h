#ifndef WORLD_H
#define WORLD_H

#include "core/mem.h"
#include "graphics/renderbuffer.h"
#include "map/sector.h"
#include "things/hero.h"
#include "things/thing.h"

typedef struct world world;

struct world {
    char *name;
    int width;
    int height;
    int length;
    int *blocks;
    thing **things;
    int thing_cap;
    int thing_count;
    sector **sectors;
    int sector_cap;
    int sector_count;
};

world *world_init();

void world_add_thing(world *self, thing *t);
void world_remove_thing(world *self, thing *t);
void world_add_sector(world *self, sector *s);
void world_load_map(world *self);
void world_update(world *self);

#endif
