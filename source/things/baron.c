#include "baron.h"

const unsigned char baron_sleep = 0;
const unsigned char baron_dead = 1;
const unsigned char baron_look = 2;
const unsigned char baron_chase = 3;
const unsigned char baron_melee = 4;
const unsigned char baron_missile = 5;

void baron_update(void *void_self) {

    baron *self = void_self;
    self->super.rotation += 0.001;

    npc_move(&self->super);

    thing_standard_update(&self->super);
}

baron *create_baron(world *map, float x, float z, model_info *m) {

    baron *self = safe_calloc(1, sizeof(baron));

    float scale = 1.0 / 64.0;

    float atlas_inverse_width = 1.0 / 1024.0;
    float atlas_inverse_height = 1.0 / 512.0;

    int left = 696;
    int top = 0;
    int width = 110;
    int height = 128;

    self->super.type = THING_TYPE_BARON;
    self->super.update = baron_update;
    self->super.sprite_id = TEXTURE_PLANKS;
    self->super.sprite_data = create_sprite(left, top, width, height, 0, 0, atlas_inverse_width, atlas_inverse_height, scale);
    self->super.model_data = create_model(m);
    self->super.speed = 0.1;

    thing_initialize(&self->super, map, x, z, 0, 0.25, 1.76);

    return self;
}
