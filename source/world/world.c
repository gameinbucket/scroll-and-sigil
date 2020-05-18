#include "world.h"

world *create_world() {
    return safe_calloc(1, sizeof(world));
}

void world_add_thing(world *self, thing *t) {

    if (self->thing_cap == 0) {
        self->things = safe_malloc(sizeof(thing *));
        self->things[0] = t;
        self->thing_cap = 1;
        self->thing_count = 1;
    } else {

        if (self->thing_count == self->thing_cap) {
            self->thing_cap += 8;
            self->things = safe_realloc(self->things, self->thing_cap * sizeof(thing *));
        }
        self->things[self->thing_count] = t;
        self->thing_count++;
    }

    if (t->model_data == NULL) {

        if (self->thing_sprites_cap == 0) {
            self->thing_sprites = safe_malloc(sizeof(thing *));
            self->thing_sprites[0] = t;
            self->thing_sprites_cap = 1;
            self->thing_sprites_count = 1;
        } else {

            if (self->thing_sprites_count == self->thing_sprites_cap) {
                self->thing_sprites_cap += 8;
                self->thing_sprites = safe_realloc(self->things, self->thing_sprites_cap * sizeof(thing *));
            }
            self->thing_sprites[self->thing_sprites_count] = t;
            self->thing_sprites_count++;
        }
    } else {

        if (self->thing_models_cap == 0) {
            self->thing_models = safe_malloc(sizeof(thing *));
            self->thing_models[0] = t;
            self->thing_models_cap = 1;
            self->thing_models_count = 1;
        } else {

            if (self->thing_models_count == self->thing_models_cap) {
                self->thing_models_cap += 8;
                self->thing_models = safe_realloc(self->things, self->thing_models_cap * sizeof(thing *));
            }
            self->thing_models[self->thing_models_count] = t;
            self->thing_models_count++;
        }
    }
}

void world_remove_thing(world *self, thing *t) {

    int len = self->thing_count;
    thing **things = self->things;
    for (int i = 0; i < len; i++) {
        if (things[i] == t) {
            things[i] = things[len - 1];
            self->thing_count--;
            break;
        }
    }

    if (t->model_data == NULL) {

        len = self->thing_sprites_count;
        things = self->thing_sprites;
        for (int i = 0; i < len; i++) {
            if (things[i] == t) {
                things[i] = things[len - 1];
                self->thing_sprites_count--;
                break;
            }
        }
    } else {

        len = self->thing_models_count;
        things = self->thing_models;
        for (int i = 0; i < len; i++) {
            if (things[i] == t) {
                things[i] = things[len - 1];
                self->thing_models_count--;
                break;
            }
        }
    }
}

void world_add_particle(world *self, particle *t) {

    if (self->particle_cap == 0) {
        self->particles = safe_malloc(sizeof(particle *));
        self->particles[0] = t;
        self->particle_cap = 1;
        self->particle_count = 1;
        return;
    }

    if (self->particle_count == self->particle_cap) {
        self->particle_cap += 8;
        self->particles = safe_realloc(self->particles, self->particle_cap * sizeof(particle *));
    }

    self->particles[self->particle_count] = t;
    self->particle_count++;
}

void world_remove_particle(world *self, particle *t) {

    int len = self->particle_count;
    particle **particles = self->particles;
    for (int i = 0; i < len; i++) {
        if (particles[i] == t) {
            particles[i] = particles[len - 1];
            self->particle_count--;
            return;
        }
    }
}

void world_add_decal(world *self, decal *t) {

    if (self->decal_cap == 0) {
        self->decals = safe_malloc(sizeof(decal *));
        self->decals[0] = t;
        self->decal_cap = 1;
        self->decal_count = 1;
        return;
    }

    if (self->decal_count == self->decal_cap) {
        self->decal_cap += 8;
        self->decals = safe_realloc(self->decals, self->decal_cap * sizeof(decal *));
    }

    self->decals[self->decal_count] = t;
    self->decal_count++;
}

void world_remove_decal(world *self, decal *t) {

    int len = self->decal_count;
    decal **decals = self->decals;
    for (int i = 0; i < len; i++) {
        if (decals[i] == t) {
            decals[i] = decals[len - 1];
            self->decal_count--;
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
        thing *t = things[i];
        t->update(t);
    }

    int particle_count = self->particle_count;
    particle **particles = self->particles;
    for (int i = 0; i < particle_count; i++) {
        particle *p = particles[i];
        if (p->update(p)) {
            particles[i] = particles[particle_count - 1];
            particles[particle_count - 1] = NULL;
            self->particle_count--;
            particle_count--;
            i--;
        }
    }
}
