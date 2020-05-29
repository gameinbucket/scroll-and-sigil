#include "world.h"

const float gravity = 0.028;
const float wind_resistance = 0.88;

unsigned int thing_unique_id = 0;

void thing_remove_from_cells(thing *self) {
    world *map = self->map;
    for (int r = self->r_min; r <= self->r_max; r++)
        for (int c = self->c_min; c <= self->c_max; c++)
            cell_remove_thing(&map->cells[c + r * map->cell_columns], self);
}

void thing_add_to_cells(thing *self) {
    float box = self->box;
    int c_min = (int)(self->x - box) >> WORLD_CELL_SHIFT;
    int c_max = (int)(self->x + box) >> WORLD_CELL_SHIFT;
    int r_min = (int)(self->z - box) >> WORLD_CELL_SHIFT;
    int r_max = (int)(self->z + box) >> WORLD_CELL_SHIFT;

    world *map = self->map;
    for (int r = r_min; r <= r_max; r++)
        for (int c = c_min; c <= c_max; c++)
            cell_add_thing(&map->cells[c + r * map->cell_columns], self);

    self->c_min = c_min;
    self->c_max = c_max;
    self->r_min = r_min;
    self->r_max = r_max;
}

bool thing_collision(thing *self, thing *b) {
    float block = self->box + b->box;
    return !(fabs(self->x - b->x) > block || fabs(self->z - b->z) > block);
}

void thing_resolve_collision(thing *self, thing *b) {
    float block = self->box + b->box;

    if (fabs(self->x - b->x) > block || fabs(self->z - b->z) > block)
        return;

    if (fabs(self->previous_x - b->x) > fabs(self->previous_z - b->z)) {
        if (self->previous_x - b->x < 0) {
            self->x = b->x - block;
        } else {
            self->x = b->x + block;
        }
        self->dx = 0.0f;
    } else {
        if (self->previous_z - b->z < 0) {
            self->z = b->z - block;
        } else {
            self->z = b->z + block;
        }
        self->dz = 0.0f;
    }
}

void thing_line_collision(thing *self, line *ld) {

    float box = self->box;

    float vx = ld->vb.x - ld->va.x;
    float vz = ld->vb.y - ld->va.y;

    float wx = self->x - ld->va.x;
    float wz = self->z - ld->va.y;

    float t = (wx * vx + wz * vz) / (vx * vx + vz * vz);

    bool endpoint = false;

    if (t < 0) {
        t = 0;
        endpoint = true;
    } else if (t > 1) {
        t = 1;
        endpoint = true;
    }

    float px = ld->va.x + vx * t;
    float pz = ld->va.y + vz * t;

    px -= self->x;
    pz -= self->z;

    if ((px * px + pz * pz) > box * box)
        return;

    bool collision = false;

    if (ld->middle != NULL) {
        collision = true;
    } else {
        if (self->y + self->height > ld->plus->ceiling || self->y + 1.0f < ld->plus->floor) {
            collision = true;
        }
    }

    if (collision) {
        if (self->sec == ld->plus)
            return;

        float overlap;

        float normal_x;
        float normal_z;

        if (endpoint) {
            float ex = -px;
            float ez = -pz;

            float em = sqrtf(ex * ex + ez * ez);

            ex /= em;
            ez /= em;

            overlap = sqrtf((px + box * ex) * (px + box * ex) + (pz + box * ez) * (pz + box * ez));

            normal_x = ex;
            normal_z = ez;
        } else {
            overlap = sqrtf((px + box * ld->normal.x) * (px + box * ld->normal.x) + (pz + box * ld->normal.y) * (pz + box * ld->normal.y));

            normal_x = ld->normal.x;
            normal_z = ld->normal.y;
        }

        self->x += normal_x * overlap;
        self->z += normal_z * overlap;
    }
}

void thing_nop_update(__attribute__((unused)) void *self) {
}

void thing_standard_update(thing *self) {
    if (self->ground) {
        self->dx *= wind_resistance;
        self->dz *= wind_resistance;
    }

    if (FLOAT_NOT_ZERO(self->dx) || FLOAT_NOT_ZERO(self->dz)) {
        self->previous_x = self->x;
        self->previous_z = self->z;

        self->x += self->dx;
        self->z += self->dz;

        thing_remove_from_cells(self);

        float box = self->box;
        int c_min = (int)(self->x - box) >> WORLD_CELL_SHIFT;
        int c_max = (int)(self->x + box) >> WORLD_CELL_SHIFT;
        int r_min = (int)(self->z - box) >> WORLD_CELL_SHIFT;
        int r_max = (int)(self->z + box) >> WORLD_CELL_SHIFT;

        set *collided = create_set(set_address_equal, set_address_hashcode);
        set *collisions = create_set(set_address_equal, set_address_hashcode);

        world *map = self->map;

        for (int r = r_min; r <= r_max; r++) {
            for (int c = c_min; c <= c_max; c++) {
                cell *current_cell = &map->cells[c + r * map->cell_columns];
                for (int i = 0; i < current_cell->thing_count; i++) {
                    thing *t = current_cell->things[i];

                    if (set_has(collisions, t))
                        continue;

                    if (thing_collision(self, t))
                        set_add(collided, t);

                    set_add(collisions, t);
                }
            }
        }

        delete_set(collisions);

        while (set_not_empty(collided)) {
            thing *closest = NULL;
            float manhattan = FLT_MAX;

            set_iterator iter = create_set_iterator(collided);
            while (set_iterator_has_next(&iter)) {
                thing *b = set_iterator_next(&iter);
                float distance = fabs(self->previous_x - b->x) + fabs(self->previous_z - b->z);
                if (distance < manhattan) {
                    manhattan = distance;
                    closest = b;
                }
            }

            thing_resolve_collision(self, closest);

            set_remove(collided, closest);
        }

        delete_set(collided);

        for (int r = r_min; r <= r_max; r++) {
            for (int c = c_min; c <= c_max; c++) {
                cell *current_cell = &self->map->cells[c + r * self->map->cell_columns];
                for (int i = 0; i < current_cell->line_count; i++)
                    thing_line_collision(self, current_cell->lines[i]);
            }
        }

        thing_add_to_cells(self);
    }

    if (self->ground == false || FLOAT_NOT_ZERO(self->dy)) {

        self->dy -= gravity;
        self->y += self->dy;

        if (self->y < self->sec->floor) {
            self->ground = false;
            self->dy = 0;
            self->y = self->sec->floor;
        } else {
            self->ground = false;
        }
    }
}

void thing_initialize(thing *self, world *map, float x, float z, float r, float box, float height) {

    self->id = thing_unique_id++;
    self->map = map;
    self->sec = world_find_sector(map, x, z);

    assert(self->sec);

    self->x = x;
    self->y = self->sec->floor;
    self->z = z;
    self->rotation = r;
    self->rotation_target = r;
    self->ground = true;

    self->box = box;
    self->height = height;

    thing_add_to_cells(self);

    world_add_thing(map, self);
}
