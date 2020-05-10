#include "worldrender.h"

worldrender *create_worldrender(renderstate *rs, world *w) {
    worldrender *self = safe_calloc(1, sizeof(worldrender));
    self->rs = rs;
    self->w = w;
    self->sector_cache_a = create_uint_table();
    self->sector_cache_b = create_uint_table();
    return self;
}

static void create_cache(uint_table *cache) {
    for (int i = 0; i < TEXTURE_COUNT; i++) {
        renderbuffer *b = create_renderbuffer(3, 0, 2, 3, 0, 4 * 800, 36 * 800, true);
        graphics_make_vao(b);

        uint_table_put(cache, i, b);
    }
}

void worldrender_create_buffers(worldrender *self) {
    create_cache(self->sector_cache_a);
    create_cache(self->sector_cache_b);

    self->thing_buffer = create_renderbuffer(3, 0, 2, 3, 1, 4 * 800, 36 * 800, false);
    graphics_make_vao(self->thing_buffer);
}

static void render_wall(renderbuffer *b, wall *w) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    vertices[pos] = w->va.x;
    vertices[pos + 1] = w->ceiling;
    vertices[pos + 2] = w->va.y;
    vertices[pos + 3] = w->u;
    vertices[pos + 4] = w->t;
    vertices[pos + 5] = w->ld->normal.x;
    vertices[pos + 6] = 0;
    vertices[pos + 7] = w->ld->normal.y;

    vertices[pos + 8] = w->va.x;
    vertices[pos + 9] = w->floor;
    vertices[pos + 10] = w->va.y;
    vertices[pos + 11] = w->u;
    vertices[pos + 12] = w->v;
    vertices[pos + 13] = w->ld->normal.x;
    vertices[pos + 14] = 0;
    vertices[pos + 15] = w->ld->normal.y;

    vertices[pos + 16] = w->vb.x;
    vertices[pos + 17] = w->floor;
    vertices[pos + 18] = w->vb.y;
    vertices[pos + 19] = w->s;
    vertices[pos + 20] = w->v;
    vertices[pos + 21] = w->ld->normal.x;
    vertices[pos + 22] = 0;
    vertices[pos + 23] = w->ld->normal.y;

    vertices[pos + 24] = w->vb.x;
    vertices[pos + 25] = w->ceiling;
    vertices[pos + 26] = w->vb.y;
    vertices[pos + 27] = w->s;
    vertices[pos + 28] = w->t;
    vertices[pos + 29] = w->ld->normal.x;
    vertices[pos + 30] = 0;
    vertices[pos + 31] = w->ld->normal.y;

    b->vertex_pos = pos + 32;
    render_index4(b);
}

static void render_triangle(renderbuffer *b, triangle *t) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    vertices[pos] = t->vc.x;
    vertices[pos + 1] = t->height;
    vertices[pos + 2] = t->vc.y;
    vertices[pos + 3] = t->u3;
    vertices[pos + 4] = t->v3;
    vertices[pos + 5] = 0;
    vertices[pos + 6] = t->normal;
    vertices[pos + 7] = 0;

    vertices[pos + 8] = t->vb.x;
    vertices[pos + 9] = t->height;
    vertices[pos + 10] = t->vb.y;
    vertices[pos + 11] = t->u2;
    vertices[pos + 12] = t->v2;
    vertices[pos + 13] = 0;
    vertices[pos + 14] = t->normal;
    vertices[pos + 15] = 0;

    vertices[pos + 16] = t->va.x;
    vertices[pos + 17] = t->height;
    vertices[pos + 18] = t->va.y;
    vertices[pos + 19] = t->u1;
    vertices[pos + 20] = t->v1;
    vertices[pos + 21] = 0;
    vertices[pos + 22] = t->normal;
    vertices[pos + 23] = 0;

    b->vertex_pos = pos + 24;
    render_index3(b);
}

static void recursive_skeleton(renderbuffer *b, bone *s, float bones[][16], float absolute[][16]) {

    memcpy(b->vertices + b->vertex_pos, s->cube, CUBE_MODEL_VERTEX_BYTES);
    b->vertex_pos += CUBE_MODEL_VERTEX_COUNT;
    for (int k = 0; k < 6; k++) {
        render_index4(b);
    }

    int i = s->index;

    bone *parent = s->parent;
    if (parent != NULL) {
        int parent_index = parent->index;
        matrix_multiply(absolute[i], absolute[parent_index], s->relative);
        matrix_multiply(bones[i], absolute[i], s->inverse_bind_pose);
    } else {
        memcpy(absolute[i], s->relative, 16 * sizeof(float));
        matrix_multiply(bones[i], s->relative, s->inverse_bind_pose);
    }

    if (s->child != NULL) {
        for (int i = 0; i < s->child_count; i++) {
            recursive_skeleton(b, s->child[i], bones, absolute);
        }
    }
}

static void thing_render(renderstate *rs, renderbuffer *b, thing *t) {

    renderbuffer_zero(b);

    model *m = t->model_data;

    bone *body = &m->bones[BIPED_BODY];
    matrix_identity(body->relative);
    matrix_rotate_y(body->relative, sinf(t->rotation), cosf(t->rotation));
    matrix_translate(body->relative, t->x, t->y + 0.8f, t->z);

    // bone *head = &m->bones[BIPED_HEAD];
    // head->local_ry = t->rotation_target;

    float bones[BIPED_BONES][16];
    float absolute[BIPED_BONES][16];
    recursive_skeleton(b, body, bones, absolute);
    renderstate_set_uniform_matrices(rs, "u_bones", bones[0], BIPED_BONES);

    renderstate_set_texture(rs, t->sprite_id);
    graphics_update_and_draw(b);
}

__attribute__((unused)) static void thing_render_cpu(renderstate *rs, renderbuffer *b, thing *t) {

    renderbuffer_zero(b);

    model *m = t->model_data;

    bone *body = &m->bones[BIPED_BODY];
    body->world_x = t->x;
    body->world_y = t->y + 0.8;
    body->world_z = t->z;
    body->local_ry = t->rotation;

    bone *head = &m->bones[BIPED_HEAD];
    head->local_ry = t->rotation_target;

    bone_recursive_compute(body);
    render_model_cpu(b, m);

    renderstate_set_texture(rs, t->sprite_id);
    graphics_update_and_draw(b);
}

static void sector_render(uint_table *cache, sector *s) {
    line **lines = s->lines;
    int line_count = s->line_count;

    for (int i = 0; i < line_count; i++) {
        line *ld = lines[i];

        wall *top = ld->top;
        wall *middle = ld->middle;
        wall *bottom = ld->bottom;

        if (top) {
            renderbuffer *b = uint_table_get(cache, top->texture);
            render_wall(b, top);
        }

        if (ld->middle) {
            renderbuffer *b = uint_table_get(cache, middle->texture);
            render_wall(b, middle);
        }

        if (ld->bottom) {
            renderbuffer *b = uint_table_get(cache, bottom->texture);
            render_wall(b, bottom);
        }
    }

    triangle **triangles = s->triangles;
    int triangle_count = s->triangle_count;

    for (int i = 0; i < triangle_count; i++) {
        triangle *td = triangles[i];
        renderbuffer *b = uint_table_get(cache, td->texture);
        render_triangle(b, td);
    }
}

void world_render(worldrender *wr, camera *c, float view[16], float view_projection[16], float depth_bias_mvp[16], GLuint depth_texture) {

    if (c->x < -999) {
        printf("foobar\n");
    }

    renderstate *rs = wr->rs;
    world *w = wr->w;

    wr->current_cache = !wr->current_cache;
    uint_table *cache = wr->current_cache ? wr->sector_cache_a : wr->sector_cache_b;

    // sectors

    if (view_projection != NULL) {
        renderstate_set_program(rs, SHADER_TEXTURE_3D_SHADOWED);

        renderstate_set_mvp(rs, view_projection);
        renderstate_set_uniform_vector(rs, "u_camera_position", c->x, c->y, c->z);
        renderstate_set_uniform_matrix(rs, "u_depth_bias_mvp", depth_bias_mvp);
        graphics_bind_texture(GL_TEXTURE1, depth_texture);
    }

    uint_table_iterator iter = create_uint_table_iterator(cache);
    while (uint_table_iterator_has_next(&iter)) {
        uint_table_pair pair = uint_table_iterator_next(&iter);
        renderbuffer *b = pair.value;
        renderbuffer_zero(b);
    }

    sector **sectors = w->sectors;
    int sector_count = w->sector_count;
    for (int i = 0; i < sector_count; i++) {
        sector_render(cache, sectors[i]);
    }

    iter = create_uint_table_iterator(cache);
    while (uint_table_iterator_has_next(&iter)) {
        uint_table_pair pair = uint_table_iterator_next(&iter);
        renderbuffer *b = pair.value;
        renderstate_set_texture(rs, pair.key);
        graphics_bind_and_draw(b);
    }

    // things

    if (view_projection != NULL) {
        // renderstate_set_program(rs, SHADER_RENDER_MODEL_SHADOWED);
        renderstate_set_program(rs, SHADER_RENDER_MODEL);

        float inverse_view[16];
        float inverse_transpose_view[16];
        matrix_inverse(inverse_view, view);
        matrix_transpose(inverse_transpose_view, inverse_view);

        renderstate_set_mvp(rs, view_projection);
        renderstate_set_uniform_matrix(rs, "u_inverse_transpose_view", inverse_transpose_view);
        renderstate_set_uniform_vector(rs, "u_camera_position", c->x, c->y, c->z);
        renderstate_set_uniform_matrix(rs, "u_depth_bias_mvp", depth_bias_mvp);
        graphics_bind_texture(GL_TEXTURE1, depth_texture);

    } else {
        renderstate_set_program(rs, SHADER_RENDER_MODEL);
    }

    renderbuffer *thing_buffer = wr->thing_buffer;

    thing **things = w->things;
    int thing_count = w->thing_count;
    for (int i = 0; i < thing_count; i++) {
        thing_render(rs, thing_buffer, things[i]);
    }
}

void delete_worldrender(worldrender *self) {
    delete_uint_table(self->sector_cache_a);
    delete_uint_table(self->sector_cache_b);
}
