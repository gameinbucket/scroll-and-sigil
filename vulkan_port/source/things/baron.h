#ifndef BARON_H
#define BARON_H

#include "assets/assets.h"
#include "core/mem.h"
#include "world/world.h"

#include "npc.h"

typedef struct baron baron;

struct baron {
    thing super;
    int status;
    int reaction;
};

void baron_update(void *void_self);
baron *create_baron(world *map, float x, float z, model_info *m);

#endif
