#include "blood.h"

bool blood_update(void *void_self) {

    particle *self = (particle *)void_self;

    self->dx *= 0.95f;
    self->dy -= 0.01f;
    self->dz *= 0.95f;

    self->x += self->dx;
    self->y += self->dy;
    self->z += self->dz;

    return particle_map_collision(self);
}

particle *create_blood(world *map, float x, float y, float z) {

    particle *self = create_particle(map, x, y, z, 0.2f, 0.2f);

    self->update = blood_update;

    float scale = 1.0 / 64.0;

    float atlas_inverse_width = 1.0 / 512.0;
    float atlas_inverse_height = 1.0 / 128.0;

    int left = 11;
    int top = 0;
    int width = 16;
    int height = 16;

    self->texture = TEXTURE_PARTICLES;
    self->sprite_data = create_sprite(left, top, width, height, 0, 0, atlas_inverse_width, atlas_inverse_height, scale);

    self->dy = 0.25f;

    return self;
}
