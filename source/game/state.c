#include "state.h"

state *create_state(world *w, renderstate *rs, soundstate *ss) {

    state *self = safe_calloc(1, sizeof(state));
    self->w = w;
    self->rs = rs;
    self->ss = ss;
    self->ms = create_modelstate();
    self->c = create_camera(6);
    self->wr = create_worldrender(rs, w);

    wad_load_resources(rs, ss, self->ms);
    worldrender_create_buffers(self->wr);

    wad_load_map(w, &self->in, self->ms);

    int thing_count = w->thing_count;
    thing **things = w->things;
    for (int i = 0; i < thing_count; i++) {
        if (things[i]->type == THING_TYPE_HERO) {
            self->h = things[i];
            self->c->target = self->h;
            break;
        }
    }

    return self;
}

void state_update(state *self) {

    world_update(self->w);

    input *in = &self->in;

    // float speed = 0.1f;

    // float r = self->c->ry;

    // float dx = 0;
    // float dy = 0;
    // float dz = 0;

    // const float MAXSPEED = 0.5f;

    // if (in.move_forward) {
    //     dx += sinf(r) * speed;
    //     dz -= cosf(r) * speed;
    // }

    // if (in.move_backward) {
    //     dx -= sinf(r) * speed * 0.5f;
    //     dz += cosf(r) * speed * 0.5f;
    // }

    // if (in.move_up) {
    //     self->c->y += 0.1;
    // }

    // if (in.move_down) {
    //     self->c->y -= 0.1;
    // }

    // if (in.move_left) {
    //     dx -= cosf(r) * speed * 0.75f;
    //     dz -= sinf(r) * speed * 0.75f;
    // }

    // if (in.move_right) {
    //     dx += cosf(r) * speed * 0.75f;
    //     dz += sinf(r) * speed * 0.75f;
    // }

    // if (dx > MAXSPEED) {
    //     dx = MAXSPEED;
    // } else if (dx < -MAXSPEED) {
    //     dx = -MAXSPEED;
    // }

    // if (dy > MAXSPEED) {
    //     dy = MAXSPEED;
    // } else if (dy < -MAXSPEED) {
    //     dy = -MAXSPEED;
    // }

    // self->c->x += dx;
    // self->c->y += dy;
    // self->c->z += dz;

    if (in->look_left) {
        self->c->ry -= 0.05;
        if (self->c->ry < 0) {
            self->c->ry += FLOAT_MATH_TAU;
        }
    }

    if (in->look_right) {
        self->c->ry += 0.05;
        if (self->c->ry >= FLOAT_MATH_TAU) {
            self->c->ry -= FLOAT_MATH_TAU;
        }
    }

    if (in->look_up) {
        self->c->rx -= 0.05;
        if (self->c->rx < 0) {
            self->c->rx += FLOAT_MATH_TAU;
        }
    }

    if (in->look_down) {
        self->c->rx += 0.05;
        if (self->c->rx >= FLOAT_MATH_TAU) {
            self->c->rx -= FLOAT_MATH_TAU;
        }
    }

    camera_update(self->c);

    self->h->rotation_target = -self->c->ry;
}

void state_render(state *self) {

    camera *c = self->c;
    renderstate *rs = self->rs;

    graphics_enable_cull();
    graphics_enable_depth();

    // model view projection

    float view[16];
    float view_projection[16];

    matrix_identity(view);
    matrix_rotate_x(view, sinf(c->rx), cosf(c->rx));
    matrix_rotate_y(view, sinf(c->ry), cosf(c->ry));
    matrix_translate(view, -c->x, -c->y, -c->z);
    matrix_multiply(view_projection, rs->draw_perspective, view);

    // shadow map

    shadowmap *s = rs->shadow_map;

    graphics_bind_fbo(s->fbo);
    graphics_set_view(0, 0, s->width, s->height);
    graphics_clear_depth();

    float shadow_view[16];
    float shadow_view_projection[16];

    vec3 eye = {0, 10, 0};
    vec3 center = {2, 0, 10};
    matrix_look_at(shadow_view, &eye, &center);
    // matrix_translate(shadow_view, -eye.x, -eye.y, -eye.z);

    vec3 light_direction = {eye.x - center.x, eye.y - center.y, eye.z - center.z};
    vector3_normalize(&light_direction);

    camera shadow_camera = {0};
    shadow_camera.rx = -shadow_view[12];
    shadow_camera.ry = -shadow_view[14];

    shadow_map_view_projection(shadow_view_projection, shadow_view, view, view_projection);

    float shadow_bias[16] = {0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, 0.5, 0.5, 0.5, 1};

    float depth_bias_mvp[16];
    matrix_multiply(depth_bias_mvp, shadow_bias, shadow_view_projection);

    renderstate_set_program(rs, SHADER_SHADOW_PASS);
    renderstate_set_mvp(rs, shadow_view_projection);

    graphics_cull_front();

    world_render(self->wr, &shadow_camera, shadow_view, shadow_view_projection, NULL, NULL, 0);

    // ----------------------------------------

    graphics_cull_back();

    framebuffer *f = rs->frame;

    graphics_bind_fbo(f->fbo);
    graphics_set_view(0, 0, f->width, f->height);
    graphics_clear_color_and_depth();

    world_render(self->wr, c, view, view_projection, &light_direction, depth_bias_mvp, s->depth_texture);

    graphics_disable_cull();
    graphics_disable_depth();

    // ----------------------------------------

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
    // renderstate_set_program(rs, SHADER_VISUALIZE_DEPTH);
    graphics_set_view(0, 0, rs->canvas_width, rs->canvas_height);
    matrix_orthographic_projection(rs->mvp, rs->canvas_orthographic, rs->mv, 0, 0);
    renderstate_set_mvp(rs, rs->mvp);
    graphics_bind_texture(GL_TEXTURE0, f->textures[0]);
    // graphics_bind_texture(GL_TEXTURE0, s->depth_texture);
    graphics_bind_and_draw(rs->draw_canvas);
}

void delete_state(state *self) {
    delete_worldrender(self->wr);
}
