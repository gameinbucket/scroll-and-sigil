#include "vulkan_pipeline_util.h"

void vulkan_pipeline_cmd_bind(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer) {
    vkCmdBindPipeline(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline);
}

void vulkan_pipeline_cmd_bind_description(struct vulkan_pipeline *pipeline, VkCommandBuffer command_buffer, uint32_t image_index) {
    vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline_layout, 0, 1, &pipeline->vk_descriptor_sets[image_index], 0, NULL);
}

void vulkan_pipeline_draw(struct vulkan_pipeline *pipeline, struct vulkan_render_buffer *renderbuffer, VkCommandBuffer command_buffer, uint32_t image_index) {

    vulkan_pipeline_cmd_bind(pipeline, command_buffer);
    vulkan_pipeline_cmd_bind_description(pipeline, command_buffer, image_index);

    vulkan_render_buffer_draw(renderbuffer, command_buffer);
}

static void vulkan_pipeline_clean(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    vkDestroyPipeline(vk_state->vk_device, pipeline->vk_pipeline, NULL);
    vkDestroyPipelineLayout(vk_state->vk_device, pipeline->vk_pipeline_layout, NULL);
    vulkan_uniformbuffer_clean(vk_state, pipeline->uniforms);
    vkDestroyDescriptorPool(vk_state->vk_device, pipeline->vk_descriptor_pool, NULL);

    free(pipeline->vk_descriptor_sets);
}

void vulkan_pipeline_recreate(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    vulkan_pipeline_clean(vk_state, pipeline);
    vk_create_graphics_pipeline(vk_state, vk_base->swapchain->swapchain_extent, vk_base->vk_render_pass, pipeline);
    vulkan_uniformbuffer_initialize(vk_state, pipeline->swapchain_image_count, pipeline->uniforms);
    vk_create_descriptor_pool(vk_state, pipeline);
    vk_create_descriptor_sets(vk_state, pipeline);
    vk_update_descriptor_sets(vk_state, pipeline);
}

void vulkan_pipeline_initialize(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    pipeline->swapchain_image_count = vk_base->swapchain->swapchain_image_count;

    pipeline->uniforms = safe_calloc(1, sizeof(struct vulkan_uniform_buffer));

    vk_create_descriptor_set_layout(vk_state, pipeline);
    vk_create_graphics_pipeline(vk_state, vk_base->swapchain->swapchain_extent, vk_base->vk_render_pass, pipeline);
    vulkan_uniformbuffer_initialize(vk_state, pipeline->swapchain_image_count, pipeline->uniforms);
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
    vkDestroyDescriptorSetLayout(vk_state->vk_device, pipeline->vk_descriptor_set_layout, NULL);

    free(pipeline->uniforms);
    free(pipeline->images);
    free(pipeline);
}
