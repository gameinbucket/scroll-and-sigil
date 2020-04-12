#ifndef LINE_DEF_H
#define LINE_DEF_H

#include "core/mem.h"

#include "sector.h"

typedef struct linedef linedef;

struct linedef {
    sector *plus;
    sector *minus;
    wall *bottom;
    wall *middle;
    wall *top;
};

linedef *linedef_init();

typedef struct wall wall;

struct wall {
    linedef *def;
    float vax;
    float vay;
    float vbx;
    float vby;
    int texture;
    float floor;
    float ceil;
    float u;
    float v;
    float s;
    float t;
};

wall *wall_init();

#endif
