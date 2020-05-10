#include "world.h"

void cell_add_line(cell *self, line *ld) {
    if (self->line_count == 0) {
        self->lines = safe_malloc(sizeof(line *));
        self->lines[0] = ld;
        self->line_count = 1;
        return;
    }

    int len = self->line_count;
    line **lines = self->lines;
    for (int i = 0; i < len; i++) {
        if (lines[i] == ld) {
            return;
        }
    }

    self->lines = safe_realloc(self->lines, (len + 1) * sizeof(line *));
    self->lines[len] = ld;
    self->line_count++;
}

void cell_add_thing(cell *self, thing *t) {
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

void cell_remove_thing(cell *self, thing *t) {
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

void cell_add_particle(cell *self, particle *t) {
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

void cell_remove_particle(cell *self, particle *t) {
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

void cell_add_decal(cell *self, decal *t) {
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

void cell_remove_decal(cell *self, decal *t) {
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
