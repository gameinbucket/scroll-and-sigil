#ifndef HERO_H
#define HERO_H

#include "assets/assets.h"
#include "core/mem.h"
#include "input/input.h"
#include "mesh/biped.h"
#include "world/world.h"

typedef struct hero hero;

struct hero {
    thing super;
    input *in;
    int *inventory;
};

void hero_update(void *void_self);
hero *create_hero(input *in, world *map, float x, float z);

#endif
