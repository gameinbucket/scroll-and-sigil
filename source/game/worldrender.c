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

static void render_decal(renderbuffer *b, decal *d) {
    int pos = b->vertex_pos;
    GLfloat *vertices = b->vertices;

    vertices[pos] = d->x1;
    vertices[pos + 1] = d->y1;
    vertices[pos + 2] = d->z1;
    vertices[pos + 3] = d->u1;
    vertices[pos + 4] = d->v1;
    vertices[pos + 5] = d->nx;
    vertices[pos + 6] = d->ny;
    vertices[pos + 7] = d->nz;

    vertices[pos + 8] = d->x2;
    vertices[pos + 9] = d->y2;
    vertices[pos + 10] = d->z2;
    vertices[pos + 11] = d->u2;
    vertices[pos + 12] = d->v2;
    vertices[pos + 13] = d->nx;
    vertices[pos + 14] = d->ny;
    vertices[pos + 15] = d->nz;

    vertices[pos + 16] = d->x3;
    vertices[pos + 17] = d->y3;
    vertices[pos + 18] = d->z3;
    vertices[pos + 19] = d->u3;
    vertices[pos + 20] = d->v3;
    vertices[pos + 21] = d->nx;
    vertices[pos + 22] = d->ny;
    vertices[pos + 23] = d->nz;

    vertices[pos + 24] = d->x4;
    vertices[pos + 25] = d->y4;
    vertices[pos + 26] = d->z4;
    vertices[pos + 27] = d->u4;
    vertices[pos + 28] = d->v4;
    vertices[pos + 29] = d->nx;
    vertices[pos + 30] = d->ny;
    vertices[pos + 31] = d->nz;

    b->vertex_pos = pos + 32;
    render_index4(b);
}

static void recursive_skeleton(renderbuffer *rb, bone *b, float bones[][16], float absolute[][16], float *animate) {

    int cube_count = b->cube_count;
    memcpy(rb->vertices + rb->vertex_pos, b->cubes, cube_count * CUBE_MODEL_VERTEX_BYTES);
    rb->vertex_pos += cube_count * CUBE_MODEL_VERTEX_COUNT;
    for (int c = 0; c < cube_count; c++) {
        for (int k = 0; k < 6; k++) {
            render_index4(rb);
        }
    }

    int index = b->index;
    bone *parent = b->parent;

    transform *local = &b->local;
    float *world = absolute[index];

    if (parent == NULL) {
        rotation_and_position_to_matrix(world, local->rotation, local->position);
    } else {
        float local_matrix[16];
        rotation_and_position_to_matrix(local_matrix, local->rotation, local->position);
        matrix_multiply(world, absolute[parent->index], local_matrix);
    }

    matrix_multiply(bones[index], world, b->inverse_bind_pose_matrix);

    for (int i = 0; i < b->child_count; i++) {
        recursive_skeleton(rb, b->child[i], bones, absolute, animate);
    }
}

static void thing_model_render(renderstate *rs, renderbuffer *b, thing *t) {

    renderbuffer_zero(b);

    model *m = t->model_data;
    model_info *info = m->info;

    bone *master = info->master;

    euler_to_quaternion(master->local.rotation, 0.0f, -t->rotation, 0.0f);
    master->local.position[0] = t->x;
    master->local.position[1] = t->y + 48 * 0.03f;
    master->local.position[2] = t->z;

    m->current_animation = model_animation_index_of_name(info, "walk");

    int frame = m->current_frame;
    int bone_count = info->bone_count;

    float *animate = &info->animations[m->current_animation].frames[frame * bone_count];

    float absolute[SHADER_RENDER_MODEL_MAX_BONES][16];
    float bones[SHADER_RENDER_MODEL_MAX_BONES][16];

    recursive_skeleton(b, master, bones, absolute, animate);
    renderstate_set_uniform_matrices(rs, "u_bones", bones[0], bone_count);

    renderstate_set_texture(rs, info->texture_id);
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

static void thing_sprite_render(uint_table *cache, thing *t, float sine, float cosine) {
    renderbuffer *b = uint_table_get(cache, t->sprite_id);
    render_sprite(b, t->x, t->y, t->z, t->sprite_data, sine, cosine);
}

static void particle_render(uint_table *cache, particle *p, float *view) {
    renderbuffer *b = uint_table_get(cache, p->texture);
    render_aligned_sprite(b, p->x, p->y, p->z, p->sprite_data, view);
}

static void decal_render(uint_table *cache, decal *d) {
    renderbuffer *b = uint_table_get(cache, d->texture);
    render_decal(b, d);
}

void world_render(worldrender *wr, camera *c, float view[16], float view_projection[16], vec3 *light_direction, float depth_bias_mvp[16], GLuint depth_texture) {

    float temp[16];
    float normal_matrix[16];

    renderstate *rs = wr->rs;
    world *w = wr->w;

    wr->current_cache = !wr->current_cache;
    uint_table *cache = wr->current_cache ? wr->sector_cache_a : wr->sector_cache_b;

    // sectors

    if (depth_bias_mvp != NULL) {

        matrix_identity(normal_matrix);
        matrix_inverse(temp, normal_matrix);
        matrix_transpose(normal_matrix, temp);

        if (rs->ssao_on) {
            renderstate_set_program(rs, SHADER_GBUFFER);
        } else {
            renderstate_set_program(rs, SHADER_TEXTURE_3D_SHADOWED);
        }

        renderstate_set_uniform_matrix(rs, "u_normal", normal_matrix);
        renderstate_set_uniform_vector(rs, "u_camera_position", c->x, c->y, c->z);
        renderstate_set_uniform_vector(rs, "u_light_direction", light_direction->x, light_direction->y, light_direction->z);
        renderstate_set_uniform_matrix(rs, "u_depth_bias_mvp", depth_bias_mvp);
        renderstate_set_uniform_matrix(rs, "u_view", view);
        graphics_bind_texture(GL_TEXTURE1, depth_texture);

    } else {
        renderstate_set_program(rs, SHADER_SHADOW_PASS);
    }

    renderstate_set_mvp(rs, view_projection);

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

    int particle_count = w->particle_count;
    particle **particles = w->particles;
    for (int i = 0; i < particle_count; i++) {
        particle_render(cache, particles[i], view);
    }

    // opengl.depth_mask_off();
    // glEnable(GL_POLYGON_OFFSET_FILL);
    // glPolygonOffset(-1, -1);

    int decal_count = w->decal_count;
    decal **decals = w->decals;
    for (int i = 0; i < decal_count; i++) {
        decal_render(cache, decals[i]);
    }

    float sine = sinf(-c->ry);
    float cosine = cosf(-c->ry);

    int thing_sprite_count = w->thing_sprites_count;
    thing **thing_sprites = w->thing_sprites;
    for (int i = 0; i < thing_sprite_count; i++) {
        thing_sprite_render(cache, thing_sprites[i], sine, cosine);
    }

    iter = create_uint_table_iterator(cache);
    while (uint_table_iterator_has_next(&iter)) {
        uint_table_pair pair = uint_table_iterator_next(&iter);
        renderbuffer *b = pair.value;
        renderstate_set_texture(rs, pair.key);
        graphics_bind_and_draw(b);
    }

    // things

    if (depth_bias_mvp != NULL) {

        if (rs->ssao_on) {
            renderstate_set_program(rs, SHADER_RENDER_MODEL_GBUFFER);
        } else {
            renderstate_set_program(rs, SHADER_RENDER_MODEL_SHADOWED);
        }

        renderstate_set_uniform_matrix(rs, "u_normal", normal_matrix);
        renderstate_set_uniform_vector(rs, "u_camera_position", c->x, c->y, c->z);
        renderstate_set_uniform_vector(rs, "u_light_direction", light_direction->x, light_direction->y, light_direction->z);
        renderstate_set_uniform_matrix(rs, "u_depth_bias_mvp", depth_bias_mvp);
        renderstate_set_uniform_matrix(rs, "u_view", view);
        graphics_bind_texture(GL_TEXTURE1, depth_texture);

    } else {
        renderstate_set_program(rs, SHADER_MODEL_SHADOW_PASS);
    }

    renderstate_set_mvp(rs, view_projection);

    renderbuffer *thing_buffer = wr->thing_buffer;

    int thing_model_count = w->thing_models_count;
    thing **thing_models = w->thing_models;
    for (int i = 0; i < thing_model_count; i++) {
        thing_model_render(rs, thing_buffer, thing_models[i]);
    }
}

void delete_worldrender(worldrender *self) {
    delete_uint_table(self->sector_cache_a);
    delete_uint_table(self->sector_cache_b);
}
