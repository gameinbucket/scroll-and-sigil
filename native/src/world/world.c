#include "world.h"

world *world_init() {
    return safe_calloc(1, sizeof(world));
}

void world_add_thing(world *self, thing *t) {
    if (self->thing_cap == 0) {
        self->things = safe_malloc(sizeof(thing *));
        self->things[0] = t;
        self->thing_cap = 1;
        self->thing_count = 1;
        return;
    }

    if (self->thing_count == self->thing_cap) {
        self->thing_cap += 8;
        self->things = safe_realloc(self->things, self->thing_cap * sizeof(thing *));
    }

    self->things[self->thing_count] = t;
    self->thing_count++;
}

void world_remove_thing(world *self, thing *t) {
    int len = self->thing_count;
    thing **things = self->things;
    for (int i = 0; i < len; i++) {
        if (things[i] == t) {
            things[i] = things[len - 1];
            self->thing_count--;
        }
    }
}

void world_add_sector(world *self, sector *s) {
    if (self->sector_cap == 0) {
        self->sectors = safe_malloc(sizeof(sector *));
        self->sectors[0] = s;
        self->sector_cap = 1;
        self->sector_count = 1;
        return;
    }

    if (self->sector_count == self->sector_cap) {
        self->sector_cap += 8;
        self->sectors = safe_realloc(self->sectors, self->sector_cap * sizeof(sector *));
    }

    self->sectors[self->sector_count] = s;
    self->sector_count++;
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

    int *blocks = safe_malloc(all * sizeof(int));
    self->blocks = blocks;

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

    self->thing_cap = 4;
    self->things = safe_malloc(self->thing_cap * sizeof(thing *));

    hero *h = hero_init();
    world_add_thing(self, &h->super);
}

void world_update(world *self) {
    int thing_count = self->thing_count;
    thing **things = self->things;
    for (int i = 0; i < thing_count; i++) {
        thing_update(things[i]);
    }
}
