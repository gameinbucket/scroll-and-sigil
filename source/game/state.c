#include "state.h"

state *state_init(world *w, renderstate *rs) {
    state *s = safe_calloc(1, sizeof(state));
    s->w = w;
    s->rs = rs;
    s->c = camera_init();
    s->c->x = 0; // 10;
    s->c->y = 0; // 1;
    s->c->z = 0; // 40;
    return s;
}

void state_update(state *self) {
    world_update(self->w);

    input in = self->in;

    float speed = 0.1f;

    float r = self->c->ry;

    float dx = 0;
    float dy = 0;
    float dz = 0;

    const float MAXSPEED = 0.5f;

    if (in.move_forward) {
        dx += sinf(r) * speed;
        dz -= cosf(r) * speed;
    }

    if (in.move_backward) {
        dx -= sinf(r) * speed * 0.5f;
        dz += cosf(r) * speed * 0.5f;
    }

    if (in.move_up) {
        self->c->y += 0.1;
    }

    if (in.move_down) {
        self->c->y -= 0.1;
    }

    if (in.move_left) {
        dx -= cosf(r) * speed * 0.75f;
        dz -= sinf(r) * speed * 0.75f;
    }

    if (in.move_right) {
        dx += cosf(r) * speed * 0.75f;
        dz += sinf(r) * speed * 0.75f;
    }

    if (dx > MAXSPEED) {
        dx = MAXSPEED;
    } else if (dx < -MAXSPEED) {
        dx = -MAXSPEED;
    }

    if (dy > MAXSPEED) {
        dy = MAXSPEED;
    } else if (dy < -MAXSPEED) {
        dy = -MAXSPEED;
    }

    if (in.look_left) {
        self->c->ry -= 0.05;
        if (self->c->ry < 0) {
            self->c->ry += FLOAT_MATH_TAU;
        }
    }

    if (in.look_right) {
        self->c->ry += 0.05;
        if (self->c->ry >= FLOAT_MATH_TAU) {
            self->c->ry -= FLOAT_MATH_TAU;
        }
    }

    if (in.look_up) {
        self->c->rx -= 0.05;
        if (self->c->rx < 0) {
            self->c->rx += FLOAT_MATH_TAU;
        }
    }

    if (in.look_down) {
        self->c->rx += 0.05;
        if (self->c->rx >= FLOAT_MATH_TAU) {
            self->c->rx -= FLOAT_MATH_TAU;
        }
    }

    self->c->x += dx;
    self->c->y += dy;
    self->c->z += dz;
}

void state_render(state *self) {

    camera *c = self->c;
    renderstate *rs = self->rs;

    framebuffer *f = rs->frame;

    graphics_bind_fbo(f->fbo);
    graphics_set_view(0, 0, f->width, f->height);
    graphics_clear_color_and_depth();

    // 3d

    // glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);

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
    graphics_bind_and_draw(draw_images);

    graphics_bind_fbo(0);
    renderstate_set_program(rs, SHADER_SCREEN);
    graphics_set_view(0, 0, rs->canvas_width, rs->canvas_height);
    matrix_orthographic_projection(rs->modelview, rs->canvas_orthographic, rs->modelviewprojection, 0, 0);
    renderstate_set_mvp(rs, rs->modelviewprojection);
    graphics_bind_texture(GL_TEXTURE0, f->textures[0]);
    graphics_bind_and_draw(rs->screen);
}
