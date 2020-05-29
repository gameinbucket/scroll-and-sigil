#include "vulkan_pipeline_util.h"

static void vulkan_pipeline_clean_swapchain(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    VkDevice device = vk_state->vk_device;

    destroy_vulkan_depth(device, &pipeline->depth);

    for (uint32_t i = 0; i < pipeline->swapchain->swapchain_image_count; i++) {
        vkDestroyFramebuffer(device, pipeline->vk_framebuffers[i], NULL);
    }

    vkFreeCommandBuffers(device, pipeline->vk_command_pool, pipeline->swapchain->swapchain_image_count, pipeline->vk_command_buffers);

    vkDestroyPipeline(device, pipeline->vk_pipeline, NULL);
    vkDestroyPipelineLayout(device, pipeline->vk_pipeline_layout, NULL);
    vkDestroyRenderPass(device, pipeline->vk_render_pass, NULL);

    for (uint32_t i = 0; i < pipeline->swapchain->swapchain_image_count; i++) {
        vkDestroyImageView(device, pipeline->swapchain->swapchain_image_views[i], NULL);
    }

    vkDestroySwapchainKHR(device, pipeline->swapchain->vk_swapchain, NULL);

    for (uint32_t i = 0; i < pipeline->swapchain->swapchain_image_count; i++) {
        vkDestroyBuffer(device, pipeline->uniforms->vk_uniform_buffers[i], NULL);
        vkFreeMemory(device, pipeline->uniforms->vk_uniform_buffers_memory[i], NULL);
    }

    vkDestroyDescriptorPool(device, pipeline->vk_descriptor_pool, NULL);
}

void vulkan_pipeline_build_command_buffers(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    uint32_t size = pipeline->swapchain->swapchain_image_count;

    VkCommandBuffer *command_buffers = safe_calloc(size, sizeof(VkCommandBuffer));

    VkCommandBufferAllocateInfo command_buffer_alloc_info = {0};
    command_buffer_alloc_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO;
    command_buffer_alloc_info.commandPool = pipeline->vk_command_pool;
    command_buffer_alloc_info.level = VK_COMMAND_BUFFER_LEVEL_PRIMARY;
    command_buffer_alloc_info.commandBufferCount = size;

    if (vkAllocateCommandBuffers(vk_state->vk_device, &command_buffer_alloc_info, command_buffers) != VK_SUCCESS) {
        fprintf(stderr, "Error: Vulkan Allocate Command Buffers\n");
        exit(1);
    }

    for (uint32_t i = 0; i < size; i++) {

        VkCommandBuffer command_buffer = command_buffers[i];

        VkCommandBufferBeginInfo command_begin_info = {0};
        command_begin_info.sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO;

        if (vkBeginCommandBuffer(command_buffer, &command_begin_info) != VK_SUCCESS) {
            fprintf(stderr, "Error: Vulkan Begin Command Buffer\n");
            exit(1);
        }

        VkRenderPassBeginInfo render_pass_info = {0};
        render_pass_info.sType = VK_STRUCTURE_TYPE_RENDER_PASS_BEGIN_INFO;
        render_pass_info.renderPass = pipeline->vk_render_pass;
        render_pass_info.framebuffer = pipeline->vk_framebuffers[i];
        render_pass_info.renderArea.offset = (VkOffset2D){0, 0};
        render_pass_info.renderArea.extent = pipeline->swapchain->swapchain_extent;

        VkClearValue clear_color = {.color = (VkClearColorValue){{0.0f, 0.0f, 0.0f, 1.0f}}};
        VkClearValue clear_depth = {.depthStencil = (VkClearDepthStencilValue){1.0f, 0}};

        VkClearValue clear_values[2] = {clear_color, clear_depth};

        render_pass_info.pClearValues = clear_values;
        render_pass_info.clearValueCount = 2;

        vkCmdBeginRenderPass(command_buffer, &render_pass_info, VK_SUBPASS_CONTENTS_INLINE);

        vkCmdBindPipeline(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline);

        VkBuffer vertex_buffers[1] = {pipeline->renderbuffer->vk_vertex_buffer};
        VkDeviceSize vertex_offsets[1] = {0};
        vkCmdBindVertexBuffers(command_buffer, 0, 1, vertex_buffers, vertex_offsets);

        vkCmdBindIndexBuffer(command_buffer, pipeline->renderbuffer->vk_index_buffer, 0, VK_INDEX_TYPE_UINT32);

        vkCmdBindDescriptorSets(command_buffer, VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline->vk_pipeline_layout, 0, 1, &pipeline->vk_descriptor_sets[i], 0, NULL);

        vkCmdDrawIndexed(command_buffer, pipeline->renderbuffer->index_count, 1, 0, 0, 0);

        vkCmdEndRenderPass(command_buffer);

        if (vkEndCommandBuffer(command_buffer) != VK_SUCCESS) {
            fprintf(stderr, "Error: Vulkan End Command Buffer\n");
            exit(1);
        }
    }

    pipeline->vk_command_buffers = command_buffers;
}

void vulkan_pipeline_recreate_swapchain(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t width, uint32_t height) {

    VkResult vkres = vkDeviceWaitIdle(vk_state->vk_device);
    vk_ok(vkres);

    vulkan_pipeline_clean_swapchain(vk_state, pipeline);

    vk_create_swapchain(vk_state, pipeline->swapchain, width, height);
    vk_create_swapchain_image_views(vk_state, pipeline->swapchain);
    vk_choose_depth_format(vk_state, &pipeline->depth);
    vk_create_render_pass(vk_state, pipeline);
    vk_create_graphics_pipeline(vk_state, pipeline, pipeline->swapchain);
    vk_create_depth_resources(vk_state, pipeline->swapchain, &pipeline->depth);
    vk_create_framebuffers(vk_state, pipeline);
    vk_create_uniform_buffers(vk_state, pipeline);
    vk_create_descriptor_pool(vk_state, pipeline);
    vk_create_descriptor_sets(vk_state, pipeline);
    vulkan_pipeline_create_command_buffers(vk_state, pipeline);
}

void initialize_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *pipeline, uint32_t width, uint32_t height) {

    pipeline->swapchain = safe_calloc(1, sizeof(struct vulkan_swapchain));
    pipeline->uniforms = safe_calloc(1, sizeof(struct vulkan_uniformbuffer));

    vk_create_swapchain(vk_state, pipeline->swapchain, width, height);
    vk_create_swapchain_image_views(vk_state, pipeline->swapchain);
    vk_choose_depth_format(vk_state, &pipeline->depth);
    vk_create_render_pass(vk_state, pipeline);
    vk_create_descriptor_set_layout(vk_state, pipeline);
    vk_create_graphics_pipeline(vk_state, pipeline, pipeline->swapchain);
    vk_create_command_pool(vk_state, &pipeline->vk_command_pool);
    vk_create_depth_resources(vk_state, pipeline->swapchain, &pipeline->depth);
    vk_create_framebuffers(vk_state, pipeline);
    vk_create_texture_image(vk_state, pipeline->vk_command_pool, &pipeline->image, "../textures/tiles/grass.png");
    vulkan_renderbuffer_update_data(vk_state, pipeline->vk_command_pool, pipeline->renderbuffer);
    vk_create_uniform_buffers(vk_state, pipeline);
    vk_create_descriptor_pool(vk_state, pipeline);
    vk_create_descriptor_sets(vk_state, pipeline);
    vulkan_pipeline_build_command_buffers(vk_state, pipeline);
    vk_create_semaphores(vk_state, pipeline);
}

void delete_vulkan_pipeline(vulkan_state *vk_state, struct vulkan_pipeline *pipeline) {

    vulkan_pipeline_clean_swapchain(vk_state, pipeline);

    destroy_vulkan_image(vk_state->vk_device, &pipeline->image);

    vkDestroyDescriptorSetLayout(vk_state->vk_device, pipeline->vk_descriptor_set_layout, NULL);

    for (int i = 0; i < VULKAN_MAX_FRAMES_IN_FLIGHT; i++) {
        vkDestroySemaphore(vk_state->vk_device, pipeline->vk_render_finished_semaphores[i], NULL);
        vkDestroySemaphore(vk_state->vk_device, pipeline->vk_image_available_semaphores[i], NULL);
        vkDestroyFence(vk_state->vk_device, pipeline->vk_flight_fences[i], NULL);
    }

    vkDestroyCommandPool(vk_state->vk_device, pipeline->vk_command_pool, NULL);

    delete_vulkan_renderbuffer(vk_state, pipeline->renderbuffer);
    delete_vulkan_swapchain(pipeline->swapchain);
    delete_vulkan_uniform_buffer(pipeline->uniforms);

    free(pipeline->vk_descriptor_sets);
    free(pipeline->vk_framebuffers);
    free(pipeline->vk_command_buffers);
    free(pipeline->vk_flight_fences);
    free(pipeline->vk_images_in_flight);
    free(pipeline->vk_image_available_semaphores);
    free(pipeline->vk_render_finished_semaphores);

    free(pipeline);
}
