#include "state.h"

state *state_init(world *w, renderstate *rs) {
    state *s = safe_calloc(1, sizeof(state));
    s->w = w;
    s->rs = rs;
    s->c = camera_init();
    return s;
}

void state_update(state *self) {
    world_update(self->w);

    if (self->in.left) {
        self->c->x--;
    }

    if (self->in.right) {
        self->c->x++;
    }
}

void state_render(state *self) {

    camera *c = self->c;
    renderstate *rs = self->rs;

    framebuffer *f = rs->frame;

    graphics_bind_fbo(f->fbo);
    graphics_set_view(0, 0, f->width, f->height);
    graphics_clear_color();

    renderstate_set_program(rs, SHADER_TEXTURE_2D);

    matrix_orthographic_projection(rs->modelview, rs->draw_orthographic, rs->modelviewprojection, c->x, c->y);
    renderstate_set_mvp(rs, rs->modelviewprojection);

    renderstate_set_texture(rs, TEXTURE_BARON);

    renderbuffer *images = rs->draw_images;
    renderbuffer_zero(images);
    render_image(images, 0, 0, 110, 128, 0, 0, 1, 1);

    //

    // world_render(self->w, self->rs);

    // matrix_perspective_projection(rs->modelview, rs->draw_perspective, rs->modelviewprojection, c->x, c->y, c->z, c->rx, c->ry);
    // renderstate_set_mvp(rs, rs->modelviewprojection);
    // renderstate_set_texture(rs, TEXTURE_PLANK);

    // renderstate_set_program(rs, SHADER_TEXTURE_3D);

    // // graphics_enable_cull();
    // graphics_enable_depth();

    // graphics_update_and_draw(rs->draw_cubes);

    // graphics_disable_cull();
    // graphics_disable_depth();

    //

    graphics_update_and_draw(images);

    graphics_bind_fbo(0);
    renderstate_set_program(rs, SHADER_SCREEN);
    graphics_set_view(0, 0, rs->canvas_width, rs->canvas_height);
    matrix_orthographic_projection(rs->modelview, rs->canvas_orthographic, rs->modelviewprojection, 0, 0);
    renderstate_set_mvp(rs, rs->modelviewprojection);
    graphics_bind_texture(GL_TEXTURE0, f->textures[0]);
    graphics_bind_and_draw(rs->screen);
}
