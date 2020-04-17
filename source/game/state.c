#include "state.h"

state *state_init(world *w, renderstate *rs) {
    state *s = safe_calloc(1, sizeof(state));
    s->w = w;
    s->rs = rs;
    s->c = camera_init();
    s->c->x = 10;
    s->c->z = 40;
    return s;
}

void state_update(state *self) {
    world_update(self->w);

    input in = self->in;

    if (in.move_forward) {
        self->c->x -= 0.1;
    }

    if (in.move_backward) {
        self->c->x += 0.1;
    }

    if (in.move_up) {
        self->c->y += 0.1;
    }

    if (in.move_down) {
        self->c->y -= 0.1;
    }

    if (in.move_left) {
        self->c->z -= 0.1;
    }

    if (in.move_right) {
        self->c->z += 0.1;
    }

    if (in.look_left) {
        self->c->rx -= 0.05;
    }

    if (in.look_right) {
        self->c->rx += 0.05;
    }

    if (in.look_up) {
        self->c->ry -= 0.05;
    }

    if (in.look_down) {
        self->c->ry += 0.05;
    }
}

void state_render(state *self) {

    camera *c = self->c;
    renderstate *rs = self->rs;

    framebuffer *f = rs->frame;

    graphics_bind_fbo(f->fbo);
    graphics_set_view(0, 0, f->width, f->height);
    graphics_clear_color_and_depth();

    // 3d

    graphics_enable_cull();
    graphics_enable_depth();

    matrix_perspective_projection(rs->modelview, rs->draw_perspective, rs->modelviewprojection, c->x, c->y, c->z, c->rx, c->ry);

    world_render(rs, self->w, c);

    graphics_disable_cull();
    graphics_disable_depth();

    // end 3d

    renderstate_set_program(rs, SHADER_TEXTURE_2D);
    matrix_orthographic_projection(rs->modelview, rs->draw_orthographic, rs->modelviewprojection, c->x, c->y);
    renderbuffer *draw_images = rs->draw_images;
    renderbuffer_zero(draw_images);
    render_image(draw_images, 0, 0, 110, 128, 0, 0, 1, 1);
    render_image(draw_images, 110 * 2, 0, 110, 128, 0, 0, 1, 1);
    renderstate_set_mvp(rs, rs->modelviewprojection);
    renderstate_set_texture(rs, TEXTURE_BARON);
    graphics_update_and_draw(draw_images);

    graphics_bind_fbo(0);
    renderstate_set_program(rs, SHADER_SCREEN);
    graphics_set_view(0, 0, rs->canvas_width, rs->canvas_height);
    matrix_orthographic_projection(rs->modelview, rs->canvas_orthographic, rs->modelviewprojection, 0, 0);
    renderstate_set_mvp(rs, rs->modelviewprojection);
    graphics_bind_texture(GL_TEXTURE0, f->textures[0]);
    graphics_bind_and_draw(rs->screen);
}
