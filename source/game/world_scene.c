#include "world_scene.h"

static void render_wall(struct vulkan_render_buffer *b, wall *w) {
    uint32_t pos = b->vertex_position;
    float *vertices = b->vertices;

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

    b->vertex_position = pos + 32;
    render_index4(b);
}

static void render_triangle(struct vulkan_render_buffer *b, triangle *t) {
    uint32_t pos = b->vertex_position;
    float *vertices = b->vertices;

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

    b->vertex_position = pos + 24;
    render_index3(b);
}

// static void render_decal(struct vulkan_render_buffer *b, decal *d) {
//     uint32_t pos = b->vertex_position;
//     float *vertices = b->vertices;

//     vertices[pos] = d->x1;
//     vertices[pos + 1] = d->y1;
//     vertices[pos + 2] = d->z1;
//     vertices[pos + 3] = d->u1;
//     vertices[pos + 4] = d->v1;
//     vertices[pos + 5] = d->nx;
//     vertices[pos + 6] = d->ny;
//     vertices[pos + 7] = d->nz;

//     vertices[pos + 8] = d->x2;
//     vertices[pos + 9] = d->y2;
//     vertices[pos + 10] = d->z2;
//     vertices[pos + 11] = d->u2;
//     vertices[pos + 12] = d->v2;
//     vertices[pos + 13] = d->nx;
//     vertices[pos + 14] = d->ny;
//     vertices[pos + 15] = d->nz;

//     vertices[pos + 16] = d->x3;
//     vertices[pos + 17] = d->y3;
//     vertices[pos + 18] = d->z3;
//     vertices[pos + 19] = d->u3;
//     vertices[pos + 20] = d->v3;
//     vertices[pos + 21] = d->nx;
//     vertices[pos + 22] = d->ny;
//     vertices[pos + 23] = d->nz;

//     vertices[pos + 24] = d->x4;
//     vertices[pos + 25] = d->y4;
//     vertices[pos + 26] = d->z4;
//     vertices[pos + 27] = d->u4;
//     vertices[pos + 28] = d->v4;
//     vertices[pos + 29] = d->nx;
//     vertices[pos + 30] = d->ny;
//     vertices[pos + 31] = d->nz;

//     b->vertex_position = pos + 32;
//     render_index4(b);
// }

static void memcopy_skeleton(struct vulkan_render_buffer *r, bone *b) {

    int cube_count = b->cube_count;
    memcpy(r->vertices + r->vertex_position, b->cubes, cube_count * CUBE_MODEL_VERTEX_BYTES);
    r->vertex_position += cube_count * CUBE_MODEL_VERTEX_COUNT;
    for (int c = 0; c < cube_count; c++) {
        for (int k = 0; k < 6; k++) {
            render_index4(r);
        }
    }

    for (int i = 0; i < b->child_count; i++) {
        memcopy_skeleton(r, b->child[i]);
    }
}

static void thing_model_geometry(struct vulkan_render_buffer *r, thing *t) {

    model *m = t->model_data;
    model_info *info = m->info;
    bone *master = info->master;

    vulkan_render_buffer_zero(r);
    memcopy_skeleton(r, master);
}

static void thing_model_render_recursive(bone *b, float bones[][16], float absolute[][16], float *animate) {

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
        thing_model_render_recursive(b->child[i], bones, absolute, animate);
    }
}

static void thing_model_render(thing *t) {

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

    thing_model_render_recursive(master, bones, absolute, animate);
    // renderstate_set_uniform_matrices(r, "u_bones", bones[0], bone_count);
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
            struct vulkan_render_buffer *b = uint_table_get(cache, top->texture);
            render_wall(b, top);
        }

        if (ld->middle) {
            struct vulkan_render_buffer *b = uint_table_get(cache, middle->texture);
            render_wall(b, middle);
        }

        if (ld->bottom) {
            struct vulkan_render_buffer *b = uint_table_get(cache, bottom->texture);
            render_wall(b, bottom);
        }
    }

    triangle **triangles = s->triangles;
    int triangle_count = s->triangle_count;

    for (int i = 0; i < triangle_count; i++) {
        triangle *td = triangles[i];
        struct vulkan_render_buffer *b = uint_table_get(cache, td->texture);
        render_triangle(b, td);
    }
}

void world_scene_geometry(struct vulkan_state *vk_state, struct vulkan_base *vk_base, world_scene *self) {

    world *w = self->w;

    // sectors

    uint_table *cache = self->sector_cache;

    uint_table_iterator iter = create_uint_table_iterator(cache);
    while (uint_table_iterator_has_next(&iter)) {
        uint_table_pair pair = uint_table_iterator_next(&iter);
        struct vulkan_render_buffer *b = pair.value;
        vulkan_render_buffer_zero(b);
    }

    sector **sectors = w->sectors;
    int sector_count = w->sector_count;
    for (int i = 0; i < sector_count; i++) {
        sector_render(cache, sectors[i]);
    }

    iter = create_uint_table_iterator(cache);
    while (uint_table_iterator_has_next(&iter)) {
        uint_table_pair pair = uint_table_iterator_next(&iter);
        struct vulkan_render_buffer *b = pair.value;
        vulkan_render_buffer_initialize(vk_state, vk_base->vk_command_pool, b);
    }

    // things

    thing_model_geometry(self->thing_buffer, w->thing_models[0]);
}

void world_scene_render(struct vulkan_state *vk_state, struct vulkan_base *vk_base, world_scene *self, VkCommandBuffer command_buffer, uint32_t image_index) {

    world *w = self->w;
    camera *c = self->c;

    float view[16];
    float perspective[16];

    // sectors

    {
        struct uniform_buffer_projection ubo = {0};

        float width = (float)vk_base->swapchain->swapchain_extent.width;
        float height = (float)vk_base->swapchain->swapchain_extent.height;
        float ratio = width / height;

        // matrix_perspective_vulkan(perspective, 60.0, 0.01, 100, ratio);

        float correction[16];
        matrix_vulkan_correction(correction);
        float original[16];
        matrix_perspective(original, 60.0, 0.01, 100, ratio);
        matrix_multiply(perspective, correction, original);

        matrix_perspective_projection(ubo.mvp, perspective, view, -c->x, -c->y, -c->z, c->rx, c->ry);

        vulkan_uniform_mem_copy(vk_state, self->pipeline, image_index, &ubo, sizeof(ubo));
    }

    uint_table *cache = self->sector_cache;

    struct vulkan_pipeline *pipeline = self->pipeline;

    vulkan_pipeline_cmd_bind(pipeline, command_buffer);
    vulkan_pipeline_cmd_bind_uniform_description(pipeline, command_buffer, image_index);

    uint_table_iterator iter = create_uint_table_iterator(cache);
    while (uint_table_iterator_has_next(&iter)) {
        uint_table_pair pair = uint_table_iterator_next(&iter);

        struct vulkan_render_buffer *b = pair.value;

        vulkan_pipeline_cmd_bind_indexed_image_description(pipeline, command_buffer, image_index, pair.key);
        vulkan_render_buffer_draw(b, command_buffer);
    }

    // things

    // pipeline = self->pipeline_model;

    // struct uniform_buffer_object_with_normal ubo = {0};

    // float temp[16];
    // matrix_identity(ubo.normal);
    // matrix_inverse(temp, ubo.normal);
    // matrix_transpose(ubo.normal, temp);

    // vulkan_pipeline_cmd_bind(pipeline, command_buffer);

    // vulkan_uniform_mem_copy(vk_state, self->pipeline, image_index, ubo);
    // vulkan_pipeline_cmd_bind_uniform_description(pipeline, command_buffer, image_index);
    // vulkan_pipeline_cmd_bind_indexed_image_description(pipeline, command_buffer, image_index, TEXTURE_GRASS);

    // int thing_model_count = w->thing_models_count;
    // thing **thing_models = w->thing_models;
    // for (int i = 0; i < thing_model_count; i++) {

    //     thing_model_render(thing_models[i]);

    //     vulkan_render_buffer_draw(self->thing_buffer, command_buffer);
    // }
}

void world_scene_initialize(__attribute__((unused)) vulkan_state *vk_state, __attribute__((unused)) VkCommandPool command_pool, world_scene *self) {

    struct vulkan_render_settings render_settings = {0};
    vulkan_render_settings_init(&render_settings, 3, 0, 2, 3, 0);

    for (int i = 0; i < TEXTURE_COUNT; i++) {
        struct vulkan_render_buffer *b = create_vulkan_render_buffer(render_settings, 4 * 800, 36 * 800);
        // vulkan_render_buffer_initialize(vk_state, command_pool, b);
        uint_table_put(self->sector_cache, i, b);
    }

    vulkan_render_settings_init(&render_settings, 3, 0, 2, 3, 1);
    self->thing_buffer = create_vulkan_render_buffer(render_settings, 4 * 800, 36 * 800);
}

world_scene *create_world_scene(world *w) {
    world_scene *self = safe_calloc(1, sizeof(world_scene));
    self->w = w;
    self->sector_cache = create_uint_table();
    return self;
}

void delete_world_scene(vulkan_state *vk_state, world_scene *self) {

    printf("delete world scene %p\n", (void *)self);

    for (int i = 0; i < TEXTURE_COUNT; i++) {
        delete_vulkan_renderbuffer(vk_state, uint_table_get(self->sector_cache, i));
    }

    delete_uint_table(self->sector_cache);

    free(self);
}
