#include "hero.h"

void hero_update(void *void_self) {
    hero *self = void_self;
    self->super.x = 10;
    self->super.y = 1;
    self->super.z = 40;
    self->super.delta_x = 0.0001;
}

hero *hero_init() {
    hero *self = safe_calloc(1, sizeof(hero));

    int left = 0;
    int top = 0;
    int width = 110;
    int height = 128;

    float atlas_inverse_width = 1.0 / 110.0;
    float atlas_inverse_height = 1.0 / 128.0;

    float scale = 1.0 / 64.0;

    self->super.type = THING_TYPE_HERO;
    self->super.update = hero_update;
    self->super.sp = new_sprite(left, top, width, height, 0, 0, atlas_inverse_width, atlas_inverse_height, scale);

    return self;
}
