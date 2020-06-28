#include "vulkan_pipeline_util.h"

void vulkan_pipeline_cmd_bind(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer) {
    vkCmdBindPipeline(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline);
}

void vulkan_pipeline_cmd_bind_description(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer, uint32_t set_index, uint32_t image_index) {
    VkDescriptorSet descriptor = pipeline->pipe_data.sets[set_index].descriptor_sets[image_index];
    vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline_layout, set_index, 1, &descriptor, 0, NULL);
}

void vulkan_pipeline_cmd_bind_set(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer, uint32_t set, uint32_t count, VkDescriptorSet *descriptors) {
    vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline_layout, set, count, descriptors, 0, NULL);
}

void vulkan_pipeline_cmd_bind_given_description(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer, uint32_t count, VkDescriptorSet *descriptors) {
    vulkan_pipeline_cmd_bind_set(pipeline, command_buffer, 0, count, descriptors);
}

static void vulkan_pipeline_clean(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    vkDestroyPipeline(vk_state->vk_device, pipeline->vk_pipeline, NULL);
    vkDestroyPipelineLayout(vk_state->vk_device, pipeline->vk_pipeline_layout, NULL);

    vulkan_pipe_data_clean(vk_state, &pipeline->pipe_data);
}

void vulkan_pipeline_recreate(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    vulkan_pipeline_clean(vk_state, pipeline);

    vulkan_pipe_data_initialize_uniforms(vk_state, &pipeline->pipe_data);
    vulkan_pipeline_create_descriptor_pool(vk_state, pipeline);
    vulkan_pipeline_create_descriptor_sets(vk_state, pipeline);

    vulkan_pipeline_compile_graphics(vk_state, vk_base->swapchain->swapchain_extent, vk_base->vk_render_pass, pipeline);

    vulkan_pipeline_update_descriptor_sets(vk_state, pipeline);
}

void vulkan_pipeline_initialize(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    pipeline->swapchain_image_count = vk_base->swapchain->swapchain_image_count;

    vulkan_pipeline_create_descriptor_layouts(vk_state, pipeline);

    vulkan_pipe_data_initialize_uniforms(vk_state, &pipeline->pipe_data);
    vulkan_pipeline_create_descriptor_pool(vk_state, pipeline);
    vulkan_pipeline_create_descriptor_sets(vk_state, pipeline);

    vulkan_pipeline_compile_graphics(vk_state, vk_base->swapchain->swapchain_extent, vk_base->vk_render_pass, pipeline);
}

void vulkan_pipeline_static_initialize(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    vulkan_pipeline_initialize(vk_state, vk_base, pipeline);
    vulkan_pipeline_update_descriptor_sets(vk_state, pipeline);
}

void delete_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    vulkan_pipeline_clean(vk_state, pipeline);
    delete_vulkan_pipe_data(vk_state, &pipeline->pipe_data);

    free(pipeline);
}
