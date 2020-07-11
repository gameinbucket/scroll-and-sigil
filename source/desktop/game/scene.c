#include "scene.h"

struct scene *create_scene(struct vulkan_pipeline *pipeline, struct vulkan_render_buffer *render) {

    struct scene *self = safe_calloc(1, sizeof(struct scene));

    self->pipeline = pipeline;
    self->render = render;

    return self;
}

void scene_render(struct vulkan_state *vk_state, struct vulkan_base *vk_base, struct scene *self, VkCommandBuffer command_buffer, uint32_t image_index) {

    struct vulkan_pipeline *pipeline = self->pipeline;

    vulkan_pipeline_cmd_bind(pipeline, command_buffer);

    VkDescriptorSet descriptors[2] = {
        pipeline->pipe_data.sets[0].descriptor_sets[image_index],
        image_descriptor_system_get(self->image_descriptors, TEXTURE_PLANK_FLOOR),
    };

    vulkan_pipeline_cmd_bind_given_description(pipeline, command_buffer, 2, descriptors);

    vulkan_render_buffer_draw(self->render, command_buffer);

    struct uniform_projection ubo = {0};

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

    struct vulkan_uniform_buffer *uniform_buffer = pipeline->pipe_data.sets[0].items[0].uniforms;
    vulkan_copy_memory(uniform_buffer->mapped_memory[image_index], &ubo, sizeof(ubo));
}

void delete_scene(struct vulkan_state *vk_state, struct scene *self) {

    delete_vulkan_renderbuffer(vk_state, self->render);

    free(self);
}
