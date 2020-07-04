#include "world.h"

particle *create_particle(world *map, float x, float y, float z, float box, float height) {
    particle *self = safe_calloc(1, sizeof(particle));
    self->x = x;
    self->y = y;
    self->z = z;
    self->box = box;
    self->height = height;
    self->map = map;
    self->sec = world_find_sector(map, x, z);
    world_add_particle(map, self);
    return self;
}

void particle_hit_floor(particle *self) {

    decal *d = create_decal(self->map);
    d->texture = self->texture;

    sprite *s = self->sprite_data;

    float h = s->height * 0.5f;

    float x = round(self->x * 16.0f) / 16.0f;
    float y = self->sec->floor + 0.001f;
    float z = round(self->z * 16.0f) / 16.0f;

    d->x1 = x - s->width;
    d->y1 = y;
    d->z1 = z - h;
    d->u1 = s->left;
    d->v1 = s->bottom;

    d->x2 = x - s->width;
    d->y2 = y;
    d->z2 = z + h;
    d->u2 = s->left;
    d->v2 = s->top;

    d->x3 = x + s->width;
    d->y3 = y;
    d->z3 = z + h;
    d->u3 = s->right;
    d->v3 = s->bottom;

    d->x4 = x + s->width;
    d->y4 = y;
    d->z4 = z - h;
    d->u4 = s->right;
    d->v4 = s->top;

    d->nx = 0.0f;
    d->ny = 0.0f;
    d->nz = 1.0f;
}

void particle_hit_ceiling(particle *self) {

    decal *d = create_decal(self->map);
    d->texture = self->texture;

    sprite *s = self->sprite_data;

    float h = s->height / 2;

    float x = round(self->x * 16.0f) / 16.0f;
    float y = round(self->y * 16.0f) / 16.0f;

    d->x1 = x + s->width;
    d->y1 = y - h;
    d->z1 = self->sec->ceiling;
    d->u1 = 0.0f;
    d->v1 = 1.0f;

    d->x2 = x + s->width;
    d->y2 = y + h;
    d->z2 = self->sec->ceiling;
    d->u2 = 0.0f;
    d->v2 = 0.0f;

    d->x3 = x - s->width;
    d->y3 = y + h;
    d->z3 = self->sec->ceiling;
    d->u3 = 1.0f;
    d->v3 = 0.0f;

    d->x4 = x - s->width;
    d->y4 = y - h;
    d->z4 = self->sec->ceiling;
    d->u4 = 1.0f;
    d->v4 = 1.0f;

    d->nx = 0.0f;
    d->ny = 0.0f;
    d->nz = -1.0f;
}

bool particle_line_collision(particle *self, line *ld) {

    float box = self->box;

    float vx = ld->vb.x - ld->va.x;
    float vz = ld->vb.y - ld->va.y;

    float wx = self->x - ld->va.x;
    float wz = self->z - ld->va.y;

    float t = (wx * vx + wz * vz) / (vx * vx + vz * vz);

    if (t < 0.0f) {
        t = 0.0f;
    } else if (t > 1.0f) {
        t = 1.0f;
    }

    float px = ld->va.x + vx * t;
    float pz = ld->va.y + vz * t;

    px -= self->x;
    pz -= self->z;

    if ((px * px + pz * pz) > box * box) {
        return false;
    }

    if (ld->middle != NULL || self->z < ld->plus->floor || self->z + self->height > ld->plus->ceiling) {

        float x = px + self->x;
        float z = pz + self->z;

        decal *d = create_decal(self->map);
        d->texture = self->texture;

        sprite *s = self->sprite_data;

        d->x1 = x - ld->normal.y * s->width;
        d->y1 = self->y + ld->normal.x * s->width;
        d->z1 = z + s->height;

        wx = d->x1 - ld->va.x;
        wz = d->y1 - ld->va.y;

        t = (wx * vx + wz * vz) / (vx * vx + vz * vz);

        if (t < 0) {
            d->x1 = ld->va.x;
            d->y1 = ld->va.y;
        }

        d->u1 = 0.0f;
        d->v1 = 1.0f;

        d->x2 = d->x1;
        d->y2 = d->y1;
        d->z2 = z;

        d->u2 = 0.0f;
        d->v2 = 0.0f;

        d->x3 = x + ld->normal.y * s->width;
        d->y3 = self->y - ld->normal.x * s->width;
        d->z3 = z;

        wx = d->x3 - ld->va.x;
        wz = d->y3 - ld->va.y;

        t = (wx * vx + wz * vz) / (vx * vx + vz * vz);

        if (t > 1.0f) {
            d->x3 = ld->vb.x;
            d->y3 = ld->vb.y;
        }

        d->u3 = 1.0f;
        d->v3 = 0.0f;

        d->x4 = d->x3;
        d->y4 = d->y3;
        d->z4 = d->z1;

        d->u4 = 1.0f;
        d->v4 = 1.0f;

        d->nx = ld->normal.x;
        d->ny = ld->normal.y;
        d->nz = 0.0f;

        return true;
    }

    return false;
}

bool particle_map_collision(particle *self) {

    if (self->y < self->sec->floor) {
        particle_hit_floor(self);
        return true;
    }

    if (self->y + self->height > self->sec->ceiling) {
        particle_hit_ceiling(self);
        return true;
    }

    float box = self->box;
    int c_min = (int)(self->x - box) >> WORLD_CELL_SHIFT;
    int c_max = (int)(self->x + box) >> WORLD_CELL_SHIFT;
    int r_min = (int)(self->z - box) >> WORLD_CELL_SHIFT;
    int r_max = (int)(self->z + box) >> WORLD_CELL_SHIFT;

    world *map = self->map;

    for (int r = r_min; r <= r_max; r++) {
        for (int c = c_min; c <= c_max; c++) {
            cell *current_cell = &map->cells[c + r * self->map->cell_columns];
            for (int i = 0; i < current_cell->line_count; i++) {
                if (particle_line_collision(self, current_cell->lines[i])) {
                    return true;
                }
            }
        }
    }

    return false;
}

bool particle_do_nothing(__attribute__((unused)) void *void_self) {
    return false;
}
