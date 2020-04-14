#ifndef SECTOR_H
#define SECTOR_H

#include <math.h>

#include "core/math.h"
#include "core/mem.h"

#include "triangle.h"
#include "vec.h"

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
    int texture;
    vec va;
    vec vb;
    float floor;
    float ceil;
    float u;
    float v;
    float s;
    float t;
};

struct sector {
    int index;
    float top;
    float ceil;
    float floor;
    float bottom;
    int ceil_texture;
    int floor_texture;
    vec **vecs;
    int vec_count;
    line **lines;
    int line_count;
    triangle **triangles;
    int triangle_count;
    sector **inside;
    int inside_count;
    sector *outside;
    bool has_ceil;
    bool has_floor;
};

wall *wall_init();
void wall_set(wall *self, float floor, float ceil, float u, float v, float s, float t);

line *line_init(vec va, vec vb, int low, int mid, int top);
void line_set(line *self, sector *plus, sector *minus);
vec_ok line_intersect(line *self, line *with);

sector *sector_init(vec **vecs, int vec_count, line **lines, int line_count);

#endif
