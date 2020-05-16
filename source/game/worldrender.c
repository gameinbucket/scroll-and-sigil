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

static void recursive_skeleton(renderbuffer *b, bone *s, float bones[][16], transform *absolute, float *animate) {

    memcpy(b->vertices + b->vertex_pos, s->cube, CUBE_MODEL_VERTEX_BYTES);
    b->vertex_pos += CUBE_MODEL_VERTEX_COUNT;
    for (int k = 0; k < 6; k++) {
        render_index4(b);
    }

    int i = s->index;

    transform *relative = &s->relative;
    transform *abs_transform = &absolute[i];

    bone *parent = s->parent;
    if (parent != NULL) {

        // quaternion_multiply(abs_transform->quaternion, relative->quaternion, parent_transform->quaternion); // no animation

        float temp[4];
        quaternion_multiply(temp, relative->quaternion, &animate[i * 4]);

        int parent_index = parent->index;
        transform *parent_transform = &absolute[parent_index];

        quaternion_multiply(abs_transform->quaternion, temp, parent_transform->quaternion);

        abs_transform->position.x = relative->position.x + parent_transform->position.x;
        abs_transform->position.y = relative->position.y + parent_transform->position.y;
        abs_transform->position.z = relative->position.z + parent_transform->position.z;

        quaternion_to_matrix(bones[i], abs_transform->quaternion);
        matrix_set_translation(bones[i], abs_transform->position.x, abs_transform->position.y, abs_transform->position.z);

    } else {

        // memcpy(abs_transform, relative, sizeof(transform)); // no animation

        quaternion_multiply(abs_transform->quaternion, relative->quaternion, &animate[i * 4]);
        abs_transform->position.x = relative->position.x;
        abs_transform->position.y = relative->position.y;
        abs_transform->position.z = relative->position.z;

        quaternion_to_matrix(bones[i], abs_transform->quaternion);
        matrix_set_translation(bones[i], abs_transform->position.x, abs_transform->position.y, abs_transform->position.z);
    }

    if (s->child != NULL) {
        for (int i = 0; i < s->child_count; i++) {
            recursive_skeleton(b, s->child[i], bones, absolute, animate);
        }
    }
}

static void thing_render(renderstate *rs, __attribute__((unused)) float *view_projection, renderbuffer *b, thing *t) {

    renderbuffer_zero(b);

    // float mvp[16];
    // memcpy(mvp, view_projection, 16 * sizeof(float));
    // matrix_translate(mvp, t->x, t->y + 48 * 0.03f, t->z);
    // renderstate_set_mvp(rs, mvp);

    model *m = t->model_data;
    model_info *info = m->info;

    bone *master = info->master;
    euler_to_quaternion(master->relative.quaternion, 0.0f, t->rotation, 0.0f);

    master->relative.position.x = t->x;
    master->relative.position.y = t->y + 48 * 0.03f;
    master->relative.position.z = t->z;

    m->current_animation = model_animation_index_of_name(info, "walk");

    int frame = m->current_frame;
    int bone_count = info->bone_count;

    float *animate = &info->animations[m->current_animation].frames[frame * bone_count];

    transform absolute[SHADER_RENDER_MODEL_MAX_BONES];
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

// static void particle_render(uint_table *cache, particle *p, float sine, float cosine) {
//     renderbuffer *b = uint_table_get(cache, p->texture);
//     render_sprite(b, p->x, p->y, p->z, p->sprite_data, sine, cosine);
// }

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
    matrix_identity(normal_matrix);
    matrix_inverse(temp, normal_matrix);
    matrix_transpose(normal_matrix, temp);

    renderstate *rs = wr->rs;
    world *w = wr->w;

    wr->current_cache = !wr->current_cache;
    uint_table *cache = wr->current_cache ? wr->sector_cache_a : wr->sector_cache_b;

    // sectors

    if (depth_bias_mvp != NULL) {
        renderstate_set_program(rs, SHADER_TEXTURE_3D_SHADOWED);

        renderstate_set_mvp(rs, view_projection);
        renderstate_set_uniform_matrix(rs, "u_normal", normal_matrix);
        renderstate_set_uniform_vector(rs, "u_camera_position", c->x, c->y, c->z);
        renderstate_set_uniform_vector(rs, "u_light_direction", light_direction->x, light_direction->y, light_direction->z);
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

    // float sine = sinf(-c->ry);
    // float cosine = cosf(-c->ry);

    int particle_count = w->particle_count;
    particle **particles = w->particles;
    for (int i = 0; i < particle_count; i++) {
        // particle_render(cache, particles[i], sine, cosine);
        particle_render(cache, particles[i], view);
    }

    int decal_count = w->decal_count;
    decal **decals = w->decals;
    for (int i = 0; i < decal_count; i++) {
        decal_render(cache, decals[i]);
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
        renderstate_set_program(rs, SHADER_RENDER_MODEL_SHADOWED);

        // FIXME: using a different model matrix for rendering things messes up u_depth_bias_mvp

        renderstate_set_mvp(rs, view_projection);
        renderstate_set_uniform_matrix(rs, "u_normal", normal_matrix);
        renderstate_set_uniform_vector(rs, "u_camera_position", c->x, c->y, c->z);
        renderstate_set_uniform_vector(rs, "u_light_direction", light_direction->x, light_direction->y, light_direction->z);
        renderstate_set_uniform_matrix(rs, "u_depth_bias_mvp", depth_bias_mvp);
        graphics_bind_texture(GL_TEXTURE1, depth_texture);

    } else {
        renderstate_set_program(rs, SHADER_RENDER_MODEL);
    }

    renderbuffer *thing_buffer = wr->thing_buffer;

    thing **things = w->things;
    int thing_count = w->thing_count;
    for (int i = 0; i < thing_count; i++) {
        thing_render(rs, view_projection, thing_buffer, things[i]);
    }
}

void delete_worldrender(worldrender *self) {
    delete_uint_table(self->sector_cache_a);
    delete_uint_table(self->sector_cache_b);
}
