#include "place.h"

void place_flat(world *w) {

    int vec_count = 4;
    vec **vecs = safe_malloc(vec_count * sizeof(vec *));

    vecs[0] = vec_init(0, 0);
    vecs[1] = vec_init(0, 127);
    vecs[2] = vec_init(127, 127);
    vecs[3] = vec_init(127, 0);

    int line_count = 0;
    line **lines = NULL;

    sector *s = sector_init(vecs, vec_count, lines, line_count, 0, 0, 10, 0, TEXTURE_GRASS, SECTOR_NO_SURFACE);

    world_add_sector(w, s);
}

void place_house(world *w, int x, int y) {

    int p_count = 12;
    vec **p = safe_malloc(p_count * sizeof(vec *));
    p[0] = vec_init(x, y);
    p[1] = vec_init(x, y + 20);
    p[2] = vec_init(x + 6, y + 20);
    p[3] = vec_init(x + 6, y + 19);
    p[4] = vec_init(x + 1, y + 19);
    p[5] = vec_init(x + 1, y + 1);
    p[6] = vec_init(x + 19, y + 1);
    p[7] = vec_init(x + 19, y + 19);
    p[8] = vec_init(x + 14, y + 19);
    p[9] = vec_init(x + 14, y + 20);
    p[10] = vec_init(x + 20, y + 20);
    p[11] = vec_init(x + 20, y);

    int line_out_count = p_count;
    line **line_out = safe_malloc(line_out_count * sizeof(line *));
    int k = line_out_count - 1;
    for (int i = 0; i < line_out_count; i++) {

        line_out[i] = line_init(vec_of(p[k]), vec_of(p[i]), LINE_NO_WALL, TEXTURE_STONE, LINE_NO_WALL);
        k = i;
    }

    int vec_in_count = 8;
    vec **vec_in = safe_malloc(vec_in_count * sizeof(vec *));
    vec_in[0] = p[2];
    vec_in[1] = p[9];
    vec_in[2] = p[8];
    vec_in[3] = p[7];
    vec_in[4] = p[6];
    vec_in[5] = p[5];
    vec_in[6] = p[4];
    vec_in[7] = p[3];

    int line_in_count = 1;
    line **line_in = safe_malloc(line_in_count * sizeof(line *));
    line_in[0] = line_init(vec_of(p[2]), vec_of(p[9]), LINE_NO_WALL, LINE_NO_WALL, TEXTURE_PLANKS);

    sector *outside = sector_init(p, p_count, line_out, line_out_count, 0, 0, 6, 0, SECTOR_NO_SURFACE, SECTOR_NO_SURFACE);

    sector *inside = sector_init(vec_in, vec_in_count, line_in, line_in_count, 0, 0, 5, 6, TEXTURE_PLANK_FLOOR, TEXTURE_STONE_FLOOR);

    world_add_sector(w, outside);
    world_add_sector(w, inside);
}
