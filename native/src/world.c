#include "world.h"

world *world_init() {
    return safe_calloc(1, sizeof(world));
}

void world_update(world *self) {
    int size = self->thing_count;
    for (int i = 0; i < size; i++) {
        thing_update(self->things[i]);
    }
}
