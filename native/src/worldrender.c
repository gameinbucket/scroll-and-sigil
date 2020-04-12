#include "worldrender.h"

void world_render(world *w, renderstate *rs) {

    renderstate_set_program(rs, 0);
    renderstate_set_mvp(rs, rs->modelviewprojection);

    int width = w->width;
    int height = w->height;
    int length = w->length;

    int bx = 0;
    int by = 0;
    int bz = 0;

    int all = width + height + length;

    int *blocks = w->blocks;

    float color[12] = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1};
    float uv[4] = {0, 0, 1, 1};

    renderbuffer *cubes = rs->draw_cubes;
    renderbuffer_zero(cubes);

    for (int i = 0; i < all; i++) {
        if (blocks[i] != 0) {
            render_cube_positive_x(cubes, bx, by, bz, color, uv);
        }
        bx++;
        if (bx == width) {
            bx = 0;
            by++;
            if (by == height) {
                by = 0;
                bz++;
            }
        }
    }
}
