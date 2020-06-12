#include "scene.h"

struct scene *create_scene(struct vulkan_pipeline *pipeline) {

    struct scene *self = safe_calloc(1, sizeof(struct scene));

    self->pipeline = pipeline;

    return self;
}

void render_scene(struct vulkan_state *vk_state, struct vulkan_base *vk_base, struct scene *self, VkCommandBuffer command_buffer, uint32_t image_index) {

    vulkan_pipeline_draw(self->pipeline, self->pipeline->renderbuffer, command_buffer, image_index);

    struct uniform_buffer_object ubo = {0};

    float view[16];
    float perspective[16];

    static float x = 0.0f;
    x += 0.01f;
    vec3 eye = {3 + x, 3, 5};
    vec3 center = {0, 0, 0};
    matrix_look_at(view, &eye, &center);
    matrix_translate(view, -eye.x, -eye.y, -eye.z);

    float width = (float)vk_base->swapchain->swapchain_extent.width;
    float height = (float)vk_base->swapchain->swapchain_extent.height;
    float ratio = width / height;
    matrix_perspective(perspective, 60.0, 0.01, 100, ratio);

    matrix_multiply(ubo.mvp, perspective, view);

    vk_update_uniform_buffer(vk_state, self->pipeline, image_index, ubo);
}

void delete_scene(struct scene *self) {

    free(self);
}
