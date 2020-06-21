#include "scene.h"

struct scene *create_scene(struct vulkan_pipeline *pipeline, struct vulkan_render_buffer *render) {

    struct scene *self = safe_calloc(1, sizeof(struct scene));

    self->pipeline = pipeline;
    self->render = render;

    return self;
}

void scene_render(struct vulkan_state *vk_state, struct vulkan_base *vk_base, struct scene *self, VkCommandBuffer command_buffer, uint32_t image_index) {

    vulkan_pipeline_cmd_bind(self->pipeline, command_buffer);
    vulkan_pipeline_cmd_bind_description(self->pipeline, command_buffer, image_index);
    vulkan_render_buffer_draw(self->render, command_buffer);

    struct uniform_buffer_projection ubo = {0};

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
    matrix_perspective_vulkan(perspective, 60.0, 0.01, 100, ratio);

    matrix_multiply(ubo.mvp, perspective, view);

    vulkan_uniform_mem_copy(vk_state, self->pipeline->uniforms->vk_uniform_buffers_memory[image_index], &ubo, sizeof(ubo));
}

void delete_scene(struct vulkan_state *vk_state, struct scene *self) {

    printf("delete scene %p\n", (void *)self);

    delete_vulkan_renderbuffer(vk_state, self->render);

    free(self);
}
