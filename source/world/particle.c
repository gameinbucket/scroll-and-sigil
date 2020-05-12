#include "world.h"

particle *create_particle(world *map, float x, float y, float z, float box, float height) {
    particle *self = safe_calloc(1, sizeof(particle));
    self->x = x;
    self->y = y;
    self->z = z;
    self->box = box;
    self->height = height;
    self->map = map;
    self->sec = world_find_sector(map, x, z);
    world_add_particle(map, self);
    return self;
}

bool particle_update(particle *self) {
    return self->gc;
}
