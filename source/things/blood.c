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

void particle_hit_floor(particle *self) {

    self->gc = true;

    decal *d = create_decal(self->map);
    d->texture = self->texture;

    sprite *s = self->sprite_data;

    float h = s->height / 2;

    float x = round(self->x * 16.0f) / 16.0f;
    float y = round(self->y * 16.0f) / 16.0f;

    d->x1 = x - s->width;
    d->y1 = y - h;
    d->z1 = self->sec->floor;

    d->u1 = 0.0f;
    d->v1 = 1.0f;

    d->x2 = x - s->width;
    d->y2 = y + h;
    d->z2 = self->sec->floor;

    d->u2 = 0.0f;
    d->v2 = 0.0f;

    d->x3 = x + s->width;
    d->y3 = y + h;
    d->z3 = self->sec->floor;

    d->u3 = 1.0f;
    d->v3 = 0.0f;

    d->x4 = x + s->width;
    d->y4 = y - h;
    d->z4 = self->sec->floor;

    d->u4 = 1.0f;
    d->v4 = 1.0f;

    d->nx = 0.0f;
    d->ny = 0.0f;
    d->nz = 1.0f;
}
