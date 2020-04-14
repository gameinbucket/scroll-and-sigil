#include "sector.h"

wall *wall_init(line *ld, vec va, vec vb, int texture) {
    wall *w = safe_malloc(sizeof(wall));
    w->ld = ld;
    w->va = va;
    w->vb = vb;
    w->texture = texture;
    return w;
}

void wall_set(wall *self, float floor, float ceil, float u, float v, float s, float t) {
    self->floor = floor;
    self->ceil = ceil;
    self->u = u;
    self->v = v;
    self->s = s;
    self->t = t;
}
