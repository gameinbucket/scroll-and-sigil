#ifndef THING_H
#define THING_H

#include "core/mem.h"

#include "graphics/model.h"
#include "graphics/sprite.h"

extern float gravity;
extern float inverse_block_size;

enum thing_type { THING_TYPE_HERO, THING_TYPE_BARON };

typedef enum thing_type thing_type;

typedef struct thing thing;

struct thing {
    thing_type type;
    float x;
    float y;
    float z;
    float angle;
    float radius;
    float height;
    int min_bx;
    int min_by;
    int min_bz;
    int max_bx;
    int max_by;
    int max_bz;
    float delta_x;
    float delta_y;
    float delta_z;
    unsigned int sprite_id;
    sprite *sprite_data;
    model *model_data;
    void (*update)(void *);
};

void thing_block_borders(thing *self);
void thing_update(thing *self);
void thing_standard_update(thing *self);

#endif
