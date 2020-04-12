#include "thing.h"

float gravity = 0.01;
float inverse_block_size = 1.0;

void thing_block_borders(thing *self) {
    float radius = self->radius;
    self->min_bx = (int)((self->x - radius) * inverse_block_size);
    self->max_bx = (int)((self->x + radius) * inverse_block_size);
    self->min_bz = (int)((self->z - radius) * inverse_block_size);
    self->max_bz = (int)((self->z + radius) * inverse_block_size);
    self->min_by = (int)(self->y * inverse_block_size);
    self->max_by = (int)((self->y + self->height) * inverse_block_size);
}

void thing_update(thing *self) {
    self->x += self->delta_x;
    self->y += self->delta_y;
    self->z += self->delta_z;

    self->update((void *)self);
}
