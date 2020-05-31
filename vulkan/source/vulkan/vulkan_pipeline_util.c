#include "vulkan_pipeline_util.h"

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
}

void vulkan_pipeline_initialize(vulkan_state *vk_state, struct vulkan_base *vk_base, struct vulkan_pipeline *pipeline) {

    pipeline->swapchain_image_count = vk_base->swapchain->swapchain_image_count;

    pipeline->uniforms = safe_calloc(1, sizeof(struct vulkan_uniformbuffer));

    vk_create_descriptor_set_layout(vk_state, pipeline);

    vk_create_graphics_pipeline(vk_state, vk_base->swapchain->swapchain_extent, vk_base->vk_render_pass, pipeline);

    vk_create_texture_image(vk_state, vk_base->vk_command_pool, &pipeline->image, "../textures/tiles/grass.png");

    vulkan_renderbuffer_update_data(vk_state, vk_base->vk_command_pool, pipeline->renderbuffer);

    vulkan_uniformbuffer_initialize(vk_state, pipeline->swapchain_image_count, pipeline->uniforms);

    vk_create_descriptor_pool(vk_state, pipeline);
    vk_create_descriptor_sets(vk_state, pipeline);
}

void delete_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    vulkan_pipeline_clean(vk_state, pipeline);

    delete_vulkan_image(vk_state->vk_device, &pipeline->image);

    vkDestroyDescriptorSetLayout(vk_state->vk_device, pipeline->vk_descriptor_set_layout, NULL);

    delete_vulkan_renderbuffer(vk_state, pipeline->renderbuffer);

    free(pipeline->uniforms);

    free(pipeline);
}
