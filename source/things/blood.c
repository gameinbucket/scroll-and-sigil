#include "blood.h"

particle *create_blood(world *map, float x, float y, float z) {
    particle *self = create_particle(map, x, y, z, 0.2f, 0.2f);

    float scale = 1.0 / 64.0;

    float atlas_inverse_width = 1.0 / 64.0;
    float atlas_inverse_height = 1.0 / 64.0;

    int left = 0;
    int top = 0;
    int width = 64;
    int height = 64;

    self->texture = TEXTURE_STONE;
    self->sprite_data = create_sprite(left, top, width, height, 0, 0, atlas_inverse_width, atlas_inverse_height, scale);

    return self;
}
