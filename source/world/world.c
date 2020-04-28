#include "world.h"

world *new_world() {
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
            return;
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

sector *world_find_sector(world *self, float x, float y) {
    for (int i = 0; i < self->sector_count; i++) {
        sector *s = self->sectors[i];
        if (s->outside != NULL)
            continue;
        if (sector_contains(s, x, y))
            return sector_find(s, x, y);
    }
    return NULL;
}

void world_update(world *self) {
    int thing_count = self->thing_count;
    thing **things = self->things;
    for (int i = 0; i < thing_count; i++) {
        thing_update(things[i]);
    }
}
