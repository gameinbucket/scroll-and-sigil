#include "vulkan_pipeline_util.h"

void vulkan_pipeline_draw(struct vulkan_pipeline *pipeline, struct vulkan_renderbuffer *renderbuffer, VkCommandBuffer command_buffer, uint32_t image_index) {

    VkPipeline vk_pipeline = pipeline->vk_pipeline;
    VkPipelineLayout vk_pipeline_layout = pipeline->vk_pipeline_layout;
    VkDescriptorSet *vk_descriptor_set = &pipeline->vk_descriptor_sets[image_index];

    VkBuffer vk_vertex_buffer = renderbuffer->vk_vertex_buffer;
    VkBuffer vk_index_buffer = renderbuffer->vk_index_buffer;
    uint32_t indice_count = renderbuffer->index_count;

    vkCmdBindPipeline(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, vk_pipeline);
    vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, vk_pipeline_layout, 0, 1, vk_descriptor_set, 0, NULL);

    VkBuffer vertex_buffers[1] = {vk_vertex_buffer};
    VkDeviceSize vertex_offsets[1] = {0};

    vkCmdBindVertexBuffers(command_buffer, 0, 1, vertex_buffers, vertex_offsets);
    vkCmdBindIndexBuffer(command_buffer, vk_index_buffer, 0, VK_INDEX_TYPE_UINT32);

    vkCmdDrawIndexed(command_buffer, indice_count, 1, 0, 0, 0);
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

    vk_create_descriptors(vk_state, pipeline);
}

void vulkan_pipeline_initialize(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    pipeline->swapchain_image_count = vk_base->swapchain->swapchain_image_count;

    pipeline->uniforms = safe_calloc(1, sizeof(struct vulkan_uniformbuffer));

    vk_create_descriptor_set_layout(vk_state, pipeline);

    vk_create_graphics_pipeline(vk_state, vk_base->swapchain->swapchain_extent, vk_base->vk_render_pass, pipeline);

    vulkan_renderbuffer_update_data(vk_state, vk_base->vk_command_pool, pipeline->renderbuffer);

    vulkan_uniformbuffer_initialize(vk_state, pipeline->swapchain_image_count, pipeline->uniforms);

    vk_create_descriptors(vk_state, pipeline);
}

void delete_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    vulkan_pipeline_clean(vk_state, pipeline);

    vkDestroyDescriptorSetLayout(vk_state->vk_device, pipeline->vk_descriptor_set_layout, NULL);

    delete_vulkan_renderbuffer(vk_state, pipeline->renderbuffer);

    free(pipeline->uniforms);

    free(pipeline);
}
