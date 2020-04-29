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
