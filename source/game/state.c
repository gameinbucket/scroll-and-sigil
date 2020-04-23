#include "state.h"

state *new_state(world *w, renderstate *rs, soundstate *ss) {
    state *s = safe_calloc(1, sizeof(state));
    s->w = w;
    s->rs = rs;
    s->ss = ss;
    s->c = camera_init();
    s->c->x = 10;
    s->c->y = 1;
    s->c->z = 40;
    s->wr = new_worldrender(rs, w);

    wad_load_resources(rs, ss);
    worldrender_create_buffers(s->wr);

    wad_load_map(w);
    world_build_map(w);

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

    graphics_enable_cull();
    graphics_enable_depth();

    // shadow map

    shadowmap *s = rs->shadow_map;

    graphics_bind_fbo(s->fbo);
    graphics_set_view(0, 0, s->width, s->height);
    graphics_clear_depth();

    world_render(self->wr, c);

    // end shadow map

    framebuffer *f = rs->frame;

    graphics_bind_fbo(f->fbo);
    graphics_set_view(0, 0, f->width, f->height);
    graphics_clear_color_and_depth();

    // render scene

    matrix_perspective_projection(rs->mvp, rs->draw_perspective, rs->mv, -c->x, -c->y, -c->z, c->rx, c->ry);

    graphics_bind_texture(GL_TEXTURE1, s->depth_texture);

    world_render(self->wr, c);

    graphics_disable_cull();
    graphics_disable_depth();

    // end render scene

    renderstate_set_program(rs, SHADER_TEXTURE_2D);
    matrix_orthographic_projection(rs->mvp, rs->draw_orthographic, rs->mv, 0, 0);
    renderbuffer *draw_images = rs->draw_images;
    renderbuffer_zero(draw_images);
    render_image(draw_images, 0, 0, 110, 128, 0, 0, 1, 1);
    renderstate_set_mvp(rs, rs->mvp);
    renderstate_set_texture(rs, TEXTURE_BARON);
    graphics_bind_and_draw(draw_images);

    graphics_bind_fbo(0);
    renderstate_set_program(rs, SHADER_SCREEN);
    graphics_set_view(0, 0, rs->canvas_width, rs->canvas_height);
    matrix_orthographic_projection(rs->mvp, rs->canvas_orthographic, rs->mv, 0, 0);
    renderstate_set_mvp(rs, rs->mvp);
    graphics_bind_texture(GL_TEXTURE0, f->textures[0]);
    graphics_bind_and_draw(rs->draw_canvas);
}

void destroy_state(state *self) {
    destroy_worldrender(self->wr);
}
