#include "baron.h"

void baron_update(void *void_self) {
    baron *self = void_self;

    self->super.rotation += 0.001;

    thing_standard_update(&self->super);
}

baron *create_baron(world *map, float x, float z) {
    baron *self = safe_calloc(1, sizeof(baron));

    thing_initialize(&self->super, map, x, z, 0, 0.5, 1.76);

    self->super.speed = 0.1;

    float scale = 1.0 / 64.0;

    float atlas_inverse_width = 1.0 / 1024.0;
    float atlas_inverse_height = 1.0 / 512.0;

    int left = 696;
    int top = 0;
    int width = 110;
    int height = 128;

    self->super.type = THING_TYPE_HERO;
    self->super.update = baron_update;
    self->super.sprite_id = TEXTURE_PLANKS;
    self->super.sprite_data = new_sprite(left, top, width, height, 0, 0, atlas_inverse_width, atlas_inverse_height, scale);
    self->super.model_data = alloc_biped();

    return self;
}
