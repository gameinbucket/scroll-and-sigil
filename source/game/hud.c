#include "hud.h"

struct hud *create_hud(struct vulkan_pipeline *pipeline, struct vulkan_render_buffer *render) {

    struct hud *self = safe_calloc(1, sizeof(struct hud));

    self->pipeline = pipeline;
    self->render = render;

    return self;
}

void hud_render(struct vulkan_state *vk_state, struct vulkan_base *vk_base, struct hud *self, VkCommandBuffer command_buffer, uint32_t image_index) {

    vulkan_pipeline_cmd_bind(self->pipeline, command_buffer);
    vulkan_pipeline_cmd_bind_uniform_description(self->pipeline, command_buffer, image_index);
    vulkan_render_buffer_draw(self->render, command_buffer);

    struct uniform_buffer_projection ubo = {0};

    float view[16];
    float ortho[16];

    matrix_identity(view);
    matrix_translate(view, 0, 0, 0);

    float width = (float)vk_base->swapchain->swapchain_extent.width;
    float height = (float)vk_base->swapchain->swapchain_extent.height;

    // matrix_orthographic_vulkan(ortho, 0, width, 0, height, -1, 1);

    float correction[16];
    matrix_vulkan_correction(correction);
    float original[16];
    matrix_orthographic(original, 0, width, 0, height, -1, 1);
    matrix_multiply(ortho, correction, original);

    matrix_multiply(ubo.mvp, ortho, view);

    vulkan_uniform_mem_copy(vk_state, self->pipeline->uniforms->vk_uniform_buffers_memory[image_index], &ubo, sizeof(ubo));
}

void delete_hud(struct vulkan_state *vk_state, struct hud *self) {

    printf("delete hud %p\n", (void *)self);

    delete_vulkan_renderbuffer(vk_state, self->render);

    free(self);
}
