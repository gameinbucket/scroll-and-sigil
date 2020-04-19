#ifndef SECTOR_H
#define SECTOR_H

#include <math.h>

#include "core/math.h"
#include "core/mem.h"

#include "triangle.h"
#include "vec.h"

#define SECTOR_NO_SURFACE -1

extern int sector_unique_index;

typedef struct line line;
typedef struct wall wall;
typedef struct sector sector;

struct line {
    sector *plus;
    sector *minus;
    vec va;
    vec vb;
    wall *top;
    wall *middle;
    wall *bottom;
    vec normal;
};

struct wall {
    line *ld;
    vec va;
    vec vb;
    float floor;
    float ceiling;
    int texture;
    float u;
    float v;
    float s;
    float t;
};

struct sector {
    int index;
    vec **vecs;
    int vec_count;
    line **lines;
    int line_count;
    float bottom;
    float floor;
    float ceiling;
    float top;
    int floor_texture;
    int ceiling_texture;
    triangle **triangles;
    int triangle_count;
    sector **inside;
    int inside_count;
    sector *outside;
};

wall *wall_init();
void wall_set(wall *self, float floor, float ceiling, float u, float v, float s, float t);

line *line_init(vec va, vec vb, int low, int mid, int top);
void line_set_sectors(line *self, sector *plus, sector *minus);
vec_ok line_intersect(line *self, line *with);

sector *sector_init(vec **vecs, int vec_count, line **lines, int line_count, float bottom, float floor, float ceiling, float top, int floor_texture, int ceiling_texture);
bool sector_contains(sector *self, float x, float y);
sector *sector_find(sector *self, float x, float y);
bool sector_has_floor(sector *self);
bool sector_has_ceiling(sector *self);

#endif
