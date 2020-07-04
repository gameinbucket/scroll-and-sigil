#include "world.h"

decal *create_decal(world *map) {
    decal *self = safe_calloc(1, sizeof(decal));
    world_add_decal(map, self);
    return self;
}
