#include "hero.h"

enum direction {
    none = 0,
    forward = 1,
    backward = 2,
    left = 3,
    right = 4,
    forwardLeft = 5,
    forwardRight = 6,
    backwardLeft = 7,
    backwardRight = 8,
};

void hero_update(void *void_self) {

    hero *self = void_self;
    input *in = self->in;

    float r = self->super.rotation;
    float speed = self->super.speed;
    float rotation_target = self->super.rotation_target;
    int direction = none;
    float goal;

    const float TURN_RATE = 0.05f;

    if (in->move_forward) {
        direction = forward;
        goal = rotation_target;
    }

    if (in->move_backward) {
        if (direction == none) {
            direction = backward;
            goal = rotation_target + FLOAT_MATH_PI;
        } else {
            direction = none;
        }
    }

    if (in->move_left) {
        if (direction == none) {
            direction = left;
            goal = rotation_target + FLOAT_MATH_HALF_PI;
        } else if (direction == forward) {
            direction = forwardLeft;
            goal += FLOAT_MATH_QUARTER_PI;
        } else if (direction == backward) {
            direction = backwardLeft;
            goal -= FLOAT_MATH_QUARTER_PI;
        }
    }

    if (in->move_right) {
        if (direction == none) {
            direction = right;
            goal = rotation_target - FLOAT_MATH_HALF_PI;
        } else if (direction == left) {
            direction = none;
        } else if (direction == forwardLeft) {
            goal = rotation_target;
        } else if (direction == backwardLeft) {
            goal = rotation_target - FLOAT_MATH_PI;
        } else if (direction == forward) {
            goal -= FLOAT_MATH_QUARTER_PI;
        } else if (direction == backward) {
            goal += FLOAT_MATH_QUARTER_PI;
        }
    }

    if (direction == none) {
    } else {
        if (goal < 0) {
            goal += FLOAT_MATH_TAU;
        } else if (goal >= FLOAT_MATH_TAU) {
            goal -= FLOAT_MATH_TAU;
        }

        self->super.dx = -sinf(goal) * speed;
        self->super.dz = -cosf(goal) * speed;

        float difference = goal - r;

        while (difference <= FLOAT_MATH_PI) {
            difference += FLOAT_MATH_TAU;
        }

        while (difference > FLOAT_MATH_PI) {
            difference -= FLOAT_MATH_TAU;
        }

        if (difference < 0) {
            if (-difference < TURN_RATE) {
                self->super.rotation = goal;
            } else {
                r -= TURN_RATE;
                if (r < 0) {
                    r += FLOAT_MATH_TAU;
                }
                self->super.rotation = r;
            }
        } else {
            if (difference < TURN_RATE) {
                self->super.rotation = goal;
            } else {
                r += TURN_RATE;
                if (r >= FLOAT_MATH_TAU) {
                    r -= FLOAT_MATH_TAU;
                }
                self->super.rotation = r;
            }
        }
    }

    thing_standard_update(&self->super);
}

hero *create_hero(input *in, world *map, float x, float z, model_info *m) {

    hero *self = safe_calloc(1, sizeof(hero));

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
    self->super.sprite_data = create_sprite(left, top, width, height, 0, 0, atlas_inverse_width, atlas_inverse_height, scale);
    self->super.model_data = create_model(m);
    self->super.speed = 0.1;

    thing_initialize(&self->super, map, x, z, 0, 0.25, 1.76);

    self->in = in;

    return self;
}

void delete_hero(void *void_self) {
    free(void_self);
}
