#include "sector.h"

unsigned int sector_unique_id = 0;

sector *sector_init(vec **vecs, int vec_count, line **lines, int line_count, float bottom, float floor, float ceiling, float top, int floor_texture, int ceiling_texture) {
    sector *s = safe_calloc(1, sizeof(sector));
    s->id = sector_unique_id++;
    s->vecs = vecs;
    s->vec_count = vec_count;
    s->lines = lines;
    s->line_count = line_count;
    s->bottom = bottom;
    s->floor = floor;
    s->ceiling = ceiling;
    s->top = top;
    s->floor_texture = floor_texture;
    s->ceiling_texture = ceiling_texture;
    return s;
}

bool sector_contains(sector *self, float x, float y) {
    bool odd = false;
    vec **vecs = self->vecs;
    int count = self->vec_count;
    int j = count - 1;
    for (int i = 0; i < count; i++) {
        vec *vi = vecs[i];
        vec *vj = vecs[j];

        if ((vi->y > y) != (vj->y > y)) {
            float value = (vj->x - vi->x) * (y - vi->y) / (vj->y - vi->y) + vi->x;
            if (x < value) {
                odd = !odd;
            }
        }

        j = i;
    }
    return odd;
}

sector *sector_find(sector *self, float x, float y) {
    sector **inside = self->inside;
    int count = self->inside_count;
    for (int i = 0; i < count; i++) {
        sector *s = inside[i];
        if (sector_contains(s, x, y)) {
            return sector_find(s, x, y);
        }
    }
    return self;
}

bool sector_has_floor(sector *self) {
    return self->floor_texture != SECTOR_NO_SURFACE;
}

bool sector_has_ceiling(sector *self) {
    return self->ceiling_texture != SECTOR_NO_SURFACE;
}
