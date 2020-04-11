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

    framebuffer *f = rs->frame;

    graphics_bind_fbo(f->fbo);
    graphics_set_view(0, 0, f->width, f->height);
    graphics_clear_color();

    renderstate_set_program(rs, SHADER_TEXTURE_2D);

    matrix_orthographic_projection(rs->modelview, rs->draw_orthographic, rs->modelviewprojection, 0, 0);
    renderstate_set_mvp(rs, rs->modelviewprojection);

    renderstate_set_texture(rs, 0);

    renderbuffer *images = rs->draw_images;
    renderbuffer_zero(images);
    render_image(images, 0, 0, 64, 128, 0, 0, 1, 1);

    graphics_update_and_draw(images);

    graphics_bind_fbo(0);
    renderstate_set_program(rs, SHADER_SCREEN);
    graphics_set_view(0, 0, rs->canvas_width, rs->canvas_height);
    matrix_orthographic_projection(rs->modelview, rs->canvas_orthographic, rs->modelviewprojection, 0, 0);
    renderstate_set_mvp(rs, rs->modelviewprojection);
    graphics_bind_texture(GL_TEXTURE0, f->textures[0]);
    graphics_bind_and_draw(rs->screen);
}
