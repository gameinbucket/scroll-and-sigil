#include "sector.h"

wall *wall_init(line *ld, vec va, vec vb, int texture) {
    wall *w = safe_calloc(1, sizeof(wall));
    w->ld = ld;
    w->va = va;
    w->vb = vb;
    w->texture = texture;
    return w;
}

void wall_set(wall *self, float floor, float ceiling, float u, float v, float s, float t) {
    self->floor = floor;
    self->ceiling = ceiling;
    self->u = u;
    self->v = v;
    self->s = s;
    self->t = t;
}
