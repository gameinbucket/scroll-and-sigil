#include "scenery.h"

thing *create_tree(world *map, float x, float z) {

    thing *self = safe_calloc(1, sizeof(thing));

    float scale = 1.0 / 64.0;

    float atlas_inverse_width = 1.0 / 128.0;
    float atlas_inverse_height = 1.0 / 256.0;

    int left = 0;
    int top = 0;
    int width = 102;
    int height = 140;

    self->type = THING_TYPE_SCENERY;
    self->update = thing_nop_update;
    self->sprite_id = TEXTURE_SCENERY;
    self->sprite_data = create_sprite(left, top, width, height, 0, 0, atlas_inverse_width, atlas_inverse_height, scale);

    thing_initialize(self, map, x, z, 0, 0.25, 1.76);

    return self;
}
