#include "world_scene.h"

static void render_wall(vulkan_render_buffer *b, wall *w) {
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

static void render_triangle(vulkan_render_buffer *b, triangle *t) {
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

static void render_decal(vulkan_render_buffer *b, decal *d) {
    uint32_t pos = b->vertex_position;
    float *vertices = b->vertices;

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

    b->vertex_position = pos + 32;
    render_index4(b);
}

static void thing_sprite_render(uint_table *cache, thing *t, float sine, float cosine) {
    vulkan_render_buffer *b = uint_table_get(cache, t->sprite_id);
    render_sprite(b, t->x, t->y, t->z, t->sprite_data, sine, cosine);
}

static void particle_render(uint_table *cache, particle *p, float *view) {
    vulkan_render_buffer *b = uint_table_get(cache, p->texture);
    render_aligned_sprite(b, p->x, p->y, p->z, p->sprite_data, view);
}

static void decal_render(uint_table *cache, decal *d) {
    vulkan_render_buffer *b = uint_table_get(cache, d->texture);
    render_decal(b, d);
}

static void memcopy_faces(vulkan_render_buffer *r, float *cube) {

    for (int f = 0; f < 6; f++) {
        if (skip_cube_model_face(cube, f)) {
            continue;
        }
        memcpy(r->vertices + r->vertex_position, &cube[CUBE_MODEL_STRIDE * f * 4], CUBE_MODEL_FACE_VERTEX_BYTES);
        r->vertex_position += CUBE_MODEL_FACE_VERTEX_COUNT;
        render_index4(r);
    }
}

static void memcopy_mesh(vulkan_render_buffer *r, bone *b) {

    int cube_count = b->cube_count;
    struct model_cube *cubes = b->cubes;

    for (int c = 0; c < cube_count; c++) {

        struct model_cube *cube = &b->cubes[c];
        float *sample = cube->sample;
        float *extension = cube->extension;

        memcopy_faces(r, sample);
        memcopy_faces(r, extension);
    }

    for (int i = 0; i < b->child_count; i++) {
        memcopy_mesh(r, b->child[i]);
    }
}

static void thing_model_geometry(vulkan_render_buffer *r, thing *t) {

    model *m = t->model_data;
    model_info *info = m->info;
    bone *master = info->master;

    vulkan_render_buffer_zero(r);
    memcopy_mesh(r, master);
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

static void thing_model_render(thing *t, struct uniform_bones *ubo) {

    model *m = t->model_data;
    model_info *info = m->info;
    bone *master = info->master;

    euler_to_quaternion(master->local.rotation, 0.0f, MATH_PI - t->rotation, 0.0f);
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

    memcpy(ubo->bones, bones[0], bone_count * 16 * sizeof(float));
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
            vulkan_render_buffer *b = uint_table_get(cache, top->texture);
            render_wall(b, top);
        }

        if (ld->middle) {
            vulkan_render_buffer *b = uint_table_get(cache, middle->texture);
            render_wall(b, middle);
        }

        if (ld->bottom) {
            vulkan_render_buffer *b = uint_table_get(cache, bottom->texture);
            render_wall(b, bottom);
        }
    }

    triangle **triangles = s->triangles;
    int triangle_count = s->triangle_count;

    for (int i = 0; i < triangle_count; i++) {
        triangle *td = triangles[i];
        vulkan_render_buffer *b = uint_table_get(cache, td->texture);
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
        vulkan_render_buffer *b = pair.value;
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
        vulkan_render_buffer *b = pair.value;
        vulkan_render_buffer_immediate_flush(vk_state, vk_base->vk_command_pool, b);
    }

    // things

    thing_model_geometry(self->thing_buffer, w->thing_models[0]);
    vulkan_render_buffer_immediate_flush(vk_state, vk_base->vk_command_pool, self->thing_buffer);
}

void world_scene_transfers(struct vulkan_state *vk_state, struct vulkan_base *vk_base, world_scene *self, VkCommandBuffer command_buffer, uint32_t image_index) {

    world *w = self->w;
    camera *c = self->c;

    {
        float width = (float)vk_base->swapchain->swapchain_extent.width;
        float height = (float)vk_base->swapchain->swapchain_extent.height;
        float ratio = width / height;

        float perspective[16];
        float correction[16];
        float original[16];

        matrix_vulkan_correction(correction);
        matrix_perspective(original, 60.0, 0.01, 100, ratio);
        matrix_multiply(perspective, correction, original);
        matrix_perspective_projection(self->model_view_projection, perspective, self->view, -c->x, -c->y, -c->z, c->rx, c->ry);
    }

    // sprites

    uint_table *sprite_cache = self->sprite_cache[image_index];

    {
        uint_table_iterator iter = create_uint_table_iterator(sprite_cache);
        while (uint_table_iterator_has_next(&iter)) {
            uint_table_pair pair = uint_table_iterator_next(&iter);
            vulkan_render_buffer_zero((vulkan_render_buffer *)pair.value);
        }
    }

    // particles

    int particle_count = w->particle_count;
    particle **particles = w->particles;
    for (int i = 0; i < particle_count; i++) {
        particle_render(sprite_cache, particles[i], self->view);
    }

    // decals

    int decal_count = w->decal_count;
    decal **decals = w->decals;
    for (int i = 0; i < decal_count; i++) {
        decal_render(sprite_cache, decals[i]);
    }

    // things

    float sine = sinf(-c->ry);
    float cosine = cosf(-c->ry);

    int thing_sprite_count = w->thing_sprites_count;
    thing **thing_sprites = w->thing_sprites;
    for (int i = 0; i < thing_sprite_count; i++) {
        thing_sprite_render(sprite_cache, thing_sprites[i], sine, cosine);
    }

    // render

    for (int i = 0; i < TEXTURE_COUNT; i++) {

        vulkan_render_buffer *sprites = uint_table_get(sprite_cache, i);
        vulkan_render_buffer_flush(vk_state, command_buffer, sprites);
    }
}

void world_scene_render(struct vulkan_state *vk_state, struct vulkan_base *vk_base, world_scene *self, VkCommandBuffer command_buffer, uint32_t image_index) {

    world *w = self->w;
    camera *c = self->c;

    struct texture_3d_shader *scene_shader = self->scene_shader;
    struct vulkan_pipeline *pipeline = scene_shader->pipeline;

    {
        struct uniform_projection ubo;

        memcpy(ubo.mvp, self->model_view_projection, 16 * sizeof(float));

        vulkan_copy_memory(scene_shader->uniforms->mapped_memory[image_index], &ubo, sizeof(ubo));
    }

    vulkan_pipeline_cmd_bind(pipeline, command_buffer);

    vulkan_pipeline_cmd_bind_set(pipeline, command_buffer, 0, 1, &scene_shader->descriptor_sets[image_index]);

    // render

    uint_table *sector_cache = self->sector_cache;
    uint_table *sprite_cache = self->sprite_cache[image_index];

    for (int i = 0; i < TEXTURE_COUNT; i++) {
        VkDescriptorSet get_image = image_descriptor_system_get(self->image_descriptors, i);
        vulkan_pipeline_cmd_bind_set(pipeline, command_buffer, 1, 1, &get_image);

        vulkan_render_buffer *sectors = uint_table_get(sector_cache, i);
        vulkan_render_buffer_draw(sectors, command_buffer);

        vulkan_render_buffer *sprites = uint_table_get(sprite_cache, i);
        vulkan_render_buffer_draw(sprites, command_buffer);
    }

    // thing models

    struct render_model_shader *scene_model_shader = self->scene_model_shader;
    pipeline = scene_model_shader->pipeline;

    {
        struct uniform_projection_and_normal ubo;

        float temp[16];
        matrix_identity(ubo.normal);
        matrix_inverse(temp, ubo.normal);
        matrix_transpose(ubo.normal, temp);

        memcpy(ubo.mvp, self->model_view_projection, 16 * sizeof(float));

        vulkan_copy_memory(scene_model_shader->uniforms1->mapped_memory[image_index], &ubo, sizeof(ubo));
    }

    vulkan_pipeline_cmd_bind(pipeline, command_buffer);

    vulkan_pipeline_cmd_bind_set(pipeline, command_buffer, 0, 1, &scene_model_shader->descriptor_sets1[image_index]);

    VkDescriptorSet image_descriptor = image_descriptor_system_get(self->image_descriptors, TEXTURE_HERO);
    vulkan_pipeline_cmd_bind_set(pipeline, command_buffer, 1, 1, &image_descriptor);

    int thing_model_count = w->thing_models_count;
    thing **thing_models = w->thing_models;

    struct vulkan_uniform_buffer *uniform_buffer = scene_model_shader->uniforms3;
    void *mapped_memory = uniform_buffer->mapped_memory[image_index];

    for (int i = 0; i < thing_model_count; i++) {

        struct uniform_bones ubo = {0};
        thing_model_render(thing_models[i], &ubo);

        const uint32_t dynamic = i * uniform_buffer->dynamic_alignment;
        void *map_pointer = (void *)((char *)mapped_memory + dynamic);

        vulkan_copy_memory(map_pointer, &ubo, sizeof(ubo));
    }

    VkMappedMemoryRange memory_range = {0};
    memory_range.sType = VK_STRUCTURE_TYPE_MAPPED_MEMORY_RANGE;
    memory_range.memory = uniform_buffer->vk_uniform_buffers_memory[image_index];
    memory_range.size = thing_model_count * uniform_buffer->dynamic_alignment;

    VK_RESULT_OK(vkFlushMappedMemoryRanges(vk_state->vk_device, 1, &memory_range));

    for (int i = 0; i < thing_model_count; i++) {

        const uint32_t dynamic = i * uniform_buffer->dynamic_alignment;
        vulkan_pipeline_cmd_bind_dynamic_set(pipeline, command_buffer, 2, 1, &scene_model_shader->descriptor_sets3[image_index], 1, &dynamic);

        vulkan_render_buffer_draw(self->thing_buffer, command_buffer);
    }
}

void world_scene_initialize(vulkan_state *vk_state, vulkan_base *vk_base, VkCommandPool command_pool, world_scene *self) {

    uint32_t swapchain_copies = vk_base->swapchain->swapchain_image_count;

    struct vulkan_render_settings render_settings = {0};
    vulkan_render_settings_init(&render_settings, 3, 0, 2, 3, 0);

    self->sector_cache = create_uint_table();
    for (int i = 0; i < TEXTURE_COUNT; i++) {
        vulkan_render_buffer *b = create_vulkan_render_buffer(vk_state, render_settings, 4 * 800, 36 * 800);
        uint_table_put(self->sector_cache, i, b);
    }

    self->sprite_cache = safe_calloc(swapchain_copies, sizeof(uint_table *));
    for (uint32_t c = 0; c < swapchain_copies; c++) {
        self->sprite_cache[c] = create_uint_table();
        for (int i = 0; i < TEXTURE_COUNT; i++) {
            vulkan_render_buffer *b = create_vulkan_render_buffer(vk_state, render_settings, 4 * 800, 36 * 800);
            uint_table_put(self->sprite_cache[c], i, b);
        }
    }

    vulkan_render_settings_init(&render_settings, 3, 0, 2, 3, 1);
    self->thing_buffer = create_vulkan_render_buffer(vk_state, render_settings, 4 * 800, 36 * 800);
}

world_scene *create_world_scene(world *w) {
    world_scene *self = safe_calloc(1, sizeof(world_scene));
    self->w = w;
    return self;
}

void delete_world_scene(vulkan_state *vk_state, vulkan_base *vk_base, world_scene *self) {

    uint32_t swapchain_copies = vk_base->swapchain->swapchain_image_count;

    for (int i = 0; i < TEXTURE_COUNT; i++) {
        delete_vulkan_renderbuffer(vk_state, uint_table_get(self->sector_cache, i));
    }
    delete_uint_table(self->sector_cache);

    for (uint32_t c = 0; c < swapchain_copies; c++) {
        uint_table *cache = self->sprite_cache[c];
        for (int i = 0; i < TEXTURE_COUNT; i++) {
            delete_vulkan_renderbuffer(vk_state, uint_table_get(cache, i));
        }
        delete_uint_table(cache);
    }
    free(self->sprite_cache);

    delete_vulkan_renderbuffer(vk_state, self->thing_buffer);

    free(self);
}
