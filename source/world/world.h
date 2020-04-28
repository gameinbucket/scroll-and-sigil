#ifndef WORLD_H
#define WORLD_H

#include <assert.h>
#include <float.h>

#include "core/math.h"
#include "core/mem.h"
#include "data/set.h"
#include "graphics/model.h"
#include "graphics/sprite.h"
#include "map/sector.h"

#define WORLD_SCALE 0.25f
#define WORLD_CELL_SHIFT 5

extern const float gravity;
extern const float wind_resistance;

extern unsigned int thing_unique_id;

enum thing_type { THING_TYPE_HERO, THING_TYPE_BARON };

typedef enum thing_type thing_type;

typedef struct world world;
typedef struct cell cell;
typedef struct thing thing;

struct world {
    char *name;
    thing **things;
    int thing_cap;
    int thing_count;
    sector **sectors;
    int sector_cap;
    int sector_count;
    cell *cells;
    int cell_columns;
    int cell_rows;
    int cell_count;
};

world *new_world();

void world_add_thing(world *self, thing *t);
void world_remove_thing(world *self, thing *t);
void world_add_sector(world *self, sector *s);
sector *world_find_sector(world *self, float x, float y);
void world_load_map(world *self);
void world_update(world *self);

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

struct thing {
    unsigned int id;
    thing_type type;
    world *map;
    sector *sec;
    int health;
    float box;
    float height;
    float speed;
    float x;
    float y;
    float z;
    float delta_x;
    float delta_y;
    float delta_z;
    float previous_x;
    float previous_y;
    float rotation;
    bool ground;
    int c_min;
    int r_min;
    int c_max;
    int r_max;
    int sprite_id;
    sprite *sprite_data;
    model *model_data;
    void (*update)(void *);
};

void thing_initialize(thing *self, world *map, float x, float y, float r, float radius, float height);
void thing_block_borders(thing *self);
void thing_update(thing *self);
void thing_standard_update(thing *self);

#endif
