#include "places.h"

sector *place_flat(world *w) {

    int vec_count = 4;
    vec **vecs = safe_malloc(vec_count * sizeof(vec *));

    vecs[0] = vec_init(0, 0);
    vecs[1] = vec_init(0, 127);
    vecs[2] = vec_init(127, 127);
    vecs[3] = vec_init(127, 0);

    int line_count = 0;
    line **lines = NULL;

    sector *s = sector_init(vecs, vec_count, lines, line_count);

    world_add_sector(w, s);

    return s;
}
