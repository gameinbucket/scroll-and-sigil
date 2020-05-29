#ifndef SECTOR_H
#define SECTOR_H

#include <math.h>

#include "core/mem.h"
#include "math/math_util.h"

#include "triangle.h"
#include "vec.h"

#define LINE_NO_WALL -1
#define SECTOR_NO_SURFACE -1

extern unsigned int sector_unique_id;

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

line *line_init(vec va, vec vb, int low, int mid, int top);
void line_set_sectors(line *self, sector *plus, sector *minus);
vec_ok line_intersect(line *self, line *with);

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

wall *wall_init(line *ld, vec va, vec vb, int texture);
void wall_set(wall *self, float floor, float ceiling, float u, float v, float s, float t);

struct sector {
    unsigned int id;
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

sector *sector_init(vec **vecs, int vec_count, line **lines, int line_count, float bottom, float floor, float ceiling, float top, int floor_texture, int ceiling_texture);
bool sector_contains(sector *self, float x, float y);
sector *sector_find(sector *self, float x, float y);
bool sector_has_floor(sector *self);
bool sector_has_ceiling(sector *self);

#endif
