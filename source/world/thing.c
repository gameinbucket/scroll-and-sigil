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
    int r_min = (int)(self->y - box) >> WORLD_CELL_SHIFT;
    int r_max = (int)(self->y + box) >> WORLD_CELL_SHIFT;

    world *map = self->map;
    for (int r = self->r_min; r <= self->r_max; r++)
        for (int c = self->c_min; c <= self->c_max; c++)
            cell_add_thing(&map->cells[c + r * map->cell_columns], self);

    self->r_min = c_min;
    self->r_min = r_min;
    self->r_max = c_max;
    self->r_max = r_max;
}

bool thing_collision(thing *self, thing *b) {
    float block = self->box + b->box;
    return abs(self->x - b->x) > block || abs(self->y - b->y) > block;
}

void thing_resolve_collision(thing *self, thing *b) {
    float block = self->box + b->box;

    if (abs(self->x - b->x) > block || abs(self->y - b->y) > block)
        return;

    if (abs(self->previous_x - b->x) > abs(self->previous_y - b->y)) {
        if (self->previous_x - b->x < 0) {
            self->x = b->x - block;
        } else {
            self->x = b->x + block;
        }
        self->delta_x = 0.0f;
    } else {
        if (self->previous_y - b->y < 0) {
            self->y = b->y - block;
        } else {
            self->y = b->y + block;
        }
        self->delta_y = 0.0f;
    }
}

void thing_line_collision(thing *self, line *ld) {

    float box = self->box;

    float vx = ld->vb.x - ld->va.x;
    float vy = ld->vb.y - ld->va.y;

    float wx = self->x - ld->va.x;
    float wy = self->y - ld->va.y;

    float t = (wx * vx + wy * vy) / (vx * vx + vy * vy);

    bool endpoint = false;

    if (t < 0) {
        t = 0;
        endpoint = true;
    } else if (t > 1) {
        t = 1;
        endpoint = true;
    }

    float px = ld->va.x + vx * t;
    float py = ld->va.y + vy * t;

    px -= self->x;
    py -= self->y;

    if ((px * px + py * py) > box * box)
        return;

    bool collision = false;

    if (ld->middle != NULL) {
        collision = true;
    } else {
        if (self->z + self->height > ld->plus->ceiling || self->z + 1.0f < ld->plus->floor) {
            collision = true;
        }
    }

    if (collision) {
        if (self->sec == ld->plus)
            return;

        float overlap;

        float normal_x;
        float normal_y;

        if (endpoint) {
            float ex = -px;
            float ey = -py;

            float em = sqrtf(ex * ex + ey * ey);

            ex /= em;
            ey /= em;

            overlap = sqrtf((px + box * ex) * (px + box * ex) + (py + box * ey) * (py + box * ey));

            normal_x = ex;
            normal_y = ey;
        } else {
            overlap = sqrtf((px + box * ld->normal.x) * (px + box * ld->normal.x) + (py + box * ld->normal.y) * (py + box * ld->normal.y));

            normal_x = ld->normal.x;
            normal_y = ld->normal.y;
        }

        self->x += normal_x * overlap;
        self->y += normal_y * overlap;
    }
}

void thing_update(thing *self) {
    self->update((void *)self);
}

void thing_standard_update(thing *self) {
    if (self->ground) {
        self->delta_x *= wind_resistance;
        self->delta_z *= wind_resistance;
    }

    if (FLOAT_NOT_ZERO(self->delta_x) || FLOAT_NOT_ZERO(self->delta_y)) {
        float ox = self->x;
        float oy = self->y;

        self->x += self->delta_x;
        self->y += self->delta_y;

        thing_remove_from_cells(self);

        float box = self->box;
        int c_min = (int)(self->x - box) >> WORLD_CELL_SHIFT;
        int c_max = (int)(self->x + box) >> WORLD_CELL_SHIFT;
        int r_min = (int)(self->y - box) >> WORLD_CELL_SHIFT;
        int r_max = (int)(self->y + box) >> WORLD_CELL_SHIFT;

        set *collided = new_set(set_address_equal, set_address_hashcode);
        set *collisions = new_set(set_address_equal, set_address_hashcode);

        for (int r = r_min; r <= r_max; r++) {
            for (int c = c_min; c <= c_max; c++) {
                cell *current_cell = &self->map->cells[c + r * self->map->cell_columns];

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

        while (set_not_empty(collided)) {
            thing *closest = NULL;
            float manhattan = FLT_MAX;

            set_iterator iter = new_set_iterator(collided);
            while (set_iterator_has_next(&iter)) {
                thing *o = set_iterator_next(&iter);
                float m = abs(ox - o->x) + abs(oy - o->y);

                if (m < manhattan) {
                    manhattan = m;
                    closest = o;
                }
            }

            thing_resolve_collision(self, closest);

            set_remove(collided, closest);
        }

        destroy_set(collided);
        destroy_set(collisions);

        for (int r = r_min; r <= r_max; r++) {
            for (int c = c_min; c <= c_max; c++) {
                cell *current_cell = &self->map->cells[c + r * self->map->cell_columns];
                for (int i = 0; i < current_cell->line_count; i++)
                    thing_line_collision(self, current_cell->lines[i]);
            }
        }

        thing_add_to_cells(self);
    }

    if (self->ground == false || FLOAT_NOT_ZERO(self->delta_z)) {

        self->delta_z -= gravity;
        self->z += self->delta_z;

        if (self->z < self->sec->floor) {
            self->ground = false;
            self->delta_z = 0;
            self->z = self->sec->floor;
        } else {
            self->ground = false;
        }
    }
}

void thing_initialize(thing *self, world *map, float x, float y, float r, float box, float height) {
    self->id = thing_unique_id++;
    self->map = map;
    self->sec = world_find_sector(map, x, y);

    assert(self->sec);

    self->x = x;
    self->y = y;
    self->z = self->sec->floor;
    self->rotation = r;
    self->ground = true;

    self->box = box;
    self->height = height;

    thing_add_to_cells(self);

    world_add_thing(map, self);
}
