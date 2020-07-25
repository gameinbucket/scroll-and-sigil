#include "scene.h"

struct scene *create_scene(struct texture_colored_3d_shader *shader, struct vulkan_render_buffer *render) {

    struct scene *self = safe_calloc(1, sizeof(struct scene));

    self->shader = shader;
    self->render = render;

    return self;
}

void scene_render(struct vulkan_state *vk_state, struct vulkan_base *vk_base, struct scene *self, VkCommandBuffer command_buffer, uint32_t image_index) {

    struct texture_colored_3d_shader *shader = self->shader;
    struct vulkan_pipeline *pipeline = shader->pipeline;

    {
        struct uniform_projection ubo = {0};

        float width = (float)vk_base->swapchain->swapchain_extent.width;
        float height = (float)vk_base->swapchain->swapchain_extent.height;
        float ratio = width / height;

        float view[16];
        float perspective[16];
        float correction[16];
        float original[16];

        static float x = 0.0f;
        x += 0.01f;
        vec3 eye = {3 + x, 3, 5};
        vec3 center = {0, 0, 0};
        matrix_look_at(view, &eye, &center);
        matrix_translate(view, -eye.x, -eye.y, -eye.z);

        matrix_vulkan_correction(correction);
        matrix_perspective_vulkan(original, 60.0, 0.01, 100, ratio);
        matrix_multiply(perspective, correction, original);

        matrix_multiply(ubo.mvp, perspective, view);

        vulkan_copy_memory(shader->uniforms->mapped_memory[image_index], &ubo, sizeof(ubo));
    }

    vulkan_pipeline_cmd_bind(pipeline, command_buffer);

    // VkDescriptorSet descriptors[2] = {
    //     shader->descriptor_sets[image_index],
    //     image_descriptor_system_get(self->image_descriptors, TEXTURE_PLANK_FLOOR),
    // };
    // vulkan_pipeline_cmd_bind_set(pipeline, command_buffer, 0, 2, descriptors);

    VkDescriptorSet image_descriptor = image_descriptor_system_get(self->image_descriptors, TEXTURE_PLANK_FLOOR);

    vulkan_pipeline_cmd_bind_set(pipeline, command_buffer, 0, 1, &shader->descriptor_sets[image_index]);
    vulkan_pipeline_cmd_bind_set(pipeline, command_buffer, 1, 1, &image_descriptor);

    vulkan_render_buffer_draw(self->render, command_buffer);
}

void delete_scene(struct vulkan_state *vk_state, struct scene *self) {

    delete_vulkan_renderbuffer(vk_state, self->render);

    free(self);
}
