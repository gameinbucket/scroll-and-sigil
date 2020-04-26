#ifndef HERO_H
#define HERO_H

#include "assets/assets.h"
#include "core/mem.h"
#include "mesh/biped.h"

#include "thing.h"

typedef struct hero hero;

struct hero {
    thing super;
    int *inventory;
};

void hero_update(void *void_self);
hero *hero_init();

#endif
