#ifndef CELL_H
#define CELL_H

#include "core/mem.h"

#include "map/sector.h"
#include "things/thing.h"

typedef struct cell cell;

struct cell {
    line **lines;
    int line_count;
    thing **things;
    int thing_cap;
    int thing_count;
};

void cell_add_line(cell *self, line *ld);
void cell_add_thing(cell *self, thing *t);
void cell_remove_thing(cell *self, thing *t);

#endif
