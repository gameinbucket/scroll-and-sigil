#include "state.h"

state *state_init(world *w, renderstate *rs) {
    state *s = safe_malloc(sizeof(state));
    s->w = w;
    s->rs = rs;
    return s;
}

void state_update(state *self) {
    world_update(self->w);
}

void state_render(state *self) {

    renderstate *rs = self->rs;

    graphics_disable_cull();
    graphics_disable_depth();

    graphics_set_view(0, 0, rs->canvas_width, rs->canvas_height);
    graphics_clear_color();

    renderstate_set_program(rs, 0);

    matrix_update_orthographic(rs->canvas_orthographic, 0, 0, rs->modelviewprojection, rs->modelview);
    renderstate_set_mvp(rs, rs->modelviewprojection);

    renderstate_set_texture(rs, 0);

    renderbuffer *images = rs->draw_images;
    renderbuffer_zero(images);
    render_image(images, 0, 0, 64, 64, 0, 0, 1, 1);
    graphics_update_and_draw(images);
}
