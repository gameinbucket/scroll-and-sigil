#include "hero.h"

void hero_update(void *void_self) {
    hero *self = void_self;

    // self->super.delta_x = 0.0001;
    // self->super.rotation += 0.001;

    input *in = self->in;
    float r = self->super.rotation;
    float speed = self->super.speed;

    float dx = 0;
    float dz = 0;

    const float MAXSPEED = 0.5f;

    if (in->move_forward) {
        dx += sinf(r) * speed;
        dz -= cosf(r) * speed;
        printf("%f, %f, %f\n", dx, dz, speed);
    }

    if (in->move_backward) {
        dx -= sinf(r) * speed * 0.5f;
        dz += cosf(r) * speed * 0.5f;
    }

    if (in->move_left) {
        dx -= cosf(r) * speed * 0.75f;
        dz -= sinf(r) * speed * 0.75f;
    }

    if (in->move_right) {
        dx += cosf(r) * speed * 0.75f;
        dz += sinf(r) * speed * 0.75f;
    }

    if (dx > MAXSPEED) {
        dx = MAXSPEED;
    } else if (dx < -MAXSPEED) {
        dx = -MAXSPEED;
    }

    if (dz > MAXSPEED) {
        dz = MAXSPEED;
    } else if (dz < -MAXSPEED) {
        dz = -MAXSPEED;
    }

    self->super.delta_x = dx;
    self->super.delta_y = dz;

    thing_standard_update(&self->super);
}

hero *hero_init(input *in, world *map) {
    hero *self = safe_calloc(1, sizeof(hero));

    thing_initialize(&self->super, map, 10, 40, 0, 0.5, 1.76);

    self->super.speed = 0.1;

    float scale = 1.0 / 64.0;

    float atlas_inverse_width = 1.0 / 1024.0;
    float atlas_inverse_height = 1.0 / 512.0;

    int left = 696;
    int top = 0;
    int width = 110;
    int height = 128;

    self->super.type = THING_TYPE_HERO;
    self->super.update = hero_update;
    self->super.sprite_id = TEXTURE_STONE_FLOOR;
    self->super.sprite_data = new_sprite(left, top, width, height, 0, 0, atlas_inverse_width, atlas_inverse_height, scale);
    self->super.model_data = alloc_biped();

    self->in = in;

    return self;
}
