#include "vulkan_pipeline_util.h"

void vulkan_pipeline_cmd_bind(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer) {
    vkCmdBindPipeline(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline);
}

void vulkan_pipeline_cmd_bind_uniform_description(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer, uint32_t image_index) {
    vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline_layout, 0, 1, &pipeline->vk_uniform_buffer_descriptor_sets[image_index], 0, NULL);
}

void vulkan_pipeline_cmd_bind_image_description(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer, uint32_t image_index) {
    vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline_layout, 1, 1, &pipeline->vk_image_descriptor_sets[image_index], 0, NULL);
}

void vulkan_pipeline_cmd_bind_indexed_image_description(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer, uint32_t image_index, uint32_t sample_index) {
    uint32_t index = image_index * pipeline->image_descriptors + sample_index;
    vulkan_pipeline_cmd_bind_image_description(pipeline, command_buffer, index);
}

void vulkan_pipeline_cmd_bind_description(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer, uint32_t image_index) {
    VkDescriptorSet descriptors[2] = {pipeline->vk_uniform_buffer_descriptor_sets[image_index], pipeline->vk_image_descriptor_sets[image_index]};
    vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline_layout, 0, 2, descriptors, 0, NULL);
}

static void vulkan_pipeline_clean(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    vkDestroyPipeline(vk_state->vk_device, pipeline->vk_pipeline, NULL);
    vkDestroyPipelineLayout(vk_state->vk_device, pipeline->vk_pipeline_layout, NULL);
    vulkan_uniform_buffer_clean(vk_state, pipeline->uniforms);
    vkDestroyDescriptorPool(vk_state->vk_device, pipeline->vk_descriptor_pool, NULL);

    free(pipeline->vk_uniform_buffer_descriptor_sets);

    if (pipeline->image_count > 0) {
        free(pipeline->vk_image_descriptor_sets);
    }
}

void vulkan_pipeline_recreate(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    vulkan_pipeline_clean(vk_state, pipeline);
    vk_create_graphics_pipeline(vk_state, vk_base->swapchain->swapchain_extent, vk_base->vk_render_pass, pipeline);
    vulkan_uniform_buffer_initialize(vk_state, pipeline->swapchain_image_count, pipeline->uniforms);
    vk_create_descriptor_pool(vk_state, pipeline);
    vk_create_descriptor_sets(vk_state, pipeline);
    vk_update_descriptor_sets(vk_state, pipeline);
}

void vulkan_pipeline_initialize(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    pipeline->swapchain_image_count = vk_base->swapchain->swapchain_image_count;

    pipeline->uniforms = safe_calloc(1, sizeof(struct vulkan_uniform_buffer));
    pipeline->uniforms->size = sizeof(struct uniform_buffer_projection);

    vk_create_descriptor_set_layouts(vk_state, pipeline);
    vulkan_pipeline_layout(vk_state, pipeline);

    vk_create_graphics_pipeline(vk_state, vk_base->swapchain->swapchain_extent, vk_base->vk_render_pass, pipeline);
    vulkan_uniform_buffer_initialize(vk_state, pipeline->swapchain_image_count, pipeline->uniforms);
    vk_create_descriptor_pool(vk_state, pipeline);
    vk_create_descriptor_sets(vk_state, pipeline);
}

void vulkan_pipeline_static_initialize(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    vulkan_pipeline_initialize(vk_state, vk_base, pipeline);
    vk_update_descriptor_sets(vk_state, pipeline);
}

void delete_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    printf("delete vulkan pipeline %p\n", (void *)pipeline);

    vulkan_pipeline_clean(vk_state, pipeline);

    vkDestroyDescriptorSetLayout(vk_state->vk_device, pipeline->vk_uniform_buffer_descriptor_set_layout, NULL);

    if (pipeline->image_count > 0) {
        vkDestroyDescriptorSetLayout(vk_state->vk_device, pipeline->vk_image_descriptor_set_layout, NULL);
    }

    delete_vulkan_pipe_settings(&pipeline->pipe_settings);

    free(pipeline->uniforms);
    free(pipeline->images);
    free(pipeline);
}
