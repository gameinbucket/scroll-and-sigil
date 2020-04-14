#ifndef HERO_H
#define HERO_H

#include "core/mem.h"

#include "thing.h"

typedef struct hero hero;

struct hero {
    thing super;
    int *inventory;
};

void hero_update(void *void_self);
hero *hero_init();

#endif
