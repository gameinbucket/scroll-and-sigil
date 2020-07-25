#include "hud.h"

struct hud *create_hud(struct color_2d_shader *shader, struct vulkan_render_buffer *render) {

    struct hud *self = safe_calloc(1, sizeof(struct hud));

    self->shader = shader;
    self->render = render;

    return self;
}

void hud_render(struct vulkan_state *vk_state, struct vulkan_base *vk_base, struct hud *self, VkCommandBuffer command_buffer, uint32_t image_index) {

    struct color_2d_shader *shader = self->shader;
    struct vulkan_pipeline *pipeline = shader->pipeline;

    {
        struct uniform_projection ubo = {0};

        float width = (float)vk_base->swapchain->swapchain_extent.width;
        float height = (float)vk_base->swapchain->swapchain_extent.height;

        float view[16];
        float orthographic[16];
        float correction[16];
        float original[16];

        matrix_identity(view);
        matrix_translate(view, 0, 0, 0);

        matrix_vulkan_correction(correction);
        matrix_orthographic(original, 0, width, 0, height, -1, 1);
        matrix_multiply(orthographic, correction, original);

        matrix_multiply(ubo.mvp, orthographic, view);

        vulkan_copy_memory(shader->uniforms->mapped_memory[image_index], &ubo, sizeof(ubo));
    }

    vulkan_pipeline_cmd_bind(pipeline, command_buffer);

    vulkan_pipeline_cmd_bind_set(pipeline, command_buffer, 0, 1, &shader->descriptor_sets[image_index]);

    vulkan_render_buffer_draw(self->render, command_buffer);
}

void delete_hud(struct vulkan_state *vk_state, struct hud *self) {

    delete_vulkan_renderbuffer(vk_state, self->render);

    free(self);
}
