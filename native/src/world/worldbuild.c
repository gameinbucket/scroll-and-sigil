#include "worldbuild.h"

void world_build_map(world *self) {
    float top = 0;
    float left = 0;

    int sector_count = self->sector_count;
    sector **sectors = self->sectors;

    for (int i = 0; i < sector_count; i++) {
        sector *s = sectors[i];

        int vector_count = s->vec_count;
        vec **vecs = s->vecs;

        for (int k = 0; k < vector_count; k++) {
            vec *v = vecs[k];

            if (v->x > left) {
                left = v->x;
            }

            if (v->y > top) {
                top = v->y;
            }
        }
    }

    printf("%f %f\n", top, left);

    float scale = 1.0;

    for (int i = 0; i < sector_count; i++) {
        triangulate_sector(sectors[i], scale);
    }
}
